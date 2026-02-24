import { useState } from 'react';
import * as Contacts from 'expo-contacts';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';

interface ContactInfo {
  name: string;
  phone: string;
}

export function useContactImport() {
  const [permissionStatus, setPermissionStatus] = useState<Contacts.PermissionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [matched, setMatched] = useState<User[]>([]);
  const [unmatched, setUnmatched] = useState<ContactInfo[]>([]);
  const [ran, setRan] = useState(false);

  const normalizePhone = (raw: string): string | null => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
    if (raw.startsWith('+') && digits.length >= 10) return `+${digits}`;
    return null;
  };

  const requestAndImport = async () => {
    setLoading(true);

    const { status } = await Contacts.requestPermissionsAsync();
    setPermissionStatus(status);

    if (status !== 'granted') {
      setLoading(false);
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
    });

    // Build a map of normalized phone → contact name
    const phoneToContact = new Map<string, string>();
    for (const contact of data) {
      if (!contact.phoneNumbers) continue;
      for (const pn of contact.phoneNumbers) {
        if (!pn.number) continue;
        const normalized = normalizePhone(pn.number);
        if (normalized && !phoneToContact.has(normalized)) {
          phoneToContact.set(normalized, contact.name || 'Unknown');
        }
      }
    }

    const allPhones = Array.from(phoneToContact.keys());
    if (allPhones.length === 0) {
      setMatched([]);
      setUnmatched([]);
      setRan(true);
      setLoading(false);
      return;
    }

    // Call RPC in chunks of 500
    const matchedUsers: User[] = [];
    const matchedPhones = new Set<string>();
    const chunkSize = 500;

    for (let i = 0; i < allPhones.length; i += chunkSize) {
      const chunk = allPhones.slice(i, i + chunkSize);
      const { data: users } = await supabase.rpc('find_users_by_phone', {
        phone_numbers: chunk,
      });
      if (users) {
        for (const u of users) {
          matchedUsers.push(u as unknown as User);
          if (u.phone) matchedPhones.add(u.phone);
        }
      }
    }

    // Build unmatched list
    const unmatchedContacts: ContactInfo[] = [];
    for (const [phone, name] of phoneToContact) {
      if (!matchedPhones.has(phone)) {
        unmatchedContacts.push({ name, phone });
      }
    }

    setMatched(matchedUsers);
    setUnmatched(unmatchedContacts);
    setRan(true);
    setLoading(false);
  };

  return { permissionStatus, loading, matched, unmatched, ran, requestAndImport };
}
