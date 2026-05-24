import React from 'react';
import { ModelOrder, AgeSize, ColorOrder, Product } from '@/types';

interface ModelBlockProps {
  product: Product;
  model: ModelOrder;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ModelOrder>) => void;
}

const ModelBlock: React.FC<ModelBlockProps> = ({ product, model, onToggle, onUpdate }) => {
  const hasColors = product.colors && product.colors.length > 0;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const isSelected = model.selected;

  const toggleColor = (colorName: string) => {
    const newColorOrders = { ...model.colorOrders };
    if (newColorOrders[colorName]) {
      delete newColorOrders[colorName];
    } else {
      newColorOrders[colorName] = {
        singleQuantity: '',
        quantities: (product.sizes || []).reduce((acc, age) => ({ ...acc, [age]: '' }), {} as Record<AgeSize, number | string>)
      };
    }
    onUpdate(product.id, { colorOrders: newColorOrders });
  };

  const updateColorOrder = (colorKey: string, updates: Partial<ColorOrder>) => {
    onUpdate(product.id, {
      colorOrders: {
        ...model.colorOrders,
        [colorKey]: { ...model.colorOrders[colorKey], ...updates }
      }
    });
  };

  const handleQuantityChange = (colorKey: string, age: AgeSize, value: string | number) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value.toString(), 10));
    const currentOrder = model.colorOrders[colorKey];
    updateColorOrder(colorKey, {
      quantities: {
        ...currentOrder.quantities,
        [age]: numValue
      }
    });
  };

  const handleSingleQuantityChange = (colorKey: string, value: string | number) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value.toString(), 10));
    updateColorOrder(colorKey, { singleQuantity: numValue });
  };

  const adjustQuantity = (colorKey: string, age: AgeSize, delta: number) => {
    const currentQty = Number(model.colorOrders[colorKey].quantities[age]) || 0;
    handleQuantityChange(colorKey, age, currentQty + delta);
  };

  const adjustSingleQuantity = (colorKey: string, delta: number) => {
    const currentQty = Number(model.colorOrders[colorKey].singleQuantity) || 0;
    handleSingleQuantityChange(colorKey, currentQty + delta);
  };

  const calculateTotalForColor = (order: ColorOrder) => {
    if (hasSizes) {
      return (product.sizes || []).reduce((acc, age) => acc + (Number(order.quantities[age]) || 0), 0);
    }
    return Number(order.singleQuantity) || 0;
  };

  return (
    <div 
      className={`group transition-all duration-300 rounded-[2.5rem] border-2 overflow-hidden ${
        isSelected 
          ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-100/40 ring-4 ring-indigo-500/5' 
          : 'border-slate-100 bg-white/50 hover:border-indigo-200 hover:shadow-lg shadow-slate-200/20'
      }`}
    >
      {/* Interactive Header */}
      <div 
        onClick={() => onToggle(product.id)}
        className={`flex items-center justify-between p-6 md:p-8 cursor-pointer select-none transition-all ${
          isSelected ? 'bg-indigo-50/20 border-b border-indigo-100/50' : ''
        }`}
      >
        <div className="flex items-center gap-4 md:gap-6">
          <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 transform ${
            isSelected 
              ? 'bg-indigo-600 border-indigo-600 scale-110 rotate-0 shadow-lg shadow-indigo-200' 
              : 'bg-white border-slate-200 group-hover:border-indigo-300 group-hover:rotate-12 rotate-[-8deg]'
          }`}>
            {isSelected ? (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-slate-300 group-hover:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h3 className={`text-2xl md:text-3xl font-black transition-colors ${
                isSelected ? 'text-indigo-900' : 'text-slate-600'
              }`}>
                {product.name}
              </h3>
              {isSelected && (
                <span className="bg-indigo-600 text-xs text-white font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                  مختار
                </span>
              )}
            </div>
            {!isSelected ? (
              <span className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                إضافة هذا الموديل للطلبية
              </span>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                <span className="text-sm font-black text-indigo-500 uppercase tracking-widest">يتم الآن تحديد الكميات</span>
              </div>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="hidden sm:flex flex-col items-end animate-in fade-in slide-in-from-left-4">
             <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">المجموع الحالي</span>
             <span className="text-3xl font-black text-indigo-600">
               {(Object.values(model.colorOrders) as ColorOrder[]).reduce((acc: number, order) => acc + calculateTotalForColor(order), 0)}
               <span className="text-sm mr-1 text-indigo-400">قطعة</span>
             </span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className={`collapse-transition ${isSelected ? 'open' : ''}`}>
        <div className="collapse-content">
          <div className="px-6 md:px-10 pb-10 pt-8 space-y-12">
            
            {/* 1. Color Selection */}
            {hasColors && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                  <label className="text-base font-black text-slate-600 uppercase tracking-widest">
                    ١. اختر الألوان المتوفرة
                  </label>
                </div>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map(c => {
                    const colorIsSelected = !!model.colorOrders[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleColor(c);
                        }}
                        className={`group/color relative px-8 py-4 rounded-[1.25rem] border-2 transition-all font-black flex items-center gap-3 active:scale-95 ${
                          colorIsSelected 
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'border-slate-100 bg-slate-50/50 text-slate-400 hover:border-indigo-200 hover:bg-white hover:text-indigo-600'
                        }`}
                      >
                        {c}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          colorIsSelected ? 'bg-white/20' : 'bg-slate-200 group-hover/color:bg-indigo-100'
                        }`}>
                          <svg className={`w-3.5 h-3.5 ${colorIsSelected ? 'text-white' : 'text-transparent group-hover/color:text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Quantities */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                <label className="text-base font-black text-slate-600 uppercase tracking-widest">
                  ٢. حدد الكميات المطلوبة بدقة
                </label>
              </div>

              <div className="grid grid-cols-1 gap-8">
                {(Object.entries(model.colorOrders) as [string, ColorOrder][]).map(([colorKey, order]) => (
                  <div 
                    key={colorKey} 
                    className="bg-white rounded-[2rem] p-8 border-2 border-slate-100 shadow-sm transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                           </svg>
                        </div>
                        <h4 className="text-xl font-black text-slate-800">
                          {hasColors ? `لون: ${colorKey}` : 'الكميات المطلوبة'}
                        </h4>
                      </div>
                      <div className="bg-indigo-600 px-6 py-2.5 rounded-full flex items-center gap-3 shadow-lg shadow-indigo-100">
                         <span className="text-xs font-black text-indigo-100 uppercase tracking-widest">المجموع الفرعي:</span>
                         <span className="text-xl font-black text-white">{calculateTotalForColor(order)}</span>
                      </div>
                    </div>
                    
                    {hasSizes ? (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
                        {product.sizes.map(age => (
                          <div key={age} className="flex flex-col group/input">
                            <span className="text-xs font-black text-slate-500 mb-3 uppercase tracking-tighter text-center">
                              {age}
                            </span>
                            <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-1.5 border-2 border-slate-50 focus-within:bg-white focus-within:border-indigo-500 transition-all">
                              <button
                                type="button"
                                onClick={() => adjustQuantity(colorKey, age, 1)}
                                className="w-10 h-10 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-90"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                              
                              <input
                                type="number"
                                min="0"
                                value={order.quantities[age]}
                                onChange={(e) => handleQuantityChange(colorKey, age, e.target.value)}
                                className="w-full text-center text-xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-slate-200"
                                placeholder="0"
                              />
                              
                              <button
                                type="button"
                                onClick={() => adjustQuantity(colorKey, age, -1)}
                                className="w-10 h-10 rounded-xl bg-white text-slate-400 hover:bg-red-500 hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-90"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col max-w-[320px]">
                        <span className="text-xs font-black text-slate-500 mb-3 uppercase tracking-widest text-right">أدخل الكمية الإجمالية لهذا الموديل</span>
                        <div className="flex items-center gap-4 bg-slate-50 rounded-3xl p-3 border-2 border-slate-50 focus-within:bg-white focus-within:border-indigo-500 transition-all">
                          <button
                            type="button"
                            onClick={() => adjustSingleQuantity(colorKey, 1)}
                            className="w-16 h-16 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border-2 border-slate-100 flex items-center justify-center transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={order.singleQuantity}
                            onChange={(e) => handleSingleQuantityChange(colorKey, e.target.value)}
                            className="w-full text-center text-4xl font-black text-slate-900 bg-transparent border-none outline-none focus:ring-0"
                            placeholder="0"
                          />

                          <button
                            type="button"
                            onClick={() => adjustSingleQuantity(colorKey, -1)}
                            className="w-16 h-16 rounded-2xl bg-white text-slate-400 hover:bg-red-500 hover:text-white border-2 border-slate-100 flex items-center justify-center transition-all shadow-sm active:scale-90"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M20 12H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {hasColors && Object.keys(model.colorOrders).length === 0 && (
                  <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6 transform -rotate-6">
                       <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.828 2.828a2 2 0 010 2.828l-8.486 8.486L11 21M11 7.343l4.243 4.243m-4.243-4.243L9.757 8.586" />
                       </svg>
                    </div>
                    <p className="text-slate-500 font-black text-xl max-w-sm leading-relaxed">
                      الرجاء اختيار الألوان أولاً لتتمكن من إدخال الكميات المطلوبة
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelBlock;
