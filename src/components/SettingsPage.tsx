import type { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Key, Lock, Plus, Shield } from 'lucide-react';
import { Button, Input, Navbar, Sidebar } from './AppShell';

type Props = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  userLabel: string;
  goTab: (tab: 'dashboard' | 'settings') => void;
  handleAddNew: () => void;
  onGoDashboard: () => void;
  signOut: () => Promise<void>;
  pushNotify: (message: string, kind: 'copy' | 'success' | 'error') => void;
  onAfterSignOut: () => void;
  vaultPassCurrent: string;
  setVaultPassCurrent: (value: string) => void;
  vaultPassNext: string;
  setVaultPassNext: (value: string) => void;
  vaultPassConfirm: string;
  setVaultPassConfirm: (value: string) => void;
  handleChangeVaultPassword: () => Promise<void>;
  changingVaultPass: boolean;
};

export function SettingsPage({
  searchQuery,
  setSearchQuery,
  userLabel,
  goTab,
  handleAddNew,
  onGoDashboard,
  signOut,
  pushNotify,
  onAfterSignOut,
  vaultPassCurrent,
  setVaultPassCurrent,
  vaultPassNext,
  setVaultPassNext,
  vaultPassConfirm,
  setVaultPassConfirm,
  handleChangeVaultPassword,
  changingVaultPass,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-surface overflow-hidden"
    >
      <Navbar
        onOpenSettings={() => goTab('settings')}
        onGoDashboard={onGoDashboard}
        currentTab="settings"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userLabel={userLabel}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab="settings" onSelectTab={goTab} onAddNew={handleAddNew} onGoDashboard={onGoDashboard} />
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
                  onAfterSignOut();
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setVaultPassCurrent(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Input
                    label="Mật khẩu Vault mới"
                    type="password"
                    value={vaultPassNext}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setVaultPassNext(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                  />
                  <Input
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    value={vaultPassConfirm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setVaultPassConfirm(e.target.value)}
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
                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all shadow-inner" />
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
}

