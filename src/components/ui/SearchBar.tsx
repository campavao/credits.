import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../../lib/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[500]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    backgroundColor: colors.gray[900],
    color: colors.white,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[800],
  },
});
