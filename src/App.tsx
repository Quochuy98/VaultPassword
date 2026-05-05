import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Search, 
  Bell, 
  HelpCircle, 
  Plus, 
  Star, 
  FileText, 
  User, 
  Briefcase, 
  Trash2, 
  Shield, 
  Settings as SettingsIcon,
  Copy,
  Check,
  X,
  CreditCard,
  Smartphone,
  Key,
  Download,
  AlertCircle,
  MoreHorizontal,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type Screen = 'login' | '2fa' | 'dashboard' | 'settings';

interface VaultItem {
  id: string;
  type: 'password' | 'card';
  title: string;
  username?: string;
  email?: string;
  password?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  icon?: string;
  color?: string;
}

// --- Mock Data ---
const MOCK_ITEMS: VaultItem[] = [
  { 
    id: '1', 
    type: 'password', 
    title: 'Google Account', 
    email: 'john.doe****@gmail.com', 
    password: '••••••••••••',
    icon: 'https://www.google.com/favicon.ico'
  },
  { 
    id: '2', 
    type: 'password', 
    title: 'GitHub', 
    username: 'dev_j****', 
    password: '•••••••••••••••',
    icon: 'https://github.githubassets.com/favicons/favicon.svg'
  },
  { 
    id: '3', 
    type: 'password', 
    title: 'Netflix', 
    email: 'family****@outlook.com', 
    password: '••••••••',
    color: '#E4002B'
  },
  { 
    id: '4', 
    type: 'password', 
    title: 'PayPal', 
    email: 'john.finance****@gmail.com', 
    password: '••••••••••••••••••',
    color: '#0070BA'
  },
  { 
    id: '5', 
    type: 'card', 
    title: 'Chase Freedom', 
    cardHolder: 'Cardholder Name', 
    cardNumber: '•••• •••• •••• 1234',
    color: '#1A1F71'
  }
];

// --- Components ---

const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10 border border-primary/20",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
    outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, icon: Icon, error, ...props }: any) => (
  <div className="w-full space-y-1.5">
    {label && <label className="text-sm font-bold text-slate-700 tracking-tight">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
      )}
      <input 
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm ${error ? 'border-red-500 ring-red-500/10' : ''}`}
        {...props} 
      />
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const Navbar = ({ onOpenSettings, currentTab }: { onOpenSettings: () => void, currentTab: Screen }) => (
  <nav className="sticky top-0 z-40 w-full bg-white border-b border-outline-variant/60 px-6 h-16 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-3">
      <div className="bg-primary text-white p-2 rounded-lg md:hidden">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <span className="text-xl font-bold tracking-tight hidden md:block text-slate-900">VaultGuard</span>
    </div>
    
    <div className="flex-1 max-w-xl mx-12 relative hidden md:block">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-slate-400" />
      </div>
      <input 
        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none" 
        placeholder="Tìm kiếm dự án, mật khẩu..." 
      />
    </div>

    <div className="flex items-center gap-3">
      <Button variant="ghost" className="p-2 rounded-full md:hidden">
        <Search className="w-5 h-5 text-slate-600" />
      </Button>
      <div className="relative">
        <Button variant="ghost" className="p-2 rounded-full relative">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </Button>
      </div>
      
      <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
      
      <button 
        onClick={onOpenSettings}
        className={`flex items-center gap-3 p-1 pr-3 rounded-full transition-all group ${currentTab === 'settings' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
      >
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold border border-orange-200 shadow-sm transition-transform group-hover:scale-105">
          JD
        </div>
        <span className="text-sm font-semibold text-slate-700 hidden sm:block">John Doe</span>
      </button>
    </div>
  </nav>
);

