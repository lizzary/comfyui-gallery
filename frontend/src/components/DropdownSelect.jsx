import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function DropdownSelect({
  icon: Icon,
  label,
  options,
  value,
  onChange,
  rightElement,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeOption = options.find((o) => o.value === value);
  const isActive = value && value !== 'none' && value !== '';

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all border ${
          isActive
            ? 'bg-accent/10 border-accent/30 text-accent'
            : 'bg-surface-tertiary border-edge-secondary text-content-secondary hover:border-edge-primary hover:text-content-primary'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">{label}</span>
        {isActive && (
          <span className="hidden sm:inline opacity-80">
            : {activeOption?.label}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {rightElement && <div className="ml-1">{rightElement}</div>}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full mt-1.5 left-0 min-w-[180px] bg-surface-secondary border border-edge-primary rounded-xl shadow-xl z-50 overflow-hidden py-1"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors text-left ${
                  value === opt.value
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-content-secondary hover:bg-surface-tertiary hover:text-content-primary'
                }`}
              >
                <span className={`w-4 flex justify-center text-xs ${
                  value === opt.value ? 'opacity-100' : 'opacity-0'
                }`}>
                  &#10003;
                </span>
                <span>{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
