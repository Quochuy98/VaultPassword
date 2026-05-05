import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { VaultGate } from './components/VaultGate';
import { LandingPage } from './components/LandingPage';
import { LoginScreen, TwoFactorScreen, type AuthNotify } from './components/AuthScreens';
import { Button, Input, Navbar, Sidebar, type MainTab } from './components/AppShell';
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
  Lock,
  Eye, 
  EyeOff, 
  Search,
  HelpCircle, 
  Plus, 
  Trash2,
  Shield,
  Settings as SettingsIcon,
  Copy,
  Check,
  X,
  CreditCard,
  Key,
  Download,
  AlertCircle,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [toast, setToast] = useState<{ message: string; kind: 'copy' | 'success' | 'error' } | null>(null);
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-surface overflow-hidden"
    >
      <Navbar
        onOpenSettings={() => navigate('/settings')}
        onGoDashboard={() => navigate('/dashboard')}
        currentTab="dashboard"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userLabel={userLabel}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab="dashboard" onSelectTab={goTab} onAddNew={handleAddNew} onGoDashboard={() => navigate('/dashboard')} />
              <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
                      {searchQuery ? `Kết quả cho "${searchQuery}"` : 'Mật khẩu của tôi'}
                    </h1>
                    <Button onClick={handleAddNew} className="gap-2 h-10 md:h-12 px-6">
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">Thêm mật khẩu</span>
                      <span className="sm:hidden">Thêm</span>
                    </Button>
                  </div>

                  {vaultLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium text-slate-500">Đang tải vault…</p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Không tìm thấy kết quả</h3>
                      <p className="text-slate-500 text-sm">Thử với từ khóa khác hoặc thêm mục mật khẩu mới.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredItems.map((item) => (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
                        onClick={() => openEditModal(item)}
                        className="group relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm transition-transform group-hover:scale-110"
                            style={{ backgroundColor: item.color ? `${item.color}10` : '#f8fafc' }}
                          >
                            {item.icon ? (
                              <img src={item.icon} alt={item.title} className="w-7 h-7 object-contain" />
                            ) : (
                              <div className="text-xl font-black" style={{ color: item.color || '#475569' }}>
                                {item.title[0]}
                              </div>
                            )}
                          </div>
                          
                          {item.type === 'card' ? (
                            <CreditCard className="w-5 h-5 text-slate-300" />
                          ) : (
                            <div className="flex -space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/30"></div>
                            </div>
                          )}

                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === item.id ? null : item.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            
                            <AnimatePresence>
                              {activeMenuId === item.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 overflow-hidden"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button 
                                    onClick={() => { openEditModal(item); setActiveMenuId(null); }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                  >
                                    <Edit className="w-4 h-4 text-slate-400" />
                                    Chỉnh sửa
                                  </button>
                                  <div className="h-px bg-slate-100 my-1"></div>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveMenuId(null);
                                      void handleDeleteVaultItem(item.id);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Xóa mục
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="space-y-1 mb-6">
                           <h3 className="font-bold text-slate-900 text-lg group-hover:text-primary transition-colors truncate">{item.title}</h3>
                           <div className="flex items-center gap-2 group-hover:translate-x-1 transition-transform min-w-0">
                             <p className="text-sm text-slate-500 font-medium truncate">{item.email || item.username || item.cardHolder || item.fullName || item.personalId}</p>
                             <button
                               type="button"
                               onClick={(e) => handleCopy(e, item.email || item.username || item.cardHolder || item.fullName || item.personalId)}
                               className="text-slate-400 hover:text-primary p-0.5 rounded transition-colors shrink-0"
                             >
                               <Copy className="w-3.5 h-3.5" />
                             </button>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs text-slate-600 font-mono tracking-tight border border-slate-100 shadow-inner overflow-hidden">
                            <span className="truncate">{maskSecret(item.password || item.cardNumber || item.personalId)}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(e, item.password || item.cardNumber || item.personalId)}
                              className="text-slate-400 hover:text-primary p-0.5 rounded transition-colors shrink-0 ml-auto"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                </div>
              </main>
            </div>
    </motion.div>
  );

  const settingsPage = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-surface overflow-hidden"
    >
      <Navbar
        onOpenSettings={() => navigate('/settings')}
        onGoDashboard={() => navigate('/dashboard')}
        currentTab="settings"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userLabel={userLabel}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab="settings" onSelectTab={goTab} onAddNew={handleAddNew} onGoDashboard={() => navigate('/dashboard')} />
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight">Cài Đặt</h1>
                      <p className="text-on-surface-variant text-sm mt-1">Quản lý bảo mật, thiết bị và phương thức xác thực của bạn.</p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-slate-200 text-slate-700 font-bold shrink-0"
                      onClick={async () => {
                        await signOut();
                        pushNotify('Đã đăng xuất', 'success');
                        navigate('/login', { replace: true });
                      }}
                    >
                      Đăng xuất
                    </Button>
                  </div>

                  <div className="border-b border-outline-variant">
                    <nav className="flex gap-8">
                      {['Bảo mật', 'Passkeys', 'Thiết bị'].map((tab, i) => (
                        <button key={tab} className={`py-4 px-1 border-b-2 text-sm font-medium transition-all ${i === 0 ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900">
                          <Lock className="w-6 h-6 text-primary" />
                          Đổi mật khẩu Vault
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                          Mật khẩu vault dùng để giải mã dữ liệu đã mã hóa đầu-cuối của bạn.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Mật khẩu Vault hiện tại"
                          type="password"
                          value={vaultPassCurrent}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaultPassCurrent(e.target.value)}
                          placeholder="••••••••"
                        />
                        <Input
                          label="Mật khẩu Vault mới"
                          type="password"
                          value={vaultPassNext}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaultPassNext(e.target.value)}
                          placeholder="Tối thiểu 8 ký tự"
                        />
                        <Input
                          label="Xác nhận mật khẩu mới"
                          type="password"
                          value={vaultPassConfirm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVaultPassConfirm(e.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                        />
                      </div>
                      <div className="mt-5 flex justify-end">
                        <Button
                          type="button"
                          onClick={() => void handleChangeVaultPassword()}
                          disabled={changingVaultPass}
                          className="px-8"
                        >
                          {changingVaultPass ? 'Đang cập nhật...' : 'Cập nhật mật khẩu Vault'}
                        </Button>
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900">
                             <Shield className="w-6 h-6 text-primary" />
                             Xác thực 2 yếu tố (2FA)
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 font-medium">Bảo mật tối đa cho tài khoản VaultGuard của bạn.</p>
                        </div>
                        <div className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked readOnly className="sr-only peer" />
                          <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner"></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-8 flex flex-col md:flex-row gap-8 border border-slate-100 shadow-inner">
                        <div className="shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-md flex items-center justify-center">
                          <div className="w-32 h-32 bg-slate-50 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                            <Plus className="w-8 h-8 text-slate-300" />
                            <span className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">QR CODE</span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-6">
                          <div className="space-y-3">
                            <p className="text-sm font-bold text-slate-700">1. Quét mã QR bằng ứng dụng xác thực</p>
                            <div className="bg-white py-3 px-4 rounded-xl text-sm font-mono tracking-widest border border-slate-200 flex justify-between items-center text-slate-600 shadow-sm">
                              <span>JBSW Y3DP EHPK 3PXP</span>
                              <Copy className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 block">2. Nhập mã xác nhận 6 chữ số</label>
                            <div className="flex gap-3">
                              <input 
                                className="flex-1 max-w-[200px] bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all shadow-sm font-bold tracking-[0.2em]" 
                                placeholder="000 000"
                              />
                              <Button className="px-8 flex-shrink-0">Kích hoạt</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-3 text-slate-900">
                            <Key className="w-6 h-6 text-tertiary" />
                            Mã khóa dự phòng
                          </h3>
                          <p className="text-sm text-slate-500 mt-1 font-medium">Lưu trữ ngoại tuyến để phòng trường hợp khẩn cấp.</p>
                        </div>
                        <Button variant="outline" className="gap-2 text-sm py-2 px-5 border-slate-200 text-slate-700 font-bold">
                          <Download className="w-4 h-4 text-primary" />
                          Xuất PDF
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['4815 1623', '4210 8945', '7391 5520', '6620 1994', '8452 3311', '1109 4872'].map((code, idx) => (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-xl font-mono text-sm text-center border transition-all relative group shadow-sm ${idx === 1 ? 'line-through text-slate-300 bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-primary/40 hover:shadow-md cursor-pointer'}`}
                          >
                            <span className="font-bold tracking-wider">{code}</span>
                            {idx !== 1 && <Copy className="w-3.5 h-3.5 absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-primary transition-all" />}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-between items-center">
                        <p className="text-xs text-slate-400 font-medium italic">* Mỗi mã chỉ có giá trị sử dụng một lần duy nhất.</p>
                        <button className="text-sm text-primary font-bold hover:underline">Tạo tổ hợp mới</button>
                      </div>
                    </section>
                  </div>
                </div>
              </main>
            </div>
    </motion.div>
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

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeVaultModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
            >
              {/* <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    {editingItem ? <ShieldCheck className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                </div>
                <Button variant="ghost" onClick={closeVaultModal} className="p-2 rounded-full hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div> */}

              <div className="p-8 space-y-6">
                <div className="flex p-1.5 bg-slate-100 rounded-xl">
                  <button 
                    onClick={() => !editingItem && setModalTab('password')}
                    disabled={!!editingItem && modalTab !== 'password'}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${modalTab === 'password' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 disabled:opacity-50'}`}
                  >
                    Mật khẩu
                  </button>
                  <button 
                    onClick={() => !editingItem && setModalTab('card')}
                    disabled={!!editingItem && modalTab !== 'card'}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${modalTab === 'card' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 disabled:opacity-50'}`}
                  >
                    Thẻ thanh toán
                  </button>
                  <button
                    onClick={() => !editingItem && setModalTab('personal')}
                    disabled={!!editingItem && modalTab !== 'personal'}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${modalTab === 'personal' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900 disabled:opacity-50'}`}
                  >
                    Cá nhân
                  </button>
                </div>

                <div className="space-y-5">
                  {modalTab === 'password' ? (
                    <>
                      <Input 
                        label="Tên gợi nhớ" 
                        type="text" 
                        value={modalTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalTitle(e.target.value)}
                        placeholder="Ví dụ: Tài khoản Google" 
                      />
                      <Input 
                        label="Tên người dùng / Email" 
                        type="text" 
                        value={modalLogin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalLogin(e.target.value)}
                        placeholder="name@email.com" 
                      />
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-sm font-bold text-slate-700 tracking-tight">Mật khẩu</label>
                          {!editingItem && (
                            <button
                              type="button"
                              className="text-xs font-bold text-primary hover:underline transition-colors uppercase tracking-wider"
                              onClick={() => {
                                const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
                                let out = '';
                                const arr = new Uint8Array(20);
                                crypto.getRandomValues(arr);
                                for (let i = 0; i < 20; i += 1) {
                                  out += chars[arr[i] % chars.length];
                                }
                                setModalPassword(out);
                              }}
                            >
                              Tạo ngẫu nhiên
                            </button>
                          )}
                        </div>
                        <div className="relative group">
                          <input 
                            type={showModalPassword ? 'text' : 'password'} 
                            value={modalPassword}
                            onChange={(e) => setModalPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowModalPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showModalPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : modalTab === 'card' ? (
                    <>
                      <Input 
                        label="Tên gợi nhớ" 
                        type="text" 
                        value={modalTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalTitle(e.target.value)}
                        placeholder="Ví dụ: Visa Platinum" 
                      />
                      <Input 
                        label="Tên chủ thẻ" 
                        type="text" 
                        value={modalCardHolder}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalCardHolder(e.target.value)}
                        className="uppercase" 
                        placeholder="NGUYEN VAN A" 
                      />
                      <Input 
                        label="Số thẻ" 
                        type="text" 
                        value={modalCardNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000" 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Hạn dùng"
                          value={modalCardExpiry}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalCardExpiry(e.target.value)}
                          placeholder="MM / YY"
                        />
                        <Input
                          label="Mã CVV"
                          type="password"
                          value={modalCardCvv}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalCardCvv(e.target.value)}
                          placeholder="•••"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Input
                        label="Tên hồ sơ"
                        type="text"
                        value={modalTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalTitle(e.target.value)}
                        placeholder="Ví dụ: CCCD / Hộ chiếu"
                      />
                      <Input
                        label="Họ và tên"
                        type="text"
                        value={modalPersonalFullName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalPersonalFullName(e.target.value)}
                        placeholder="Nguyen Van A"
                      />
                      <Input
                        label="Mã định danh"
                        type="text"
                        value={modalPersonalId}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalPersonalId(e.target.value)}
                        placeholder="012345678901"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Email"
                          type="email"
                          value={modalPersonalEmail}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalPersonalEmail(e.target.value)}
                          placeholder="name@email.com"
                        />
                        <Input
                          label="Số điện thoại"
                          type="text"
                          value={modalPersonalPhone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalPersonalPhone(e.target.value)}
                          placeholder="09xxxxxxxx"
                        />
                      </div>
                      <Input
                        label="Địa chỉ"
                        type="text"
                        value={modalPersonalAddress}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalPersonalAddress(e.target.value)}
                        placeholder="Địa chỉ liên hệ"
                      />
                    </>
                  )}

                  <div className="space-y-1.5 px-1">
                    <label className="text-sm font-bold text-slate-700 tracking-tight">Ghi chú bổ sung</label>
                    <textarea 
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner resize-none min-h-[100px]" 
                      placeholder="Thông tin thêm về mục này..." 
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={closeVaultModal}>Hủy bỏ</Button>
                <Button type="button" onClick={() => void handleSaveVault()} className="px-10">
                  {editingItem ? 'Cập nhật' : 'Lưu thông tin'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl max-w-md ${
              toast.kind === 'error'
                ? 'bg-red-900 text-white'
                : 'bg-inverse-surface text-inverse-on-surface'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                toast.kind === 'error'
                  ? 'bg-white/15'
                  : 'bg-secondary-container text-on-secondary-container'
              }`}
            >
              {toast.kind === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className={`ml-2 shrink-0 ${toast.kind === 'error' ? 'text-white/70 hover:text-white' : 'text-inverse-on-surface/60 hover:text-inverse-on-surface'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
