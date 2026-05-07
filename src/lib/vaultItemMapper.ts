import { decrypt } from './encryption';
import type { PasswordRow } from '../services/passwordService';

export interface VaultItem {
  id: string;
  type: 'password' | 'card' | 'personal';
  title: string;
  username?: string;
  email?: string;
  password?: string;
  notes?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  personalId?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  icon?: string;
  color?: string;
}

type VisualMeta = { icon?: string; color?: string };

const WEBSITE_VISUALS: Array<{ keywords: string[]; icon: string; color?: string }> = [
  {
    keywords: ['google', 'gmail'],
    icon: 'https://cdn.simpleicons.org/google/4285F4',
  },
  {
    keywords: ['facebook', 'fb'],
    icon: 'https://cdn.simpleicons.org/facebook/1877F2',
    color: '#1877F2',
  },
  {
    keywords: ['github'],
    icon: 'https://cdn.simpleicons.org/github/181717',
  },
  {
    keywords: ['fconline', 'fc online', 'ea sports fc'],
    icon: 'https://cdn.simpleicons.org/ea/0047AB',
    color: '#0047AB',
  },
];

function resolveWebsiteVisual(title: string): VisualMeta {
  const normalized = title.toLowerCase().trim();
  const matched = WEBSITE_VISUALS.find((v) =>
    v.keywords.some((keyword) => normalized.includes(keyword)),
  );
  return matched ? { icon: matched.icon, color: matched.color } : {};
}

function detectCardBrand(cardNumber: string, title?: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (/^4\d{12}(\d{3})?(\d{3})?$/.test(digits)) return 'visa';
  if (
    /^(5[1-5]\d{14}|2(?:2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(
      digits,
    )
  ) {
    return 'mastercard';
  }
  if (/^3[47]\d{13}$/.test(digits)) return 'amex';
  if (/^(?:2131|1800|35\d{3})\d{11}$/.test(digits)) return 'jcb';
  if (/^6(?:011|5\d{2})\d{12}$/.test(digits)) return 'discover';

  const titleText = (title ?? '').toLowerCase();
  if (titleText.includes('visa')) return 'visa';
  if (titleText.includes('mastercard') || titleText.includes('master card')) return 'mastercard';
  if (titleText.includes('amex') || titleText.includes('american express')) return 'amex';
  if (titleText.includes('jcb')) return 'jcb';
  if (titleText.includes('discover')) return 'discover';
  return 'generic';
}

function resolveCardVisual(cardNumber: string, title?: string): VisualMeta {
  const brand = detectCardBrand(cardNumber, title);
  if (brand === 'visa') {
    return { icon: 'https://cdn.simpleicons.org/visa/1A1F71', color: '#1A1F71' };
  }
  if (brand === 'mastercard') {
    return { icon: 'https://cdn.simpleicons.org/mastercard/EB001B', color: '#EB001B' };
  }
  if (brand === 'amex') {
    return { icon: 'https://cdn.simpleicons.org/americanexpress/2E77BC', color: '#2E77BC' };
  }
  if (brand === 'jcb') {
    return { icon: 'https://cdn.simpleicons.org/jcb/0C4DA2', color: '#0C4DA2' };
  }
  if (brand === 'discover') {
    return { icon: 'https://cdn.simpleicons.org/discover/F76A00', color: '#F76A00' };
  }
  return { color: '#334155' };
}

export async function decryptRowToVaultItem(
  row: PasswordRow,
  key: CryptoKey,
): Promise<VaultItem> {
  const mainSecret = await decrypt(row.encrypted_password, row.iv_password, key);
  let notes: string | undefined;
  let meta: any = {};
  if (row.encrypted_notes && row.iv_notes) {
    notes = await decrypt(row.encrypted_notes, row.iv_notes, key);
    try {
      meta = JSON.parse(notes);
    } catch {
      meta = {};
    }
  }
  const kind = meta.kind as 'password' | 'card' | 'personal' | undefined;
  if (kind === 'card') {
    const cardVisual = resolveCardVisual(mainSecret, row.website);
    return {
      id: row.id,
      type: 'card',
      title: row.website,
      cardHolder: row.username,
      cardNumber: mainSecret,
      expiry: meta.expiry,
      cvv: meta.cvv,
      notes: meta.notes,
      ...cardVisual,
    };
  }
  if (kind === 'personal') {
    return {
      id: row.id,
      type: 'personal',
      title: row.website,
      fullName: row.username,
      personalId: mainSecret,
      email: meta.email,
      phone: meta.phone,
      address: meta.address,
      notes: meta.notes,
    };
  }
  const login = row.username;
  const visual = resolveWebsiteVisual(row.website);
  return {
    id: row.id,
    type: 'password',
    title: row.website,
    ...(login.includes('@') ? { email: login } : { username: login }),
    password: mainSecret,
    notes: notes && !notes.trim().startsWith('{') ? notes : meta.notes,
    ...visual,
  };
}
