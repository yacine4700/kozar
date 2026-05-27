"use client";

import React, { useState } from 'react';
import { Plus, X, Edit, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { deleteProduct } from '@/actions/products/delete-product';

interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock_quantity: number;
  colors: string[];
  sizes: string[];
  created_at: string;
}

interface ProductsManagerProps {
  products: Product[];
}

export const ProductsManager = ({ products }: ProductsManagerProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAddForm = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setProductToEdit(null);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    setIsDeleting(true);
    const result = await deleteProduct(productToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      setProductToDelete(null);
    } else {
      alert(result.error || 'حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-lg font-black text-slate-800">قائمة المنتجات</h3>
          <p className="text-xs font-medium text-slate-500 mt-1">إجمالي المنتجات: {products.length}</p>
        </div>
        <button 
          onClick={openAddForm}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة منتج جديد
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-black uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">المنتج (SKU)</th>
                <th className="px-4 py-3">السعر</th>
                <th className="px-4 py-3">المقاسات</th>
                <th className="px-4 py-3">الألوان</th>
                <th className="px-4 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    لا توجد منتجات حالياً. أضف منتجك الأول!
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{product.name}</div>
                      {product.sku && <div className="text-xs font-mono text-slate-400 mt-1">{product.sku}</div>}
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{product.price} د.ج</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.sizes?.length ? product.sizes.map(size => (
                          <span key={size} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-lg font-bold">{size}</span>
                        )) : <span className="text-slate-400 text-xs">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {product.colors?.length ? product.colors.map(color => (
                          <span key={color} className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2 py-1 rounded-lg font-bold">{color}</span>
                        )) : <span className="text-slate-400 text-xs">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openEditForm(product)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-xl" 
                          title="تعديل"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setProductToDelete(product)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-xl" 
                          title="حذف"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Add/Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeForm}
          ></div>
          <div className="relative w-full max-w-3xl my-auto bg-white rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <button 
              onClick={closeForm}
              className="absolute top-6 left-6 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-20"
            >
              <X size={20} />
            </button>
            <div className="max-h-[85vh] overflow-y-auto p-2">
              <ProductForm 
                onSuccess={closeForm} 
                initialData={productToEdit || undefined} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setProductToDelete(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">تأكيد الحذف</h3>
            <p className="text-slate-500 font-medium mb-8">
              هل أنت متأكد من حذف المنتج <span className="text-slate-800 font-bold">"{productToDelete.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  'نعم، احذف المنتج'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

