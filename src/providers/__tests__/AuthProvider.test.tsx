import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockFrom = jest.fn();

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...a: unknown[]) => mockGetSession(...a),
      onAuthStateChange: (...a: unknown[]) => mockOnAuthStateChange(...a),
    },
    from: (...a: unknown[]) => mockFrom(...a),
  },
}));

import { AuthProvider, useAuth } from '../AuthProvider';

const PROFILE = { id: 'u1', display_name: 'Ada' };

function profileChain(profile: unknown) {
  return {
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: profile })),
      })),
    })),
  };
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthProvider', () => {
  let authCallback: (event: string, session: unknown) => void;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockImplementation((cb: typeof authCallback) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    mockFrom.mockImplementation(() => profileChain(PROFILE));
  });

  it('does NOT read from the DB synchronously inside the onAuthStateChange callback (deadlock guard)', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockFrom.mockClear();
    let callsDuringCallback = -1;
    act(() => {
      authCallback('SIGNED_IN', { user: { id: 'u1' } });
      // Captured before React flushes the state update + profile effect.
      callsDuringCallback = mockFrom.mock.calls.length;
    });

    // The whole point of the P0 fix: the auth-state callback must stay
    // synchronous and never touch the DB (doing so re-enters the auth-token
    // Web Lock and deadlocks every later request).
    expect(callsDuringCallback).toBe(0);

    // The profile load instead happens in a separate effect, after the session updates.
    await waitFor(() => expect(mockFrom).toHaveBeenCalledWith('users'));
  });

  it('loads the profile in a separate effect once a session exists', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      authCallback('SIGNED_IN', { user: { id: 'u1' } });
    });

    await waitFor(() => expect(result.current.profile).toEqual(PROFILE));
    expect(result.current.session).toEqual({ user: { id: 'u1' } });
  });

  it('clears the profile on sign-out', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => authCallback('SIGNED_IN', { user: { id: 'u1' } }));
    await waitFor(() => expect(result.current.profile).toEqual(PROFILE));

    act(() => authCallback('SIGNED_OUT', null));
    await waitFor(() => expect(result.current.profile).toBeNull());
  });
});
