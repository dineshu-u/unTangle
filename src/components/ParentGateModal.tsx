import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X } from 'lucide-react';
import { sounds } from '../utils/audio';

interface ParentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentGateModal: React.FC<ParentGateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, language } = useApp();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const num1 = 4;
  const num2 = 3;
  const expected = num1 + num2; // 7

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer.trim(), 10) === expected) {
      sounds.playTap();
      onSuccess();
      onClose();
      setAnswer('');
      setError(false);
    } else {
      sounds.playWobble();
      setError(true);
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border-2 border-amber-200 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-1">
          {t.parentPinTitle}
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 leading-tight">
          {t.parentPinDesc}
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3">
          <span className="text-xs font-semibold text-amber-900 block mb-0.5">
            {t.parentPinPrompt}
          </span>
          <div className="text-xl font-bold text-amber-950 font-mono tracking-widest">
            {num1} + {num2} = ?
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <input
            type="number"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError(false);
            }}
            placeholder="?"
            className={`w-full text-center text-lg font-bold px-3 py-2 rounded-xl border outline-none transition-all ${
              error
                ? 'border-rose-400 bg-rose-50 text-rose-800'
                : 'border-slate-300 focus:border-emerald-500 bg-slate-50'
            }`}
            autoFocus
          />

          {error && (
            <p className="text-[11px] text-rose-600 font-semibold">
              {language === 'ta' ? 'தவறான விடை. மீண்டும் முயற்சிக்கவும்.' : 'Oops! Please try again.'}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors"
            >
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            >
              {t.enterParentGate}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
