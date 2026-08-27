import React, { useState, useEffect } from 'react';
import { ApiKeyService } from '../services/apiKeyService';
import { Key, CheckCircle, AlertCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { sounds } from '../utils/audio';

interface GroqApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const GroqApiKeyModal: React.FC<GroqApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [newKeyInput, setNewKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isConfigured = ApiKeyService.hasApiKey();
  const isFromEnv = ApiKeyService.isEnvKeyConfigured();

  useEffect(() => {
    if (isOpen) {
      setNewKeyInput(''); // Always empty - never expose actual key or masked dots
      setStatusMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!newKeyInput.trim() && !isConfigured) return;
    sounds.playTap();

    if (newKeyInput.trim()) {
      ApiKeyService.setApiKey(newKeyInput.trim());
      setNewKeyInput('');
    }

    sounds.playCelebration();
    if (onKeySaved) onKeySaved();
    onClose();
  };

  const handleTestKey = async () => {
    sounds.playTap();
    setIsTesting(true);
    setStatusMsg(null);

    const testTarget = newKeyInput.trim() || ApiKeyService.getApiKey() || '';
    const result = await ApiKeyService.testKey(testTarget);
    setIsTesting(false);

    if (result.success) {
      sounds.playChime();
      setStatusMsg({ type: 'success', text: result.message });
    } else {
      sounds.playWobble();
      setStatusMsg({ type: 'error', text: result.message });
    }
  };

  const handleRemoveKey = () => {
    sounds.playTap();
    ApiKeyService.setApiKey('');
    setNewKeyInput('');
    setStatusMsg(null);
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border-2 border-amber-300 text-left relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-inner">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Groq AI Connection
            </h3>
            <span className="text-[10px] text-slate-500 font-semibold">
              Personalized Level Generation
            </span>
          </div>
        </div>

        {/* Status Display: Never shows actual key or dots */}
        <div className="mb-3.5">
          {isConfigured ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Already API key is there</span>
              </div>
              <p className="text-[10px] text-emerald-800 mt-1 leading-normal">
                {isFromEnv
                  ? 'Key is securely loaded from environment configuration.'
                  : 'Key is saved locally in browser memory.'}
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>No API Key Configured</span>
              </div>
              <p className="text-[10px] text-amber-800 mt-1 leading-normal">
                Enter your key below to activate live AI-generated levels.
              </p>
            </div>
          )}
        </div>

        {/* Input Field: Starts completely blank (never shows dots of existing key) */}
        <div className="space-y-2.5 mb-3">
          <div>
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              {isConfigured ? 'Update / Replace API Key:' : 'Enter Groq API Key:'}
            </label>
            <input
              type="password"
              value={newKeyInput}
              onChange={(e) => setNewKeyInput(e.target.value)}
              placeholder={isConfigured ? 'Enter new key to replace...' : 'Paste gsk_... key here'}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 outline-none font-mono bg-slate-50"
            />
          </div>

          {statusMsg && (
            <div
              className={`p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleTestKey}
              disabled={isTesting || (!newKeyInput.trim() && !isConfigured)}
              className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!newKeyInput.trim() && !isConfigured}
              className="flex-1 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {newKeyInput.trim() ? 'Save New Key' : 'Close'}
            </button>
          </div>
        </div>

        {isConfigured && !isFromEnv && (
          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleRemoveKey}
              className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
            >
              Remove Stored Key
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
