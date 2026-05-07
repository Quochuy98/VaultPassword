import type { SupabaseClient, User } from '@supabase/supabase-js';
import { decrypt, deriveKeyFromPassword, encrypt, generateSalt, saltToBase64 } from './encryption';
import { getPasswords, updatePassword } from '../services/passwordService';

type Notify = (message: string, variant: 'success' | 'error') => void;

type RotateVaultPasswordInput = {
  user: User | null;
  vaultKey: CryptoKey | null;
  supabase: SupabaseClient;
  lockVault: () => void;
  unlockVault: (masterPassword: string) => Promise<{ error: Error | null }>;
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
  pushNotify: Notify;
};

export async function rotateVaultPassword({
  user,
  vaultKey,
  supabase,
  lockVault,
  unlockVault,
  currentPassword,
  nextPassword,
  confirmPassword,
  pushNotify,
}: RotateVaultPasswordInput): Promise<boolean> {
  if (!user || !vaultKey) {
    pushNotify('Vui lòng mở khóa vault trước khi đổi mật khẩu.', 'error');
    return false;
  }
  if (!currentPassword || !nextPassword) {
    pushNotify('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.', 'error');
    return false;
  }
  if (nextPassword.length < 8) {
    pushNotify('Mật khẩu vault mới cần tối thiểu 8 ký tự.', 'error');
    return false;
  }
  if (nextPassword !== confirmPassword) {
    pushNotify('Xác nhận mật khẩu vault mới không khớp.', 'error');
    return false;
  }

  try {
    const rowsResult = await getPasswords(supabase);
    if (rowsResult.error) {
      pushNotify(rowsResult.error.message, 'error');
      return false;
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      pushNotify(userErr?.message ?? 'Không thể xác thực người dùng hiện tại.', 'error');
      return false;
    }

    const currentSaltB64 = userData.user.user_metadata?.vault_salt as string | undefined;
    if (!currentSaltB64) {
      pushNotify('Vault chưa được thiết lập khóa hiện tại.', 'error');
      return false;
    }

    const verifiedCurrentKey = await deriveKeyFromPassword(
      currentPassword,
      Uint8Array.from(atob(currentSaltB64), (char) => char.charCodeAt(0)),
    );

    const newSalt = generateSalt();
    const newKey = await deriveKeyFromPassword(nextPassword, newSalt);
    const rows = rowsResult.data ?? [];

    for (const row of rows) {
      const plainPassword = await decrypt(
        row.encrypted_password,
        row.iv_password,
        verifiedCurrentKey,
      );
      const encryptedPassword = await encrypt(plainPassword, newKey);

      let encryptedNotes: string | null = null;
      let ivNotes: string | null = null;
      if (row.encrypted_notes && row.iv_notes) {
        const plainNotes = await decrypt(row.encrypted_notes, row.iv_notes, verifiedCurrentKey);
        const notesCipher = await encrypt(plainNotes, newKey);
        encryptedNotes = notesCipher.ciphertext;
        ivNotes = notesCipher.iv;
      }

      const { error } = await updatePassword(supabase, row.id, {
        encrypted_password: encryptedPassword.ciphertext,
        iv_password: encryptedPassword.iv,
        encrypted_notes: encryptedNotes,
        iv_notes: ivNotes,
      });
      if (error) {
        pushNotify(error.message, 'error');
        return false;
      }
    }

    const newSaltB64 = saltToBase64(newSalt);
    const { error: updateUserErr } = await supabase.auth.updateUser({
      data: { vault_salt: newSaltB64 },
    });
    if (updateUserErr) {
      pushNotify(updateUserErr.message, 'error');
      return false;
    }

    const unlocked = await unlockVault(nextPassword);
    if (unlocked.error) {
      pushNotify(unlocked.error.message, 'error');
      return false;
    }

    pushNotify('Đã đổi mật khẩu vault thành công.', 'success');
    window.setTimeout(() => {
      lockVault();
    }, 1200);

    return true;
  } catch {
    pushNotify('Đổi mật khẩu vault thất bại. Kiểm tra mật khẩu hiện tại.', 'error');
    return false;
  }
}
