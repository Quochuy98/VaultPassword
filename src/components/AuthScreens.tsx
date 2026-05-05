import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  Lock,
  Mail,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type AuthNotify = (message: string, variant: 'success' | 'error') => void;

const AuthButton = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'ghost';
}) => {
  const base =
    'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';
  const variants = {
    primary:
      'bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/10 border border-primary/20',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export function LoginScreen({ onNotify }: { onNotify: AuthNotify }) {
  const navigate = useNavigate();
  const { session, loading, authBusy, signIn, signUp, signInWithGoogle, unlockVault } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        onNotify(error.message, 'error');
        return;
      }
      const unlocked = await unlockVault(password);
      if (unlocked.error) {
        onNotify(unlocked.error.message, 'error');
        return;
      }
      onNotify('Đăng nhập thành công', 'success');
      navigate('/dashboard', { replace: true });
      return;
    }

    const { error, needsEmailConfirmation } = await signUp(email, password);
    if (error) {
      onNotify(error.message, 'error');
      return;
    }
    if (needsEmailConfirmation) {
      onNotify('Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư.', 'success');
      return;
    }
    const unlocked = await unlockVault(password);
    if (unlocked.error) {
      onNotify(unlocked.error.message, 'error');
      return;
    }
    onNotify('Đăng ký thành công', 'success');
    navigate('/dashboard', { replace: true });
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      onNotify(error.message, 'error');
    }
  };

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
          <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/20 rounded-full blur-xl" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">VaultGuard</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Sẵn sàng bảo mật không gian của bạn</p>
      </div>

      <div className="w-full max-w-[440px] bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            {authMode === 'login' ? 'Đăng nhập' : 'Tạo Vault mới'}
          </h2>
          <p className="text-slate-500 text-sm mb-10 font-medium">
            {authMode === 'login'
              ? 'Truy cập an toàn bằng mã hóa AES-256 nội tại.'
              : 'Đăng ký tài khoản Supabase để đồng bộ vault của bạn.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="w-full space-y-1.5">
              <label className="text-sm font-bold text-slate-700 tracking-tight">Địa chỉ Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-700 tracking-tight">Mật khẩu chính</label>
                {authMode === 'login' && (
                  <button type="button" className="text-xs font-bold text-primary hover:underline">
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-sm"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <AuthButton type="submit" disabled={authBusy || loading} className="w-full py-4 text-lg h-[56px] gap-3">
              {authBusy ? 'Đang xử lý…' : authMode === 'login' ? 'Bắt đầu phiên làm việc' : 'Tạo tài khoản'}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </AuthButton>
          </form>

          {authMode === 'login' && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="h-px bg-slate-200 flex-1" />
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">hoặc</span>
                <div className="h-px bg-slate-200 flex-1" />
              </div>
              <AuthButton
                type="button"
                variant="outline"
                className="w-full h-[52px] gap-3 font-bold"
                onClick={() => void handleGoogleSignIn()}
                disabled={authBusy || loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.226 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.155 7.959 3.041l5.657-5.657C34.047 6.053 29.277 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.003 13 24 13c3.059 0 5.842 1.155 7.959 3.041l5.657-5.657C34.047 6.053 29.277 4 24 4c-7.732 0-14.41 4.389-17.694 10.691z" />
                  <path fill="#4CAF50" d="M24 44c5.176 0 9.86-1.977 13.409-5.197l-6.19-5.238C29.157 35.091 26.687 36 24 36c-5.204 0-9.618-3.316-11.283-7.946l-6.522 5.025C9.442 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.565l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                Đăng nhập bằng Google
              </AuthButton>
            </>
          )}

          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-center items-center gap-2 text-sm">
            <p className="text-slate-500 font-medium">
              {authMode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </p>
            <button
              type="button"
              className="text-primary font-bold hover:underline"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            >
              {authMode === 'login' ? 'Tạo một Vault mới' : 'Đăng nhập'}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-outline text-center max-w-sm">
        Được bảo vệ bằng mã hóa cấp quân sự. Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
      </p>
    </motion.div>
  );
}

export function TwoFactorScreen() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (Number.isNaN(Number(element.value)) && element.value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
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

    const lastIndex = Math.min(pasteData.length - 1, 5);
    otpRefs.current[lastIndex]?.focus();
  };

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
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -ml-16 -mt-16" />

        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 text-primary group relative">
          <Smartphone className="w-10 h-10 transition-transform group-hover:scale-110" />
          <div className="absolute -inset-1 bg-primary/5 rounded-2xl blur-lg animate-pulse" />
        </div>

        <h1 className="text-3xl font-black mb-2 text-slate-900 tracking-tight">Xác thực 2 lớp</h1>
        <p className="text-slate-500 text-sm mb-10 px-4 font-medium">
          Vui lòng nhập mã xác thực từ ứng dụng Google Authenticator của bạn
        </p>

        <div className="flex justify-center gap-2 sm:gap-3 mb-10">
          {otp.map((digit, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(e.target as HTMLInputElement, i)}
                onKeyDown={(e) => handleOtpKeyDown(e, i)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className="w-11 h-14 sm:w-12 sm:h-16 text-center text-3xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
              />
              {i === 2 && <span className="text-slate-300 text-xl font-bold">−</span>}
            </div>
          ))}
        </div>

        <AuthButton onClick={() => navigate('/dashboard')} className="w-full py-4 text-lg h-[56px] gap-3">
          Xác thực danh tính
          <ShieldCheck className="w-5 h-5" />
        </AuthButton>

        <div className="mt-10 space-y-4">
          <button type="button" onClick={() => navigate('/login')} className="text-sm font-bold text-primary hover:underline block mx-auto">
            Quay lại đăng nhập
          </button>
          <p className="text-sm text-slate-500 font-medium">
            Không nhận được mã?{' '}
            <button type="button" className="text-slate-900 font-bold hover:text-primary transition-colors">
              Gửi lại yêu cầu
            </button>
          </p>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-1.5 text-xs text-outline">
        <Lock className="w-3 h-3" />
        <span>Được bảo mật bằng mã hóa đầu cuối</span>
      </div>
    </motion.div>
  );
}

