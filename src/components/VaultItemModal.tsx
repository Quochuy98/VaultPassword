import type { ChangeEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { getMaskedSecretPreview, getSecretFieldMeta } from '../lib/secretField';
import { Button, Input } from './AppShell';

type VaultItemType = 'password' | 'card' | 'personal';

type EditingItem = {
  type: VaultItemType;
} | null;

type Props = {
  isOpen: boolean;
  editingItem: EditingItem;
  modalTab: VaultItemType;
  setModalTab: (tab: VaultItemType) => void;
  closeVaultModal: () => void;
  modalTitle: string;
  setModalTitle: (value: string) => void;
  modalLogin: string;
  setModalLogin: (value: string) => void;
  modalPassword: string;
  setModalPassword: (value: string) => void;
  showModalPassword: boolean;
  setShowModalPassword: (value: boolean | ((prev: boolean) => boolean)) => void;
  modalCardHolder: string;
  setModalCardHolder: (value: string) => void;
  modalCardNumber: string;
  setModalCardNumber: (value: string) => void;
  modalCardExpiry: string;
  setModalCardExpiry: (value: string) => void;
  modalCardCvv: string;
  setModalCardCvv: (value: string) => void;
  modalPersonalId: string;
  setModalPersonalId: (value: string) => void;
  modalPersonalFullName: string;
  setModalPersonalFullName: (value: string) => void;
  modalPersonalEmail: string;
  setModalPersonalEmail: (value: string) => void;
  modalPersonalPhone: string;
  setModalPersonalPhone: (value: string) => void;
  modalPersonalAddress: string;
  setModalPersonalAddress: (value: string) => void;
  modalNotes: string;
  setModalNotes: (value: string) => void;
  onCopyValue: (value?: string) => void;
  handleSaveVault: () => Promise<void>;
};

export function VaultItemModal({
  isOpen,
  editingItem,
  modalTab,
  setModalTab,
  closeVaultModal,
  modalTitle,
  setModalTitle,
  modalLogin,
  setModalLogin,
  modalPassword,
  setModalPassword,
  showModalPassword,
  setShowModalPassword,
  modalCardHolder,
  setModalCardHolder,
  modalCardNumber,
  setModalCardNumber,
  modalCardExpiry,
  setModalCardExpiry,
  modalCardCvv,
  setModalCardCvv,
  modalPersonalId,
  setModalPersonalId,
  modalPersonalFullName,
  setModalPersonalFullName,
  modalPersonalEmail,
  setModalPersonalEmail,
  modalPersonalPhone,
  setModalPersonalPhone,
  modalPersonalAddress,
  setModalPersonalAddress,
  modalNotes,
  setModalNotes,
  onCopyValue,
  handleSaveVault,
}: Props) {
  const secretFieldMeta = getSecretFieldMeta({
    password: modalTab === 'password' ? modalPassword : undefined,
    cardNumber: modalTab === 'card' ? modalCardNumber : undefined,
    personalId: modalTab === 'personal' ? modalPersonalId : undefined,
  });

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="relative w-full max-w-lg bg-white rounded-4xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
          >
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
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg text-xs text-slate-600 font-mono tracking-tight border border-slate-100 shadow-inner overflow-hidden">
                  <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 border border-slate-200">
                    {secretFieldMeta.label}
                  </span>
                  <span className="truncate">
                    {secretFieldMeta.kind === 'password'
                      ? getMaskedSecretPreview(secretFieldMeta.rawValue)
                      : secretFieldMeta.displayValue || 'Chưa có dữ liệu'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopyValue(secretFieldMeta.rawValue || undefined)}
                    className="text-slate-400 hover:text-primary p-0.5 rounded transition-colors shrink-0 ml-auto"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                {modalTab === 'password' ? (
                  <>
                    <Input
                      label="Tên gợi nhớ"
                      type="text"
                      value={modalTitle}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalTitle(e.target.value)}
                      placeholder="Ví dụ: Tài khoản Google"
                      copyValue={modalTitle}
                      onCopy={onCopyValue}
                    />
                    <Input
                      label="Tên người dùng / Email"
                      type="text"
                      value={modalLogin}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalLogin(e.target.value)}
                      placeholder="name@email.com"
                      copyValue={modalLogin}
                      onCopy={onCopyValue}
                    />
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-slate-700 tracking-tight">Mật khẩu</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-wider"
                            onClick={() => onCopyValue(modalPassword)}
                          >
                            Sao chép
                          </button>
                          {!editingItem && (
                            <button
                              type="button"
                              className="text-xs font-bold text-primary hover:underline transition-colors uppercase tracking-wider"
                              onClick={() => {
                                const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
                                let out = '';
                                const arr = new Uint8Array(20);
                                crypto.getRandomValues(arr);
                                for (let i = 0; i < 20; i += 1) out += chars[arr[i] % chars.length];
                                setModalPassword(out);
                              }}
                            >
                              Tạo ngẫu nhiên
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="relative group">
                        <input
                          type={showModalPassword ? 'text' : 'password'}
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onCopyValue(modalPassword)}
                            className="text-slate-400 hover:text-primary transition-colors p-1"
                            aria-label="Copy password"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowModalPassword((v) => !v)}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            aria-label="Toggle password visibility"
                          >
                            {showModalPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : modalTab === 'card' ? (
                  <>
                    <Input
                      label="Tên gợi nhớ"
                      type="text"
                      value={modalTitle}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalTitle(e.target.value)}
                      placeholder="Ví dụ: Visa Platinum"
                      copyValue={modalTitle}
                      onCopy={onCopyValue}
                    />
                    <Input
                      label="Tên chủ thẻ"
                      type="text"
                      value={modalCardHolder}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalCardHolder(e.target.value)}
                      className="uppercase"
                      placeholder="NGUYEN VAN A"
                      copyValue={modalCardHolder}
                      onCopy={onCopyValue}
                    />
                    <Input
                      label="Số thẻ"
                      type="text"
                      value={modalCardNumber}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      copyValue={modalCardNumber}
                      onCopy={onCopyValue}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Hạn dùng"
                        value={modalCardExpiry}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setModalCardExpiry(e.target.value)}
                        placeholder="MM / YY"
                        copyValue={modalCardExpiry}
                        onCopy={onCopyValue}
                      />
                      <Input
                        label="Mã CVV"
                        type="password"
                        value={modalCardCvv}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setModalCardCvv(e.target.value)}
                        placeholder="•••"
                        copyValue={modalCardCvv}
                        onCopy={onCopyValue}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Input
                      label="Tên hồ sơ"
                      type="text"
                      value={modalTitle}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalTitle(e.target.value)}
                      placeholder="Ví dụ: CCCD / Hộ chiếu"
                      copyValue={modalTitle}
                      onCopy={onCopyValue}
                    />
                    <Input
                      label="Họ và tên"
                      type="text"
                      value={modalPersonalFullName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalPersonalFullName(e.target.value)}
                      placeholder="Nguyen Van A"
                      copyValue={modalPersonalFullName}
                      onCopy={onCopyValue}
                    />
                    <Input
                      label="Mã định danh"
                      type="text"
                      value={modalPersonalId}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalPersonalId(e.target.value)}
                      placeholder="012345678901"
                      copyValue={modalPersonalId}
                      onCopy={onCopyValue}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Email"
                        type="email"
                        value={modalPersonalEmail}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setModalPersonalEmail(e.target.value)}
                        placeholder="name@email.com"
                        copyValue={modalPersonalEmail}
                        onCopy={onCopyValue}
                      />
                      <Input
                        label="Số điện thoại"
                        type="text"
                        value={modalPersonalPhone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setModalPersonalPhone(e.target.value)}
                        placeholder="09xxxxxxxx"
                        copyValue={modalPersonalPhone}
                        onCopy={onCopyValue}
                      />
                    </div>
                    <Input
                      label="Địa chỉ"
                      type="text"
                      value={modalPersonalAddress}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setModalPersonalAddress(e.target.value)}
                      placeholder="Địa chỉ liên hệ"
                      copyValue={modalPersonalAddress}
                      onCopy={onCopyValue}
                    />
                  </>
                )}

                <div className="space-y-1.5 px-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 tracking-tight">Ghi chú bổ sung</label>
                    <button
                      type="button"
                      onClick={() => onCopyValue(modalNotes)}
                      className="text-xs font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-wider"
                    >
                      Sao chép
                    </button>
                  </div>
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
  );
}

