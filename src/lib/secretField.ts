const DEFAULT_MAX_MASK_DOTS = 14;

type SecretSource = {
  password?: string;
  cardNumber?: string;
  personalId?: string;
};

type SecretFieldKind = 'password' | 'card' | 'personal';

export type SecretFieldMeta = {
  kind: SecretFieldKind;
  label: string;
  rawValue: string;
  displayValue: string;
};

/**
 * Resolve primary secret field metadata for display/copy behavior.
 */
export function getSecretFieldMeta(source: SecretSource): SecretFieldMeta {
  if (source.password) {
    return {
      kind: 'password',
      label: 'Mật khẩu',
      rawValue: source.password,
      displayValue: '',
    };
  }

  if (source.cardNumber) {
    const lastFourDigits = source.cardNumber.replace(/\D/g, '').slice(-4);

    return {
      kind: 'card',
      label: 'Số thẻ',
      rawValue: source.cardNumber,
      displayValue: lastFourDigits ? `•••• ${lastFourDigits}` : source.cardNumber,
    };
  }

  return {
    kind: 'personal',
    label: 'CMND/CCCD',
    rawValue: source.personalId ?? '',
    displayValue: source.personalId ?? '',
  };
}

/**
 * Build a masked secret preview using dot characters.
 */
export function getMaskedSecretPreview(value: string, maxDots = DEFAULT_MAX_MASK_DOTS): string {
  if (!value) return '';

  return '•'.repeat(Math.min(maxDots, value.length));
}
