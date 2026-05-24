"use client";

import React from 'react';
import { ALGERIAN_STATES } from '@/constants';
import { CustomerInfo } from '@/types';

interface MerchantFormProps {
  customer: CustomerInfo;
  setCustomer: (customer: CustomerInfo) => void;
}

export const MerchantForm: React.FC<MerchantFormProps> = ({ customer, setCustomer }) => {
  return (
    <section className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-white p-8 md:p-14">
      <div className="mb-12">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
          <span className="text-indigo-600">/</span> بيانات المحل التجاري
        </h2>
        <p className="text-slate-400 mt-2 font-medium">يرجى إدخال البيانات الصحيحة لضمان تواصلنا معك بنجاح</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-500 uppercase tracking-[0.1em] mr-1 block">
            اسم التاجر / المحل <span className="text-indigo-500">*</span>
          </label>
          <input
            required
            type="text"
            value={customer.merchantName}
            onChange={(e) => setCustomer({ ...customer, merchantName: e.target.value })}
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
            placeholder="مثال: محلات النور للملابس"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-black text-slate-500 uppercase tracking-[0.1em] mr-1 block">
            رقم الواتساب <span className="text-indigo-500">*</span>
          </label>
          <input
            required
            type="tel"
            value={customer.whatsapp}
            onChange={(e) => setCustomer({ ...customer, whatsapp: e.target.value })}
            className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 ltr text-right"
            placeholder="06 XX XX XX XX"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-[0.1em] mr-1 block">
            الولاية <span className="text-indigo-500">*</span>
          </label>
          <div className="relative group">
            <select
              required
              value={customer.state}
              onChange={(e) => setCustomer({ ...customer, state: e.target.value })}
              className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer pr-14 group-hover:border-indigo-300"
            >
              <option value="">اختر ولايتك من القائمة...</option>
              {ALGERIAN_STATES.map((state, idx) => (
                <option key={state} value={state}>{idx + 1} - {state}</option>
              ))}
            </select>
            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
