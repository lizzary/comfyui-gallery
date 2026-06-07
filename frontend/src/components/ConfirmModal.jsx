import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false,
}) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-overlay/70 backdrop-blur-sm"
          onClick={onCancel}
        />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative bg-surface-secondary border border-edge-primary rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
        >
          <h3 className="text-lg font-semibold text-content-primary mb-2">{title}</h3>
          <p className="text-sm text-content-tertiary mb-6">{message}</p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm bg-surface-tertiary hover:bg-edge-secondary text-content-secondary transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                danger
                  ? 'bg-danger hover:bg-danger-hover'
                  : 'bg-accent hover:bg-accent-hover'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
