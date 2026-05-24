"use client";

import React from 'react';
import { useOrderSystem } from '@/hooks/useOrderSystem';
import ModelBlock from './ModelBlock';
import { SuccessView } from './SuccessView';
import { SearchBar } from './SearchBar';
import { MerchantForm } from './MerchantForm';
import { ReviewModal } from './ReviewModal';
import { StickyFooter } from './StickyFooter';
import { Product } from '@/types';

interface OrderFormProps {
  products: Product[];
}

export const OrderForm: React.FC<OrderFormProps> = ({ products }) => {
  const {
    view,
    showReviewModal,
    customer,
    setCustomer,
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    setIsSearchFocused,
    suggestions,
    filteredModels,
    handleSearchSubmit,
    handleSuggestionClick,
    clearFilter,
    toggleModelSelection,
    updateModelData,
    selectedModels,
    modelStates,
    totalPieces,
    handleOpenReview,
    handleCloseReview,
    handleFinalConfirm,
    isSubmitting
  } = useOrderSystem(products);

  if (view === 'success') {
    return <SuccessView onReset={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen pb-40">
      {/* Dynamic Header */}
      <header className="bg-indigo-700 text-white relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/50 rounded-full -mr-[20rem] -mt-[20rem] blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-900/40 rounded-full -ml-[15rem] -mb-[15rem] blur-3xl"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 mb-10 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full text-indigo-50 text-xs font-black uppercase tracking-[0.2em]">
            <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></span>
            نظام طلبات الجملة المباشر
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-tight drop-shadow-sm">
            زهرة الربيع <span className="text-indigo-300">للأناقة</span>
          </h1>
          <p className="text-indigo-100/70 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-12">
            منصة حصرية لتجار الجملة المعتمدين لطلب الموديلات التقليدية الجزائرية بأعلى جودة.
          </p>

          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            suggestions={suggestions}
            handleSearchSubmit={handleSearchSubmit}
            handleSuggestionClick={handleSuggestionClick}
            clearFilter={clearFilter}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#f8fafc] transform skew-y-[-3deg] origin-bottom-right translate-y-12"></div>
      </header>

      <main className="max-w-4xl mx-auto px-4 relative z-20 -mt-16 space-y-24">
        <form onSubmit={handleOpenReview} className="space-y-24">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-100">١</div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">بيانات التاجر</span>
            </div>
            <div className="w-12 h-0.5 bg-slate-200"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white text-slate-400 border-2 border-slate-100 rounded-2xl flex items-center justify-center font-black">٢</div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">الموديلات</span>
            </div>
          </div>

          <MerchantForm 
            customer={customer}
            setCustomer={setCustomer}
          />

          <section className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
                  <span className="text-indigo-600">/</span> تشكيلة الموديلات الحالية
                </h2>
                <p className="text-slate-400 mt-2 font-medium italic">أحدث صيحات اللباس التقليدي للأطفال من إنتاجنا</p>
              </div>
              <div className="bg-white border border-slate-100 px-6 py-3 rounded-full shadow-sm flex items-center gap-4">
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {[1,2,3].map(i => <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-${i*100+100}`}></div>)}
                </div>
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">+120 تاجر يطلبون الآن</span>
              </div>
            </div>

            <div className="space-y-8">
              {filteredModels.length > 0 ? (
                filteredModels.map(id => {
                  const product = products.find(p => p.id === id);
                  if (!product) return null;
                  
                  const modelState = modelStates[id] || {
                    productId: id,
                    modelName: product.name,
                    selected: false,
                    colorOrders: {}
                  };

                  return (
                    <ModelBlock
                      key={id}
                      product={product}
                      model={modelState}
                      onToggle={toggleModelSelection}
                      onUpdate={updateModelData}
                    />
                  );
                })
              ) : (
                <div className="bg-white rounded-[3rem] p-10 md:p-20 text-center border-2 border-dashed border-slate-100">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4">عذراً، لم نجد نتائج مطابقة</h3>
                  <p className="text-slate-400 font-medium mb-10">جرب البحث بكلمات أخرى أو تصفح القائمة الكاملة</p>
                  <button
                    type="button"
                    onClick={clearFilter}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    عرض جميع الموديلات
                  </button>
                </div>
              )}
            </div>
          </section>

          <StickyFooter 
            selectedCount={selectedModels.length}
            totalPieces={totalPieces}
          />
        </form>
      </main>

      <ReviewModal 
        isOpen={showReviewModal}
        onClose={handleCloseReview}
        onConfirm={handleFinalConfirm}
        isSubmitting={isSubmitting}
        customer={customer}
        selectedModels={selectedModels}
        products={products}
      />
    </div>
  );
};
