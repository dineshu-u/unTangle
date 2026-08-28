import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';
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
  const expected = 7;

  const handleVerifyAndEnter = (val?: number) => {
    const entered = val !== undefined ? val : parseInt(answer.trim(), 10);
    if (entered === expected) {
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

  const handleDirectEnter = () => {
    sounds.playTap();
    onSuccess();
    onClose();
    setAnswer('');
    setError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyAndEnter();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border-2 border-amber-300 text-center relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          {t.parentPinTitle}
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 leading-tight">
          {t.parentPinDesc}
        </p>

        {/* Math Question Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3">
          <span className="text-xs font-semibold text-amber-900 block mb-0.5">
            {t.parentPinPrompt}
          </span>
          <div className="text-2xl font-black text-amber-950 tracking-widest my-1">
            {num1} + {num2} = ?
          </div>

          {/* Quick Choice Buttons for 1-Tap Entrance */}
          <div className="flex justify-center gap-2 mt-2">
            {[5, 7, 9].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleVerifyAndEnter(val)}
                className={`w-12 py-1.5 rounded-xl font-black text-sm border-2 transition-all cursor-pointer ${
                  val === 7
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-xs active:scale-95'
                    : 'bg-white hover:bg-amber-100/80 text-amber-950 border-amber-200 active:scale-95'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="number"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError(false);
            }}
            placeholder="Or type answer here..."
            className={`w-full text-center text-sm font-bold px-3 py-2 rounded-xl border outline-none transition-all ${
              error
                ? 'border-rose-400 bg-rose-50 text-rose-800'
                : 'border-slate-300 focus:border-emerald-500 bg-slate-50'
            }`}
          />

          {error && (
            <p className="text-[11px] text-rose-600 font-semibold">
              {language === 'ta' ? 'தவறான விடை. மீண்டும் முயற்சிக்கவும்.' : 'Oops! Please tap 7 to enter.'}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {language === 'ta' ? 'ரத்து' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              {t.enterParentGate}
            </button>
          </div>
        </form>

        {/* Direct Bypass for Instant Parent Access */}
        <button
          type="button"
          onClick={handleDirectEnter}
          className="mt-3 text-[10.5px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>{language === 'ta' ? 'நேரடியாக பெற்றோர் பகுதிக்குச் செல் ➡️' : 'Enter Parent Dashboard Directly ➡️'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
