import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
import { formLabel, inputSurface } from '../theme/inputs';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  error?: string | null;
}

export function FormField({ label, hint, error, multiline, ...inputProps }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        placeholderTextColor={colors.mutedLight}
        style={[styles.input, multiline && styles.multiline, error ? styles.inputError : null, inputProps.editable === false && styles.readOnly]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: formLabel,
  input: inputSurface,
  multiline: {
    minHeight: 120,
  },
  inputError: {
    borderColor: colors.errorBorder,
  },
  readOnly: {
    backgroundColor: colors.surfaceMuted,
    color: colors.muted,
  },
  hint: {
    ...typography.caption,
  },
  error: {
    ...typography.caption,
    color: colors.errorText,
  },
});
