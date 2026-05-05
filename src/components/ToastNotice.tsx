import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, X } from 'lucide-react';

export type ToastState = { message: string; kind: 'copy' | 'success' | 'error' } | null;

type Props = {
  toast: ToastState;
  onClose: () => void;
};

export function ToastNotice({ toast, onClose }: Props) {
  return (
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
            onClick={onClose}
            className={`ml-2 shrink-0 ${toast.kind === 'error' ? 'text-white/70 hover:text-white' : 'text-inverse-on-surface/60 hover:text-inverse-on-surface'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