const Sidebar = ({ currentTab, setScreen, onAddNew }: { currentTab: Screen, setScreen: (s: Screen) => void, onAddNew: () => void }) => (
  <aside className="w-64 border-r border-outline-variant bg-white h-[calc(100vh-65px)] flex-col p-4 hidden md:flex sticky top-[65px]">
    <div className="mb-6 px-4 py-2">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">V</div>
        <span className="text-lg font-bold tracking-tight text-on-surface">VaultGuard</span>
      </div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/60">Quản lý bảo mật</p>
    </div>
    
    <Button 
      onClick={onAddNew}
      className="w-full justify-start gap-3 py-2.5 mb-6 font-semibold shadow-sm overflow-hidden group relative"
    >
      <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
      Thêm mục mới
    </Button>

    <div className="space-y-1 px-2">
      <SidebarItem icon={ShieldCheck} label="Tất cả mục" active={currentTab === 'dashboard'} onClick={() => setScreen('dashboard')} />
      <SidebarItem icon={Star} label="Yêu thích" />
      <SidebarItem icon={FileText} label="Ghi chú bảo mật" />
      <SidebarItem icon={User} label="Cá nhân" />
      <SidebarItem icon={Briefcase} label="Công việc" />
    </div>

    <div className="mt-auto pt-4 space-y-1 px-2 border-t border-outline-variant/30">
      <SidebarItem icon={Trash2} label="Thùng rác" />
      <SidebarItem icon={Shield} label="Công cụ bảo mật" />
    </div>

    <div className="mt-6 px-2">
      <div className="bg-inverse-surface text-inverse-on-surface p-4 rounded-xl shadow-lg border border-white/5">
        <p className="text-[10px] text-inverse-on-surface/60 font-bold uppercase mb-1 tracking-wider">Độ an toàn</p>
        <p className="text-sm font-bold mb-3">84% Tuyệt vời</p>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '84%' }}
            className="bg-primary h-full rounded-full"
          />
        </div>
      </div>
    </div>
  </aside>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
  >
    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'fill-current' : ''}`} />
    {label}
  </button>
);

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [showToast, setShowToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null);
  const [modalTab, setModalTab] = useState<'password' | 'card'>('password');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening modal when clicking copy
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const openEditModal = (item: VaultItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeVaultModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
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
    setIsModalOpen(true);
  };

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // If a value was entered, focus the next input
    if (element.value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // On backspace, if the current field is empty, focus the previous field
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = [...otp];
    pasteData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus either the last filled input or the 6th input
    const lastIndex = Math.min(pasteData.length - 1, 5);
    otpRefs.current[lastIndex]?.focus();
  };

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-surface-bright to-surface-container-low"
          >
            <div className="mb-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white mb-4 shadow-2xl shadow-primary/30 relative overflow-hidden group">
                <ShieldCheck className="w-12 h-12 relative z-10 transition-transform group-hover:scale-110" />
                <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/20 rounded-full blur-xl"></div>
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">VaultGuard</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Sẵn sàng bảo mật không gian của bạn</p>
            </div>

            <div className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Đăng nhập</h2>
                <p className="text-slate-500 text-sm mb-10 font-medium">Truy cập an toàn bằng mã hóa AES-256 nội tại.</p>
                
                <form onSubmit={(e) => { e.preventDefault(); setScreen('2fa'); }} className="space-y-6">
                  <Input label="Địa chỉ Email" icon={Mail} type="email" placeholder="john@example.com" required />
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-slate-700 tracking-tight">Mật khẩu chính</label>
                      <button type="button" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                      </div>
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                        required
                      />
                      <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1">
                    <input type="checkbox" id="public" className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer" />
                    <label htmlFor="public" className="text-sm text-slate-500 font-medium cursor-pointer select-none">Tin tưởng thiết bị này trong 30 ngày</label>
                  </div>

                  <Button type="submit" className="w-full py-4 text-lg h-[56px] gap-3">
                    Bắt đầu phiên làm việc
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </form>

                <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-center items-center gap-2 text-sm">
                  <p className="text-slate-500 font-medium">Chưa có mã khóa?</p>
                  <button className="text-primary font-bold hover:underline">Tạo một Vault mới</button>
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-xs text-outline text-center max-w-sm">
              Được bảo vệ bằng mã hóa cấp quân sự. Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
            </p>
          </motion.div>
        );

      case '2fa':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 bg-background"
          >
            <div className="mb-8 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold tracking-tight">VaultGuard</span>
            </div>

            <div className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16"></div>
              
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary group relative">
                <Smartphone className="w-10 h-10 transition-transform group-hover:scale-110" />
                <div className="absolute -inset-1 bg-primary/5 rounded-2xl blur-lg animate-pulse"></div>
              </div>
              
              <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">Xác thực 2 lớp</h1>
              <p className="text-slate-500 text-sm mb-10 px-4 font-medium">
                Vui lòng nhập mã xác thực từ ứng dụng Google Authenticator của bạn
              </p>

              <div className="flex justify-center gap-2 sm:gap-3 mb-10">
                {otp.map((digit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input 
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text" 
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="w-11 h-14 sm:w-12 sm:h-16 text-center text-3xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                    {i === 2 && <span className="text-slate-300 text-xl font-bold">−</span>}
                  </div>
                ))}
              </div>

              <Button onClick={() => setScreen('dashboard')} className="w-full py-4 text-lg h-[56px] gap-3">
                Xác thực danh tính
                <ShieldCheck className="w-5 h-5" />
              </Button>

              <div className="mt-10 space-y-4">
                <button className="text-sm font-bold text-primary hover:underline block mx-auto">Sử dụng mã dự phòng</button>
                <p className="text-sm text-slate-500 font-medium">
                  Không nhận được mã? <button className="text-slate-900 font-bold hover:text-primary transition-colors">Gửi lại yêu cầu</button>
                </p>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-1.5 text-xs text-outline">
              <Lock className="w-3 h-3" />
              <span>Được bảo mật bằng mã hóa đầu cuối</span>
            </div>
          </motion.div>
        );

      case 'dashboard':
        return (
          <div className="min-h-screen flex flex-col bg-surface overflow-hidden">
            <Navbar onOpenSettings={() => setScreen('settings')} currentTab="dashboard" />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar currentTab="dashboard" setScreen={setScreen} onAddNew={handleAddNew} />
              <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">Mật khẩu của tôi</h1>
                    <Button onClick={handleAddNew} className="gap-2 h-10 md:h-12 px-6">
                      <Plus className="w-5 h-5" />
                      <span className="hidden sm:inline">Thêm mật khẩu</span>
                      <span className="sm:hidden">Thêm</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_ITEMS.map((item) => (
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
                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); /* Handle delete */ }}
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
                             <p className="text-sm text-slate-500 font-medium truncate">{item.email || item.username || item.cardHolder}</p>
                             <button onClick={handleCopy} className="text-slate-400 hover:text-primary p-0.5 rounded transition-colors shrink-0">
                               <Copy className="w-3.5 h-3.5" />
                             </button>
                           </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg text-xs text-slate-600 font-mono tracking-tight border border-slate-100 shadow-inner overflow-hidden">
                            <span className="truncate">{item.password || item.cardNumber}</span>
                            <button onClick={handleCopy} className="text-slate-400 hover:text-primary p-0.5 rounded transition-colors shrink-0 ml-auto">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </main>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="min-h-screen flex flex-col bg-surface overflow-hidden">
            <Navbar onOpenSettings={() => setScreen('settings')} currentTab="settings" />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar currentTab="settings" setScreen={setScreen} onAddNew={handleAddNew} />
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cài Đặt</h1>
                    <p className="text-on-surface-variant text-sm mt-1">Quản lý bảo mật, thiết bị và phương thức xác thực của bạn.</p>
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
          </div>
        );
    }
  };

  return (
    <div className="font-sans antialiased">
      <AnimatePresence mode="wait">
        {renderScreen()}
      </AnimatePresence>

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
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    {editingItem ? <ShieldCheck className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  </div>
                </div>
                <Button variant="ghost" onClick={closeVaultModal} className="p-2 rounded-full hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-400" />
                </Button>
              </div>

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
                </div>

                <div className="space-y-5">
                  {modalTab === 'password' ? (
                    <>
                      <Input 
                        label="Tên gợi nhớ" 
                        type="text" 
                        defaultValue={editingItem?.title || ''}
                        placeholder="Ví dụ: Tài khoản Google" 
                      />
                      <Input 
                        label="Tên người dùng / Email" 
                        type="text" 
                        defaultValue={editingItem?.email || editingItem?.username || ''}
                        placeholder="name@email.com" 
                      />
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-sm font-bold text-slate-700 tracking-tight">Mật khẩu</label>
                          {!editingItem && <button className="text-xs font-bold text-primary hover:underline transition-colors uppercase tracking-wider">Tạo ngẫu nhiên</button>}
                        </div>
                        <div className="relative group">
                          <input 
                            type="password" 
                            defaultValue={editingItem?.password || ''}
                            placeholder="••••••••" 
                            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                          />
                          <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Input 
                        label="Tên gợi nhớ" 
                        type="text" 
                        defaultValue={editingItem?.title || ''}
                        placeholder="Ví dụ: Visa Platinum" 
                      />
                      <Input 
                        label="Tên chủ thẻ" 
                        type="text" 
                        defaultValue={editingItem?.cardHolder || ''}
                        className="uppercase" 
                        placeholder="NGUYEN VAN A" 
                      />
                      <Input 
                        label="Số thẻ" 
                        type="text" 
                        defaultValue={editingItem?.cardNumber || ''}
                        placeholder="0000 0000 0000 0000" 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Hạn dùng" defaultValue={editingItem?.expiry || ''} placeholder="MM / YY" />
                        <Input label="Mã CVV" type="password" placeholder="•••" />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5 px-1">
                    <label className="text-sm font-bold text-slate-700 tracking-tight">Ghi chú bổ sung</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-inner resize-none min-h-[100px]" 
                      placeholder="Thông tin thêm về mục này..." 
                    />
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={closeVaultModal}>Hủy bỏ</Button>
                <Button onClick={closeVaultModal} className="px-10">
                  {editingItem ? 'Cập nhật' : 'Lưu thông tin'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-2xl"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium">Đã sao chép vào bộ nhớ đệm</p>
            <button onClick={() => setShowToast(false)} className="ml-2 text-inverse-on-surface/60 hover:text-inverse-on-surface">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
