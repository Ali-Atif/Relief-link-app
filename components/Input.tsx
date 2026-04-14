import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

import { colors, radii, spacing } from '../utils/constants';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  /** Ionicons name for a leading icon (optional) */
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  /** Whether the input should be a password field with toggle */
  secure?: boolean;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, leadingIcon, secure = false, style, ...textInputProps },
  ref,
) {
  const [isSecure, setIsSecure] = useState(secure);

  const toggleSecure = () => {
    setIsSecure((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        {leadingIcon ? (
          <Ionicons name={leadingIcon} size={20} color={colors.textMuted} style={styles.leadingIcon} />
        ) : null}
        <TextInput
          ref={ref}
          style={[styles.input, leadingIcon && styles.inputWithLeading, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecure}
          autoCapitalize={secure ? 'none' : 'sentences'}
          {...textInputProps}
        />
        {secure ? (
          <TouchableOpacity onPress={toggleSecure} style={styles.eyeButton} activeOpacity={0.6}>
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  inputWrapError: {
    borderColor: colors.emergency,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
  },
  inputWithLeading: {
    paddingLeft: spacing.xs,
  },
  leadingIcon: {
    paddingLeft: spacing.md,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: colors.emergency,
    fontWeight: '600',
    paddingLeft: spacing.xs,
  },
});
