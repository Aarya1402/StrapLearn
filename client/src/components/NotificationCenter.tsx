"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCircle2, Info, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { getNotifications, markAsRead } from '@/lib/notification';
import type { Notification } from '@/lib/types/notification';

interface NotificationCenterProps {
  jwt: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const popoverRef = React.useRef<HTMLDivElement>(null);
  const notifiedIds = React.useRef<Set<string>>(new Set());

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    setMounted(true);
    requestNotificationPermission();

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const showNativeNotification = (n: Notification) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    
    // Check if we've already notified for this ID in this session
    if (notifiedIds.current.has(n.documentId)) return;
    notifiedIds.current.add(n.documentId);

    const notification = new Notification(n.title, {
      body: n.message,
      icon: '/favicon.ico',
    });

    notification.onclick = () => {
      window.focus();
      if (n.link) window.location.href = n.link;
    };
  };

  const fetchNotifications = async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      const data = await getNotifications();
      const notificationList = Array.isArray(data) ? data : [];
      
      // Notify for EACH unread notification not yet broadcasted
      if (opts?.silent && notificationList.length > 0) {
        notificationList
          .filter(n => !n.isRead)
          .forEach(n => showNativeNotification(n));
      }

      setNotifications(notificationList);
      setUnreadCount(notificationList.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setErrorMessage('Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => fetchNotifications({ silent: true }), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const handleMarkAsRead = async (docId: string) => {
    try {
      await markAsRead(docId);
      setNotifications(prev => prev.map(n => n.documentId === docId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadDocIds = notifications.filter(n => !n.isRead).map(n => n.documentId);
    if (unreadDocIds.length === 0) return;

    try {
      await Promise.all(unreadDocIds.map((docId) => markAsRead(docId)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      setErrorMessage('Unable to mark all notifications as read.');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <BookOpen size={16} className="text-blue-500" />;
      case 'completion': return <GraduationCap size={16} className="text-emerald-500" />;
      case 'quiz': return <CheckCircle2 size={16} className="text-amber-500" />;
      default: return <Info size={16} className="text-brand-500" />;
    }
  };

  const unreadCountLabel = unreadCount > 99 ? '99+' : unreadCount.toString();

  // Keep newest ordering from API but lift unread items to the top.
  const sortedNotifications = [...notifications].sort(
    (a, b) => Number(a.isRead) - Number(b.isRead)
  );
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary transition-all hover:bg-brand-50 hover:text-brand-600 active:scale-90"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-4 ring-background animate-in zoom-in duration-300"
            title={`${unreadCount} unread`}
          >
            {unreadCountLabel}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute right-0 top-full z-50 mt-4 w-screen max-w-[420px] origin-top-right rounded-[2rem] border border-border bg-white dark:bg-zinc-950 p-1 shadow-[0_30px_60px_rgba(0,0,0,0.25)] animate-in slide-in-from-top-2 fade-in duration-300"
        >
          <div className="flex flex-col h-[600px] max-h-[70vh] overflow-hidden bg-white dark:bg-zinc-900 rounded-[1.8rem]">
              
              {/* Popover Header */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-800/30">
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter text-foreground uppercase leading-none">Identity Alerts</h2>
                  <p className="text-[9px] font-bold text-muted-foreground mt-2 uppercase tracking-[0.2em] opacity-50">Signal Hub</p>
                </div>
                <div className="flex items-center gap-2">
                   {unreadCount > 0 && (
                     <button
                       onClick={handleMarkAllAsRead}
                       className="h-8 flex items-center rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 text-[9px] font-black uppercase tracking-widest text-brand-600 hover:bg-brand-500/20 transition-all"
                     >
                       Mark All Read
                     </button>
                   )}
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-brand-500 font-black text-[10px]">
                     {unreadCount}
                   </div>
                </div>
              </div>

              {/* Notification Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {errorMessage ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                    <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">{errorMessage}</div>
                    <button
                      onClick={() => fetchNotifications()}
                      className="rounded-xl border border-border/60 bg-background px-4 py-2 text-[9px] font-black uppercase tracking-widest hover:bg-secondary transition-colors"
                    >
                      Retry System
                    </button>
                  </div>
                ) : isLoading && notifications.length === 0 ? (
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-24 rounded-2xl border border-border/50 bg-secondary/10 animate-pulse"
                      />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50">
                      <Bell size={24} className="text-muted-foreground/30" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">No active signals</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.documentId}
                      className={`relative flex flex-col gap-3 overflow-hidden rounded-[1.4rem] border border-border/50 bg-secondary/10 p-5 transition-all hover:bg-secondary/20 ${!n.isRead ? 'ring-1 ring-brand-500/20 bg-brand-50/5' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background border border-border/40 shadow-sm">
                          {getTypeIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-[8px] font-black uppercase tracking-widest ${!n.isRead ? 'text-brand-500' : 'text-muted-foreground/40'}`}>
                              {n.type} hub
                            </span>
                            <span className="text-[8px] font-bold text-muted-foreground/20 italic">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h3 className="text-md font-black italic tracking-tight text-foreground leading-tight truncate">
                            {n.title}
                          </h3>
                        </div>
                        {!n.isRead && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(n.documentId);
                            }}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white shadow-lg shadow-brand-500/10 hover:scale-110 active:scale-90 transition-all"
                            title="Clear Alert"
                          >
                            <CheckCircle2 size={12} />
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] font-bold text-muted-foreground/70 leading-snug">
                         {n.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/20">
                           <Clock size={8} />
                           {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                        
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* Popover Footer */}
              <div className="px-6 py-4 text-center border-t border-border/20 bg-secondary/5">
                 <button 
                   onClick={() => setIsOpen(false)}
                   className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/20 hover:text-brand-500 transition-colors"
                 >
                   Clear Viewport
                 </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
