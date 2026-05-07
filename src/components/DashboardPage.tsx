import { AnimatePresence, motion } from 'framer-motion';
import { Copy, CreditCard, Edit, MoreHorizontal, Plus, Search, Trash2 } from 'lucide-react';
import type { MouseEvent } from 'react';
import { getSecretFieldMeta } from '../lib/secretField';
import { Button, Navbar, Sidebar } from './AppShell';

type VaultItem = {
  id: string;
  type: 'password' | 'card' | 'personal';
  title: string;
  email?: string;
  username?: string;
  cardHolder?: string;
  fullName?: string;
  personalId?: string;
  password?: string;
  cardNumber?: string;
  icon?: string;
  color?: string;
};

type Props = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  userLabel: string;
  handleAddNew: () => void;
  goTab: (tab: 'dashboard' | 'settings') => void;
  onGoDashboard: () => void;
  vaultLoading: boolean;
  filteredItems: VaultItem[];
  openEditModal: (item: VaultItem) => void;
  activeMenuId: string | null;
  setActiveMenuId: (value: string | null) => void;
  handleDeleteVaultItem: (id: string) => Promise<void>;
  handleCopy: (e: MouseEvent, value: string | undefined) => void;
  maskSecret: (value: string | undefined, maxDots?: number) => string;
};

export function DashboardPage({
  searchQuery,
  setSearchQuery,
  userLabel,
  handleAddNew,
  goTab,
  onGoDashboard,
  vaultLoading,
  filteredItems,
  openEditModal,
  activeMenuId,
  setActiveMenuId,
  handleDeleteVaultItem,
  handleCopy,
  maskSecret,
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
        currentTab="dashboard"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userLabel={userLabel}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentTab="dashboard" onSelectTab={goTab} onAddNew={handleAddNew} onGoDashboard={onGoDashboard} />
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
                {filteredItems.map((item) => {
                  const secretMeta = getSecretFieldMeta(item);

                  return (
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

                      <div className="flex items-center gap-2">
                        {item.type === 'card' ? (
                          <CreditCard className="w-5 h-5 text-slate-300" />
                        ) : (
                          <div className="flex -space-x-1 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
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
                                  onClick={() => {
                                    openEditModal(item);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                                >
                                  <Edit className="w-4 h-4 text-slate-400" />
                                  Chỉnh sửa
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
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
                        <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 border border-slate-200">
                          {secretMeta.label}
                        </span>
                        <span className="truncate">{secretMeta.kind === 'password' ? maskSecret(secretMeta.rawValue) : secretMeta.displayValue}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, secretMeta.rawValue || undefined)}
                          className="text-slate-400 hover:text-primary p-0.5 rounded transition-colors shrink-0 ml-auto"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
}

