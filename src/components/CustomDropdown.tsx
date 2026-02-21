'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  value: string;
  options: Option[];
  placeholder: string;
  onChange: (value: string) => void;
}

export default function CustomDropdown({
  value,
  options,
  placeholder,
  onChange,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  // Close when click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 min-w-[170px]
                   rounded-2xl bg-white border border-slate-200
                   shadow-sm hover:border-blue-500
                   transition-all active:scale-95"
      >
        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
          {selectedLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute mt-2 w-full bg-white/95 backdrop-blur-md
                       border border-slate-200 rounded-2xl
                       shadow-xl overflow-hidden z-50"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-xs font-black
                  uppercase tracking-wider transition-all
                  ${
                    value === option.value
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}