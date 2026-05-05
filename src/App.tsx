import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VaultGate } from './components/VaultGate';
import { LandingPage } from './components/LandingPage';
import { LoginScreen, TwoFactorScreen, type AuthNotify } from './components/AuthScreens';
import { Button, Input, Navbar, Sidebar, type MainTab } from './components/AppShell';
import { DashboardPage } from './components/DashboardPage';
import { SettingsPage } from './components/SettingsPage';
import { VaultItemModal } from './components/VaultItemModal';
import { ToastNotice, type ToastState } from './components/ToastNotice';
import { useAuth } from './context/AuthContext';
import { decrypt, deriveKeyFromPassword, encrypt, generateSalt, saltToBase64 } from './lib/encryption';
import {
  addPassword,
  deletePassword,
  getPasswords,
  updatePassword,
  type PasswordRow,
} from './services/passwordService';
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  Plus, 
  Trash2,
  Settings as SettingsIcon,
  Copy,
} from 'lucide-react';

// --- Types ---
interface VaultItem {
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

async function decryptRowToVaultItem(row: PasswordRow, key: CryptoKey): Promise<VaultItem> {
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

function maskSecret(value: string | undefined, maxDots = 14): string {
  if (!value) return '••••••••';
  return '•'.repeat(Math.min(value.length, maxDots));
}

const TOAST_DURATION_MS = 4000;

function HomeRedirect() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-container-low gap-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-on-surface-variant">Đang tải…</p>
      </div>
    );
  }
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

// --- Main App ---

