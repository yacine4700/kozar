"use client";

import React, { useState } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';

interface Props {
  label: string;
  value: string | null;
  placeholder?: string;
  type?: 'text' | 'textarea';
  ltr?: boolean;
  onSave: (val: string) => Promise<{ error?: string } | void>;
}

export function SettingsListItem({ label, value, placeholder, type = 'text', ltr, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    const res = await onSave(currentValue);
    if (res?.error) {
      setError(res.error);
      setIsSaving(false);
    } else {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value || '');
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="py-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 last:border-0 hover:bg-slate-50/50 transition-colors px-2 -mx-2 rounded-xl">
      <div className="w-full sm:w-1/3 shrink-0 pt-1">
        <span className="text-sm font-black text-gray-700">{label}</span>
      </div>
      
      <div className="flex-1 w-full">
        {isEditing ? (
          <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 origin-top">
            {type === 'textarea' ? (
              <textarea 
                value={currentValue}
                onChange={e => setCurrentValue(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none h-28 text-sm font-medium transition-all"
                dir={ltr ? 'ltr' : 'rtl'}
                autoFocus
              />
            ) : (
              <input 
                type="text"
                value={currentValue}
                onChange={e => setCurrentValue(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-white border-2 border-indigo-100 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-medium transition-all ${ltr ? 'text-left font-mono' : ''}`}
                dir={ltr ? 'ltr' : 'rtl'}
                autoFocus
              />
            )}
            
            {error && (
              <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg">{error}</p>
            )}
            
            <div className="flex gap-2 pt-1">
              <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-5 py-2 rounded-lg text-xs font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm shadow-indigo-200"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                حفظ
              </button>
              <button 
                onClick={handleCancel} 
                disabled={isSaving} 
                className="flex items-center gap-1.5 bg-slate-100 text-slate-600 px-5 py-2 rounded-lg text-xs font-black hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50 transition-all"
              >
                <X size={14} />
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full group pt-1">
            <span className={`text-sm ${value ? 'font-bold text-gray-900' : 'font-medium text-gray-400 italic'} ${ltr && value ? 'font-mono tracking-wider' : ''}`} dir={ltr && value ? 'ltr' : 'rtl'}>
              {value || 'لم يتم التحديد'}
            </span>
            <button 
              onClick={() => {
                setCurrentValue(value || '');
                setIsEditing(true);
              }}
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-black shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Edit2 size={14} />
              تعديل
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
