import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Key, 
  CreditCard, 
  Search, 
  ArrowRight, 
  Download,
  Check
} from 'lucide-react';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'outline' | 'ghost';
}

const LandingButton: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyles = "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20",
    outline: "bg-white border-2 border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#f7f9fb]"
    >
      {/* Landing Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <span className="text-2xl font-black tracking-tighter text-slate-900">VaultGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Tính năng</a>
            <a href="#security" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Bảo mật</a>
            <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Giá cả</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onStart}
              className="text-sm font-bold text-slate-600 hover:text-primary transition-colors"
            >
              Đăng nhập
            </button>
            <LandingButton onClick={onStart} className="hidden sm:flex">Bắt đầu ngay</LandingButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
              Mã hóa cấp quân sự AES-256
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Bảo vệ danh tính số.<br />
              <span className="text-primary">Đơn giản hóa cuộc sống.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Trình quản lý mật khẩu an toàn nhất thế giới. Lưu trữ mật khẩu, thẻ thanh toán và thông tin cá nhân của bạn trong một chiếc két sắt kỹ thuật số không thể xâm phạm.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <LandingButton onClick={onStart} className="w-full sm:w-auto py-4 px-10 text-lg h-[60px] gap-3">
                Tạo tài khoản miễn phí
                <ArrowRight className="w-5 h-5" />
              </LandingButton>
              <button className="w-full sm:w-auto py-4 px-10 text-lg h-[60px] font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-slate-200">
                Xem hướng dẫn
              </button>
            </div>
          </motion.div>

          {/* Hero Image Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-20 relative px-4"
          >
            <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative z-10">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-2">
                 <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                   <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                 </div>
                 <div className="flex-1 max-w-md mx-auto h-7 bg-white rounded-lg border border-slate-200 flex items-center px-3 text-[10px] text-slate-400 font-medium truncate">
                   vaultguard.io/dashboard/passwords
                 </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop" 
                alt="Dashboard Preview" 
                className="w-full h-auto object-cover aspect-video opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
            {/* Decorative blobs */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 -ml-32"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-orange-400/20 rounded-full blur-[100px] -translate-y-1/2 -mr-32"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Tính năng mạnh mẽ, bảo mật tối đa</h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">VaultGuard không chỉ lưu trữ mật khẩu, chúng tôi xây dựng một hệ sinh thái an toàn toàn diện.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: 'Mã hóa đầu cuối', desc: 'Dữ liệu của bạn được mã hóa bằng AES-256 trước khi rời khỏi thiết bị. Chúng tôi không bao giờ biết mật khẩu của bạn.' },
              { icon: Smartphone, title: 'Đa nền tảng', desc: 'Đồng bộ hóa tức thì trên tất cả trình duyệt và ứng dụng di động. Truy cập mọi lúc, mọi nơi.' },
              { icon: Key, title: 'Tự động điền', desc: 'Tiết kiệm thời gian với tính năng tự động điền thông minh và đăng nhập một chạm cực kỳ an toàn.' },
              { icon: ShieldCheck, title: 'Giám sát an ninh', desc: 'Cảnh báo ngay lập tức nếu dữ liệu của bạn bị lộ trong các vụ rò rỉ dữ liệu lớn trên thế giới.' },
              { icon: CreditCard, title: 'Thẻ thanh toán', desc: 'Lưu trữ thông tin thẻ tín dụng của bạn một cách an toàn và thanh toán trực tuyến nhanh chóng.' },
              { icon: Search, title: 'Tìm kiếm cực nhanh', desc: 'Tìm thấy hồ sơ bạn cần ngay lập tức với công cụ tìm kiếm được tối ưu hóa hiệu suất cao.' },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Proof Section */}
      <section id="security" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">
              Kiến trúc<br />
              <span className="text-primary">Zero-Knowledge</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
              VaultGuard được xây dựng trên nguyên tắc "Chúng tôi không biết gì về bạn". Mật khẩu chính của bạn không bao giờ được gửi lên máy chủ. Bạn là người duy nhất có chìa khóa két sắt của mình.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-black text-white mb-1">AES-256</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tiêu chuẩn mã hóa</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white mb-1">2FA/MFA</h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Xác thực đa yếu tố</p>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full max-w-lg">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
               <div className="space-y-6">
                 {[
                   { label: 'Cơ sở dữ liệu người dùng', status: 'Đã mã hóa' },
                   { label: 'Mật khẩu chính', status: 'Không bao giờ lưu trữ' },
                   { label: 'Ghi chú bảo mật', status: 'AES-256' },
                   { label: 'Mã TOTP', status: 'Cục bộ 100%' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                     <span className="text-slate-300 font-bold text-sm tracking-tight">{item.label}</span>
                     <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">{item.status}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#f7f9fb]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Gói giải pháp phù hợp với bạn</h2>
          <p className="text-slate-500 font-medium mb-16">Bắt đầu miễn phí và nâng cấp khi bạn cần nhiều hơn.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
             <div className="p-8 bg-white rounded-[2rem] border border-slate-200 flex flex-col">
               <h4 className="text-lg font-bold text-slate-900 mb-2">Miễn phí</h4>
               <div className="text-4xl font-black mb-6">$0<span className="text-sm text-slate-400">/tháng</span></div>
               <ul className="text-left space-y-4 mb-10 flex-1">
                 <li className="text-sm font-medium text-slate-600 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Lưu trữ không giới hạn</li>
                 <li className="text-sm font-medium text-slate-600 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 1 thiết bị hoạt động</li>
                 <li className="text-sm font-medium text-slate-600 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Web & Di động</li>
               </ul>
               <LandingButton onClick={onStart} variant="outline" className="w-full">Bắt đầu ngay</LandingButton>
             </div>

             <div className="p-8 bg-white rounded-[2rem] border-2 border-primary shadow-2xl relative overflow-hidden flex flex-col">
               <div className="absolute top-0 right-0 py-1.5 px-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">Phổ biến nhất</div>
               <h4 className="text-lg font-bold text-slate-900 mb-2">Cá nhân</h4>
               <div className="text-4xl font-black mb-6 text-primary">$2.99<span className="text-sm text-slate-400">/tháng</span></div>
               <ul className="text-left space-y-4 mb-10 flex-1">
                 <li className="text-sm font-bold text-slate-900 flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Thiết bị không giới hạn</li>
                 <li className="text-sm font-bold text-slate-900 flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Passkeys & Bảo mật nâng cao</li>
                 <li className="text-sm font-bold text-slate-900 flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Hỗ trợ ưu tiên 24/7</li>
               </ul>
               <LandingButton onClick={onStart} className="w-full">Dùng thử 14 ngày</LandingButton>
             </div>

             <div className="p-8 bg-white rounded-[2rem] border border-slate-200 flex flex-col">
               <h4 className="text-lg font-bold text-slate-900 mb-2">Gia đình</h4>
               <div className="text-4xl font-black mb-6">$4.50<span className="text-sm text-slate-400">/tháng</span></div>
               <ul className="text-left space-y-4 mb-10 flex-1">
                 <li className="text-sm font-medium text-slate-600 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Lên đến 6 thành viên</li>
                 <li className="text-sm font-medium text-slate-600 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Chia sẻ két sắt an toàn</li>
                 <li className="text-sm font-medium text-slate-600 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Quản lý tài khoản dễ dàng</li>
               </ul>
               <LandingButton onClick={onStart} variant="outline" className="w-full">Mua ngay</LandingButton>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-2">
               <ShieldCheck className="w-6 h-6 text-primary" />
               <span className="text-xl font-black tracking-tighter text-slate-900">VaultGuard</span>
             </div>
             <p className="text-slate-400 text-sm font-medium">© 2024 VaultGuard Inc. Bảo vệ tài sản số của bạn.</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Bảo mật</a>
            <a href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Quyền riêng tư</a>
            <a href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Trợ giúp</a>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <Download className="w-4 h-4" />
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};
