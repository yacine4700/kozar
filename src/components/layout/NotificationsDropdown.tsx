"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ShoppingBag, Info, ExternalLink } from 'lucide-react';
import { AppNotification, getUnreadNotifications, markAsRead, markAllAsRead } from '@/actions/notifications/notifications.actions';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await getUnreadNotifications();
      if (data) setNotifications(data);
    };
    fetchInitial();
  }, []);

  // Setup Realtime Subscription
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          if (!newNotif.is_read) {
            setNotifications(prev => [newNotif, ...prev]);
            // Optional: You could play a sound here
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        (payload) => {
          const updatedNotif = payload.new as AppNotification;
          if (updatedNotif.is_read) {
            setNotifications(prev => prev.filter(n => n.id !== updatedNotif.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    setNotifications([]);
    await markAllAsRead();
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-sky-600 transition-colors rounded-full hover:bg-slate-50"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800">الإشعارات</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
              >
                <Check size={14} />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell size={32} className="mx-auto mb-3 text-slate-300 opacity-50" />
                <p className="text-sm font-medium">لا توجد إشعارات جديدة</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 hover:bg-slate-50 transition-colors group relative">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === 'new_order' ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'
                      }`}>
                        {notif.type === 'new_order' ? <ShoppingBag size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800">{notif.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(notif.created_at).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {notif.type === 'new_order' && notif.reference_id && (
                            <Link 
                              href={`/orders?id=${notif.reference_id}`}
                              onClick={() => {
                                handleMarkAsRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="text-[10px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                            >
                              <span>عرض الطلب</span>
                              <ExternalLink size={10} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="absolute left-4 top-4 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm"
                      title="تعليم كمقروء"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
