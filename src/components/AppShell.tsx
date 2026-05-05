import React from 'react';
import {
  Bell,
  Briefcase,
  FileText,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Star,
  Trash2,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';

export type MainTab = 'dashboard' | 'settings';

export const Button = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10 border border-primary/20',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-100',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input = ({ label, icon: Icon, error, ...props }: any) => (
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

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
  >
    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${active ? 'fill-current' : ''}`} />
    {label}
  </button>
);

export const Navbar = ({
  onOpenSettings,
  onGoDashboard,
  currentTab,
  searchQuery,
  setSearchQuery,
  userLabel,
}: {
  onOpenSettings: () => void;
  onGoDashboard: () => void;
  currentTab: MainTab;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userLabel: string;
}) => (
  <nav className="sticky top-0 z-40 w-full bg-white border-b border-outline-variant/60 px-6 h-16 flex items-center justify-between shadow-sm">
    <button onClick={onGoDashboard} className="flex items-center gap-3">
      <div className="bg-primary text-white p-2 rounded-lg md:hidden">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <span className="text-xl font-bold tracking-tight hidden md:block text-slate-900">VaultGuard</span>
    </button>

    <div className="flex-1 max-w-xl mx-12 relative hidden md:block">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-slate-400" />
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
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
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-white" />
        </Button>
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

      <button
        onClick={onOpenSettings}
        className={`flex items-center gap-3 p-1 pr-3 rounded-full transition-all group ${currentTab === 'settings' ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
      >
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-xs font-bold border border-orange-200 shadow-sm transition-transform group-hover:scale-105">
          {userLabel.slice(0, 2).toUpperCase()}
        </div>
        <span className="text-sm font-semibold text-slate-700 hidden sm:block truncate max-w-[140px]">{userLabel}</span>
      </button>
    </div>
  </nav>
);

export const Sidebar = ({
  currentTab,
  onSelectTab,
  onAddNew,
  onGoDashboard,
}: {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  onAddNew: () => void;
  onGoDashboard: () => void;
}) => (
  <aside className="w-64 border-r border-outline-variant bg-white h-[calc(100vh-65px)] flex-col p-4 hidden md:flex sticky top-[65px]">
    <div className="mb-6 px-4 py-2">
      <button onClick={onGoDashboard} className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">V</div>
        <span className="text-lg font-bold tracking-tight text-on-surface">VaultGuard</span>
      </button>
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
      <SidebarItem icon={ShieldCheck} label="Tất cả mục" active={currentTab === 'dashboard'} onClick={() => onSelectTab('dashboard')} />
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
          <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} className="bg-primary h-full rounded-full" />
        </div>
      </div>
    </div>
  </aside>
);

