"use client";

import React, { useState } from 'react';
import { UserProfile, createUser, updateUserStatus, deleteUser, updateUser } from '@/actions/settings/users.actions';
import { UserPermissions, PagePermissionKey, ActionPermissionKey } from '@/lib/permissions';
import { Users, Plus, Shield, User, X, Check, Loader2, Trash2, Power, Edit } from 'lucide-react';

const PAGE_LABELS: Record<PagePermissionKey, string> = {
  dashboard: 'لوحة القيادة',
  orders: 'الطلبات',
  inventory: 'المخزون',
  production: 'خطة الإنتاج',
  customers: 'العملاء',
  products: 'المنتجات',
  settings: 'الإعدادات',
  'purchase-orders': 'طلبات الشراء'
};

const ACTION_LABELS: Record<ActionPermissionKey, string> = {
  'orders.create': 'إنشاء الطلبات',
  'orders.edit': 'تعديل الطلبات',
  'orders.delete': 'حذف الطلبات',
  'inventory.modify': 'تعديل المخزون (إضافة/سحب)',
  'settings.manage_users': 'إدارة المستخدمين'
};

export function UserManagementView({ users }: { users: UserProfile[] }) {
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const defaultPermissions: UserPermissions = {
    pages: { dashboard: true, orders: true },
    actions: {}
  };

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'employee',
    permissions: defaultPermissions as UserPermissions
  });

  const openAddModal = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'employee',
      permissions: defaultPermissions
    });
    setModalMode('add');
    setEditingUserId(null);
    setError(null);
    setSuccess(null);
  };

  const openEditModal = (user: UserProfile) => {
    setFormData({
      email: user.email || '',
      password: '', // blank for edit unless they want to reset, but our update action doesn't handle password yet
      full_name: user.full_name || '',
      role: user.role,
      permissions: (user.permissions as UserPermissions) || defaultPermissions
    });
    setModalMode('edit');
    setEditingUserId(user.id);
    setError(null);
    setSuccess(null);
  };

  const handleTogglePagePerm = (key: PagePermissionKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        pages: {
          ...prev.permissions.pages,
          [key]: !prev.permissions.pages?.[key]
        }
      }
    }));
  };

  const handleToggleActionPerm = (key: ActionPermissionKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        actions: {
          ...prev.permissions.actions,
          [key]: !prev.permissions.actions?.[key]
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    let result;
    if (modalMode === 'add') {
      result = await createUser({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role,
        permissions: formData.permissions
      });
    } else if (modalMode === 'edit' && editingUserId) {
      result = await updateUser(editingUserId, {
        full_name: formData.full_name,
        role: formData.role,
        permissions: formData.permissions
      });
    }
    
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(modalMode === 'add' ? "تم إضافة المستخدم بنجاح." : "تم تحديث المستخدم بنجاح.");
      setTimeout(() => {
        setSuccess(null);
        setModalMode(null);
      }, 2000);
    }
    
    setIsSubmitting(false);
  };

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await updateUserStatus(userId, newStatus);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟')) {
      await deleteUser(userId);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">إدارة المستخدمين</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">إضافة وتعديل حسابات المدراء والموظفين والصلاحيات</p>
          </div>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
        >
          <Plus size={18} />
          <span>مستخدم جديد</span>
        </button>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" dir="rtl">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={!isSubmitting ? () => setModalMode(null) : undefined}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">
                    {modalMode === 'add' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setModalMode(null)}
                disabled={isSubmitting}
                className="w-8 h-8 bg-white border-2 border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-full flex items-center justify-center transition-all disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold">{error}</div>}
              {success && <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold">{success}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required={modalMode === 'add'}
                    disabled={modalMode === 'edit'}
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all text-left dir-ltr disabled:opacity-60"
                  />
                </div>
                {modalMode === 'add' && (
                  <div>
                    <label className="block text-sm font-black text-gray-700 mb-2">كلمة المرور</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all text-left dir-ltr"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-black text-gray-700 mb-2">الصلاحية (الرول)</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-gray-900 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent outline-none transition-all"
                  >
                    <option value="employee">موظف (Employee)</option>
                    <option value="admin">مدير (Admin)</option>
                  </select>
                </div>
              </div>

              {formData.role === 'employee' && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <h4 className="font-black text-gray-900 mb-4">صلاحيات الوصول (للموظفين)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">الصفحات المسموحة</h5>
                      <div className="space-y-2">
                        {Object.entries(PAGE_LABELS).map(([key, label]) => {
                          const isChecked = !!formData.permissions.pages?.[key as PagePermissionKey];
                          return (
                            <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleTogglePagePerm(key as PagePermissionKey)}
                                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                              />
                              <span className="text-sm font-bold text-slate-700">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">الإجراءات المسموحة</h5>
                      <div className="space-y-2">
                        {Object.entries(ACTION_LABELS).map(([key, label]) => {
                          const isChecked = !!formData.permissions.actions?.[key as ActionPermissionKey];
                          return (
                            <label key={key} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleToggleActionPerm(key as ActionPermissionKey)}
                                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                              />
                              <span className="text-sm font-bold text-slate-700">{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end pt-4 mt-6 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-black transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {modalMode === 'add' ? 'إنشاء الحساب' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">المستخدم</th>
              <th className="px-6 py-4">البريد الإلكتروني</th>
              <th className="px-6 py-4 text-center">الصلاحية</th>
              <th className="px-6 py-4 text-center">الحالة</th>
              <th className="px-6 py-4 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-black text-gray-900">{user.full_name || 'بدون اسم'}</td>
                <td className="px-6 py-4 text-gray-500 dir-ltr text-right">{user.email || '---'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black ${
                    user.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                    {user.role === 'admin' ? 'مدير' : 'موظف'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-black ${
                    user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.status === 'active' ? 'نشط' : 'معطل'}
                  </span>
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openEditModal(user)}
                      title="تعديل الصلاحيات"
                      className="p-2 bg-slate-100 text-slate-500 hover:bg-sky-100 hover:text-sky-600 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => toggleStatus(user.id, user.status)}
                      title={user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      className={`p-2 rounded-lg transition-colors ${
                        user.status === 'active' 
                          ? 'bg-slate-100 text-slate-500 hover:bg-amber-100 hover:text-amber-600' 
                          : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-600'
                      }`}
                    >
                      <Power size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      title="حذف الحساب"
                      className="p-2 bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">
                  لا يوجد مستخدمين مسجلين
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
