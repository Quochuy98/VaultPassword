import { useCallback, useEffect, useState } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { encrypt } from '../lib/encryption';
import { decryptRowToVaultItem, type VaultItem } from '../lib/vaultItemMapper';
import {
  addPassword,
  deletePassword,
  getPasswords,
  updatePassword,
} from '../services/passwordService';

type Notify = (message: string, variant: 'success' | 'error') => void;

type SaveVaultInput = {
  modalTab: 'password' | 'card' | 'personal';
  modalTitle: string;
  modalLogin: string;
  modalPassword: string;
  modalNotes: string;
  modalCardHolder: string;
  modalCardNumber: string;
  modalCardExpiry: string;
  modalCardCvv: string;
  modalPersonalId: string;
  modalPersonalFullName: string;
  modalPersonalEmail: string;
  modalPersonalPhone: string;
  modalPersonalAddress: string;
  editingItem: VaultItem | null;
  onSaved: () => void;
};

type UseVaultItemsOptions = {
  user: User | null;
  vaultKey: CryptoKey | null;
  supabase: SupabaseClient;
  lockVault: () => void;
  pushNotify: Notify;
};

export function useVaultItems({
  user,
  vaultKey,
  supabase,
  lockVault,
  pushNotify,
}: UseVaultItemsOptions) {
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);

  const refreshVaultItems = useCallback(async () => {
    if (!user || !vaultKey) return;
    setVaultLoading(true);
    const { data: rows, error } = await getPasswords(supabase);
    if (error) {
      pushNotify(error.message, 'error');
      setVaultLoading(false);
      return;
    }
    try {
      const items: VaultItem[] = [];
      for (const row of rows ?? []) {
        try {
          items.push(await decryptRowToVaultItem(row, vaultKey));
        } catch {
          lockVault();
          pushNotify('Không thể giải mã vault. Vui lòng nhập lại mật khẩu.', 'error');
          setVaultItems([]);
          setVaultLoading(false);
          return;
        }
      }
      setVaultItems(items);
    } finally {
      setVaultLoading(false);
    }
  }, [user, vaultKey, supabase, lockVault, pushNotify]);

  useEffect(() => {
    if (user?.id && vaultKey) {
      void refreshVaultItems();
    }
    if (!vaultKey) {
      setVaultItems([]);
    }
  }, [user?.id, vaultKey, refreshVaultItems]);

  const saveVaultItem = useCallback(
    async ({
      modalTab,
      modalTitle,
      modalLogin,
      modalPassword,
      modalNotes,
      modalCardHolder,
      modalCardNumber,
      modalCardExpiry,
      modalCardCvv,
      modalPersonalId,
      modalPersonalFullName,
      modalPersonalEmail,
      modalPersonalPhone,
      modalPersonalAddress,
      editingItem,
      onSaved,
    }: SaveVaultInput) => {
      if (!user || !vaultKey) return;

      try {
        let website = '';
        let username = '';
        let secret = '';
        let metadata: Record<string, string> = { kind: modalTab };

        if (modalTab === 'password') {
          if (!modalTitle.trim() || !modalLogin.trim()) {
            pushNotify('Vui lòng nhập tên gợi nhớ và tên đăng nhập / email.', 'error');
            return;
          }
          website = modalTitle.trim();
          username = modalLogin.trim();
          secret = modalPassword;
          metadata = { kind: 'password', notes: modalNotes.trim() };
        } else if (modalTab === 'card') {
          if (!modalTitle.trim() || !modalCardHolder.trim() || !modalCardNumber.trim()) {
            pushNotify('Vui lòng nhập tên thẻ, chủ thẻ và số thẻ.', 'error');
            return;
          }
          website = modalTitle.trim();
          username = modalCardHolder.trim();
          secret = modalCardNumber.trim();
          metadata = {
            kind: 'card',
            expiry: modalCardExpiry.trim(),
            cvv: modalCardCvv.trim(),
            notes: modalNotes.trim(),
          };
        } else {
          if (!modalTitle.trim() || !modalPersonalFullName.trim() || !modalPersonalId.trim()) {
            pushNotify('Vui lòng nhập tên hồ sơ, họ tên và mã định danh.', 'error');
            return;
          }
          website = modalTitle.trim();
          username = modalPersonalFullName.trim();
          secret = modalPersonalId.trim();
          metadata = {
            kind: 'personal',
            email: modalPersonalEmail.trim(),
            phone: modalPersonalPhone.trim(),
            address: modalPersonalAddress.trim(),
            notes: modalNotes.trim(),
          };
        }

        const encPw = await encrypt(secret, vaultKey);
        let encrypted_notes: string | null = null;
        let iv_notes: string | null = null;
        const metaText = JSON.stringify(metadata);
        if (metaText.trim()) {
          const encryptedMeta = await encrypt(metaText, vaultKey);
          encrypted_notes = encryptedMeta.ciphertext;
          iv_notes = encryptedMeta.iv;
        }

        if (editingItem) {
          const { error } = await updatePassword(supabase, editingItem.id, {
            website,
            username,
            encrypted_password: encPw.ciphertext,
            iv_password: encPw.iv,
            encrypted_notes,
            iv_notes,
          });
          if (error) {
            pushNotify(error.message, 'error');
            return;
          }
        } else {
          const { error } = await addPassword(supabase, user.id, {
            website,
            username,
            encrypted_password: encPw.ciphertext,
            iv_password: encPw.iv,
            encrypted_notes,
            iv_notes,
          });
          if (error) {
            pushNotify(error.message, 'error');
            return;
          }
        }

        await refreshVaultItems();
        onSaved();
        pushNotify(editingItem ? 'Đã cập nhật mục' : 'Đã thêm mục', 'success');
      } catch {
        pushNotify('Lưu thất bại. Kiểm tra kết nối hoặc mật khẩu mã hóa.', 'error');
      }
    },
    [user, vaultKey, supabase, refreshVaultItems, pushNotify],
  );

  const deleteVaultItem = useCallback(
    async (id: string) => {
      const { error } = await deletePassword(supabase, id);
      if (error) {
        pushNotify(error.message, 'error');
        return false;
      }
      await refreshVaultItems();
      pushNotify('Đã xóa mục', 'success');
      return true;
    },
    [supabase, refreshVaultItems, pushNotify],
  );

  return {
    vaultItems,
    vaultLoading,
    refreshVaultItems,
    saveVaultItem,
    deleteVaultItem,
  };
}
