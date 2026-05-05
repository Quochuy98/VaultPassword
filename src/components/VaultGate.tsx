import { useEffect, useState, type FormEvent } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * After a persisted session loads, the vault encryption key is not in memory
 * until the user re-enters their master password.
 */
export function VaultGate() {
  const navigate = useNavigate();
  const { vaultKey, unlockVault, supabase } = useAuth();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [checkingMeta, setCheckingMeta] = useState(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setCheckingMeta(true);
      const { data } = await supabase.auth.getUser();
      const salt = data.user?.user_metadata?.vault_salt as string | undefined;
      if (active) {
        setIsFirstSetup(!salt);
        setCheckingMeta(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [supabase]);

  if (vaultKey) {
    return <Outlet />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setBusy(true);
    const { error } = await unlockVault(password);
    setBusy(false);
    if (error) {
      setFormError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-surface-bright to-surface-container-low">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {isFirstSetup ? 'Thiết lập mật khẩu Vault' : 'Mở khóa Vault'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {checkingMeta
                ? 'Đang kiểm tra cấu hình vault...'
                : isFirstSetup
                  ? 'Lần đầu đăng nhập, hãy tạo mật khẩu vault để mã hóa dữ liệu của bạn.'
                  : 'Nhập mật khẩu vault để giải mã dữ liệu.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">
              {isFirstSetup ? 'Mật khẩu Vault mới' : 'Mật khẩu Vault'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none shadow-sm"
                placeholder="••••••••"
              />
            </div>
            {!checkingMeta && !formError && isFirstSetup && (
              <p className="text-xs text-slate-500 font-medium">
                Ghi nhớ mật khẩu này, bạn sẽ cần để mở khóa dữ liệu đã mã hóa.
              </p>
            )}
            {formError && <p className="text-xs text-red-600 font-medium">{formError}</p>}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/10 border border-primary/20 hover:bg-primary/95 transition-all disabled:opacity-50"
          >
            {busy ? 'Đang xử lý…' : isFirstSetup ? 'Tạo & mở khóa' : 'Mở khóa'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="w-full text-sm font-bold text-slate-500 hover:text-primary transition-colors"
          >
            Quay lại đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