export default function App() {
  const navigate = useNavigate();
  const { user, signOut, supabase, vaultKey, lockVault, unlockVault } = useAuth();
  const [toast, setToast] = useState<ToastState>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [modalTab, setModalTab] = useState<'password' | 'card' | 'personal'>('password');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalLogin, setModalLogin] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [modalNotes, setModalNotes] = useState('');
  const [modalCardHolder, setModalCardHolder] = useState('');
  const [modalCardNumber, setModalCardNumber] = useState('');
  const [modalCardExpiry, setModalCardExpiry] = useState('');
  const [modalCardCvv, setModalCardCvv] = useState('');
  const [modalPersonalId, setModalPersonalId] = useState('');
  const [modalPersonalFullName, setModalPersonalFullName] = useState('');
  const [modalPersonalEmail, setModalPersonalEmail] = useState('');
  const [modalPersonalPhone, setModalPersonalPhone] = useState('');
  const [modalPersonalAddress, setModalPersonalAddress] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [vaultPassCurrent, setVaultPassCurrent] = useState('');
  const [vaultPassNext, setVaultPassNext] = useState('');
  const [vaultPassConfirm, setVaultPassConfirm] = useState('');
  const [changingVaultPass, setChangingVaultPass] = useState(false);

  // Sync modal tab with editing item type
  useEffect(() => {
    if (editingItem) {
      setModalTab(editingItem.type);
    }
  }, [editingItem]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const pushNotify = useCallback((message: string, variant: 'success' | 'error') => {
    setToast({ message, kind: variant });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

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

  useEffect(() => {
    if (!isModalOpen) return;
    if (editingItem) {
      setModalTitle(editingItem.title);
      setModalLogin(editingItem.email ?? editingItem.username ?? '');
      setModalPassword(editingItem.password ?? '');
      setModalNotes(editingItem.notes ?? '');
      setModalCardHolder(editingItem.cardHolder ?? '');
      setModalCardNumber(editingItem.cardNumber ?? '');
      setModalCardExpiry(editingItem.expiry ?? '');
      setModalCardCvv(editingItem.cvv ?? '');
      setModalPersonalId(editingItem.personalId ?? '');
      setModalPersonalFullName(editingItem.fullName ?? '');
      setModalPersonalEmail(editingItem.email ?? '');
      setModalPersonalPhone(editingItem.phone ?? '');
      setModalPersonalAddress(editingItem.address ?? '');
    } else {
      setModalTitle('');
      setModalLogin('');
      setModalPassword('');
      setModalNotes('');
      setModalCardHolder('');
      setModalCardNumber('');
      setModalCardExpiry('');
      setModalCardCvv('');
      setModalPersonalId('');
      setModalPersonalFullName('');
      setModalPersonalEmail('');
      setModalPersonalPhone('');
      setModalPersonalAddress('');
    }
  }, [isModalOpen, editingItem]);

  const handleCopy = (e: React.MouseEvent, text?: string) => {
    e.stopPropagation();
    if (text) {
      void navigator.clipboard.writeText(text);
    }
    setToast({ message: 'Đã sao chép vào bộ nhớ đệm', kind: 'copy' });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const openEditModal = (item: VaultItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeVaultModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setShowModalPassword(false);
  };

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeVaultModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleAddNew = () => {
    setEditingItem(null);
    setModalTab('password');
    setIsModalOpen(true);
  };

  const handleSaveVault = async () => {
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
        const n = await encrypt(metaText, vaultKey);
        encrypted_notes = n.ciphertext;
        iv_notes = n.iv;
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
      closeVaultModal();
      pushNotify(editingItem ? 'Đã cập nhật mục' : 'Đã thêm mục', 'success');
    } catch {
      pushNotify('Lưu thất bại. Kiểm tra kết nối hoặc mật khẩu mã hóa.', 'error');
    }
  };

  const handleDeleteVaultItem = async (id: string) => {
    const { error } = await deletePassword(supabase, id);
    if (error) {
      pushNotify(error.message, 'error');
      return;
    }
    setActiveMenuId(null);
    await refreshVaultItems();
    pushNotify('Đã xóa mục', 'success');
  };

  const handleChangeVaultPassword = async () => {
    if (!user || !vaultKey) {
      pushNotify('Vui lòng mở khóa vault trước khi đổi mật khẩu.', 'error');
      return;
    }
    if (!vaultPassCurrent || !vaultPassNext) {
      pushNotify('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.', 'error');
      return;
    }
    if (vaultPassNext.length < 8) {
      pushNotify('Mật khẩu vault mới cần tối thiểu 8 ký tự.', 'error');
      return;
    }
    if (vaultPassNext !== vaultPassConfirm) {
      pushNotify('Xác nhận mật khẩu vault mới không khớp.', 'error');
      return;
    }

    setChangingVaultPass(true);
    try {
      const rowsResult = await getPasswords(supabase);
      if (rowsResult.error) {
        pushNotify(rowsResult.error.message, 'error');
        return;
      }

      // Verify current vault password against existing salt metadata.
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        pushNotify(userErr?.message ?? 'Không thể xác thực người dùng hiện tại.', 'error');
        return;
      }
      const currentSaltB64 = userData.user.user_metadata?.vault_salt as string | undefined;
      if (!currentSaltB64) {
        pushNotify('Vault chưa được thiết lập khóa hiện tại.', 'error');
        return;
      }
      const verifiedCurrentKey = await deriveKeyFromPassword(
        vaultPassCurrent,
        Uint8Array.from(atob(currentSaltB64), (c) => c.charCodeAt(0)),
      );

      const newSalt = generateSalt();
      const newKey = await deriveKeyFromPassword(vaultPassNext, newSalt);
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
          return;
        }
      }

      const newSaltB64 = saltToBase64(newSalt);
      const { error: updateUserErr } = await supabase.auth.updateUser({
        data: { vault_salt: newSaltB64 },
      });
      if (updateUserErr) {
        pushNotify(updateUserErr.message, 'error');
        return;
      }

      const unlocked = await unlockVault(vaultPassNext);
      if (unlocked.error) {
        pushNotify(unlocked.error.message, 'error');
        return;
      }

      setVaultPassCurrent('');
      setVaultPassNext('');
      setVaultPassConfirm('');
      pushNotify('Đã đổi mật khẩu vault thành công.', 'success');
      // After successful rotation, require user to re-enter the new vault passphrase.
      window.setTimeout(() => {
        lockVault();
      }, 1200);
    } catch {
      pushNotify('Đổi mật khẩu vault thất bại. Kiểm tra mật khẩu hiện tại.', 'error');
    } finally {
      setChangingVaultPass(false);
    }
  };

  const userLabel = user?.email ?? user?.phone ?? 'Người dùng';

  const filteredItems = vaultItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.email && item.email.toLowerCase().includes(query)) ||
      (item.username && item.username.toLowerCase().includes(query)) ||
      (item.cardHolder && item.cardHolder.toLowerCase().includes(query)) ||
      (item.cardNumber && item.cardNumber.includes(query))
    );
  });

  const goTab = (tab: MainTab) => {
    navigate(tab === 'dashboard' ? '/dashboard' : '/settings');
  };

  const dashboardPage = (
    <DashboardPage
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userLabel={userLabel}
      handleAddNew={handleAddNew}
      goTab={goTab}
      onGoDashboard={() => navigate('/dashboard')}
      vaultLoading={vaultLoading}
      filteredItems={filteredItems}
      openEditModal={openEditModal}
      activeMenuId={activeMenuId}
      setActiveMenuId={setActiveMenuId}
      handleDeleteVaultItem={handleDeleteVaultItem}
      handleCopy={handleCopy}
      maskSecret={maskSecret}
    />
  );

  const settingsPage = (
    <SettingsPage
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userLabel={userLabel}
      goTab={goTab}
      handleAddNew={handleAddNew}
      onGoDashboard={() => navigate('/dashboard')}
      signOut={signOut}
      pushNotify={pushNotify}
      onAfterSignOut={() => navigate('/login', { replace: true })}
      vaultPassCurrent={vaultPassCurrent}
      setVaultPassCurrent={setVaultPassCurrent}
      vaultPassNext={vaultPassNext}
      setVaultPassNext={setVaultPassNext}
      vaultPassConfirm={vaultPassConfirm}
      setVaultPassConfirm={setVaultPassConfirm}
      handleChangeVaultPassword={handleChangeVaultPassword}
      changingVaultPass={changingVaultPass}
    />
  );

  const aboutPage = <LandingPage onStart={() => navigate('/login')} />;

  return (
    <div className="font-sans antialiased">
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/about" element={aboutPage} />
        <Route path="/login" element={<LoginScreen onNotify={pushNotify} />} />
        <Route path="/2fa" element={<TwoFactorScreen />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<VaultGate />}>
            <Route path="/dashboard" element={dashboardPage} />
            <Route path="/settings" element={settingsPage} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* --- Modals & Toasts --- */}

      <VaultItemModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        modalTab={modalTab}
        setModalTab={setModalTab}
        closeVaultModal={closeVaultModal}
        modalTitle={modalTitle}
        setModalTitle={setModalTitle}
        modalLogin={modalLogin}
        setModalLogin={setModalLogin}
        modalPassword={modalPassword}
        setModalPassword={setModalPassword}
        showModalPassword={showModalPassword}
        setShowModalPassword={setShowModalPassword}
        modalCardHolder={modalCardHolder}
        setModalCardHolder={setModalCardHolder}
        modalCardNumber={modalCardNumber}
        setModalCardNumber={setModalCardNumber}
        modalCardExpiry={modalCardExpiry}
        setModalCardExpiry={setModalCardExpiry}
        modalCardCvv={modalCardCvv}
        setModalCardCvv={setModalCardCvv}
        modalPersonalId={modalPersonalId}
        setModalPersonalId={setModalPersonalId}
        modalPersonalFullName={modalPersonalFullName}
        setModalPersonalFullName={setModalPersonalFullName}
        modalPersonalEmail={modalPersonalEmail}
        setModalPersonalEmail={setModalPersonalEmail}
        modalPersonalPhone={modalPersonalPhone}
        setModalPersonalPhone={setModalPersonalPhone}
        modalPersonalAddress={modalPersonalAddress}
        setModalPersonalAddress={setModalPersonalAddress}
        modalNotes={modalNotes}
        setModalNotes={setModalNotes}
        handleSaveVault={handleSaveVault}
      />

      <ToastNotice toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
