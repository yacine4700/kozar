"use client";

import React, { useState } from 'react';
import { Plus, X, Edit, Trash2, AlertTriangle, Loader2, User, Phone, MapPin } from 'lucide-react';
import { CustomerForm } from './CustomerForm';
import { deleteCustomer } from '@/actions/customers/delete-customer';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
  total_orders_count?: number;
  total_deliveries_count?: number;
  total_delivered_amount?: number;
}

interface CustomersManagerProps {
  customers: Customer[];
}

export const CustomersManager = ({ customers }: CustomersManagerProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openAddForm = () => {
    setCustomerToEdit(null);
    setIsFormOpen(true);
  };

  const openEditForm = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCustomerToEdit(null);
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    
    setIsDeleting(true);
    const result = await deleteCustomer(customerToDelete.id);
    setIsDeleting(false);
    
    if (result.success) {
      setCustomerToDelete(null);
    } else {
      alert(result.error || 'حدث خطأ أثناء الحذف');
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-slate-800">قائمة العملاء</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">إجمالي العملاء: {customers.length}</p>
        </div>
        <button 
          onClick={openAddForm}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة عميل جديد
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">التاجر / المتجر</th>
                <th className="px-6 py-4">معلومات الاتصال</th>
                <th className="px-6 py-4 text-center">الطلبات / التوصيلات</th>
                <th className="px-6 py-4 text-left">قيمة التوصيلات المنجزة</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    لا يوجد عملاء حالياً. أضف العميل الأول!
                  </td>
                </tr>
              ) : (
                customers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                           <User size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-base">{customer.name}</div>
                          <div className="text-xs font-bold text-slate-400 mt-1">
                            {new Date(customer.created_at).toLocaleDateString('ar-DZ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone size={14} className="text-slate-400 shrink-0" />
                          <span className="font-bold font-mono" dir="ltr">{customer.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span className="font-medium text-sm truncate max-w-[150px]">{customer.address || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-black" title="عدد الطلبات">
                          طلبات: {customer.total_orders_count || 0}
                        </div>
                        <div className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg text-xs font-black" title="عدد التوصيلات">
                          توصيل: {customer.total_deliveries_count || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="font-black text-lg text-emerald-600">
                        {customer.total_delivered_amount ? customer.total_delivered_amount.toLocaleString() : '0'} د.ج
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => openEditForm(customer)}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-xl" 
                          title="تعديل"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setCustomerToDelete(customer)}
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
          <div className="relative w-full max-w-2xl my-auto bg-white rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <button 
              onClick={closeForm}
              className="absolute top-6 left-6 w-10 h-10 bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors z-20"
            >
              <X size={20} />
            </button>
            <div className="max-h-[85vh] overflow-y-auto p-2">
              <CustomerForm 
                onSuccess={closeForm} 
                initialData={customerToEdit || undefined} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isDeleting && setCustomerToDelete(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">تأكيد الحذف</h3>
            <p className="text-slate-500 font-medium mb-8">
              هل أنت متأكد من حذف العميل <span className="text-slate-800 font-bold">"{customerToDelete.name}"</span>؟ 
              <br/>
              <span className="text-red-500 text-sm mt-2 block">ملاحظة: لا يمكن حذف العميل إذا كان لديه طلبات سابقة.</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setCustomerToDelete(null)}
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
                  'نعم، احذف العميل'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
