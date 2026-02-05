 import { useState, useEffect, useCallback } from 'react';
 
 type NotificationPermission = 'default' | 'granted' | 'denied';
 
 interface NotificationOptions {
   title: string;
   body?: string;
   icon?: string;
   tag?: string;
   requireInteraction?: boolean;
   data?: Record<string, any>;
 }
 
 interface UseNotificationsResult {
   isSupported: boolean;
   permission: NotificationPermission;
   isIOS: boolean;
   isStandalone: boolean;
   canRequestPermission: boolean;
   requestPermission: () => Promise<NotificationPermission>;
   sendNotification: (options: NotificationOptions) => void;
   getIOSInstructions: () => string;
 }
 
 const NOTIFICATION_PREFS_KEY = 'notification-preferences';
 
 interface NotificationPrefs {
   enabled: boolean;
   lastAsked: string | null;
   declinedCount: number;
 }
 
 function getPrefs(): NotificationPrefs {
   try {
     const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
     return stored ? JSON.parse(stored) : { enabled: true, lastAsked: null, declinedCount: 0 };
   } catch {
     return { enabled: true, lastAsked: null, declinedCount: 0 };
   }
 }
 
 function savePrefs(prefs: NotificationPrefs) {
   localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
 }
 
 export function useNotifications(): UseNotificationsResult {
   const [permission, setPermission] = useState<NotificationPermission>('default');
   const [isSupported, setIsSupported] = useState(false);
   const [isIOS, setIsIOS] = useState(false);
   const [isStandalone, setIsStandalone] = useState(false);
 
   useEffect(() => {
     // Check if notifications are supported
     const supported = 'Notification' in window;
     setIsSupported(supported);
 
     if (supported) {
       setPermission(Notification.permission);
     }
 
     // Detect iOS
     const ua = navigator.userAgent.toLowerCase();
     const ios = /iphone|ipad|ipod/.test(ua);
     setIsIOS(ios);
 
     // Check if running as standalone PWA
     const standalone = window.matchMedia('(display-mode: standalone)').matches 
       || (window.navigator as any).standalone === true;
     setIsStandalone(standalone);
   }, []);
 
   const canRequestPermission = isSupported && permission === 'default' && (!isIOS || isStandalone);
 
   const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
     if (!isSupported) {
       return 'denied';
     }
 
     // On iOS, notifications only work if app is installed to homescreen
     if (isIOS && !isStandalone) {
       return 'denied';
     }
 
     try {
       const result = await Notification.requestPermission();
       setPermission(result);
 
       const prefs = getPrefs();
       prefs.lastAsked = new Date().toISOString();
       if (result === 'denied') {
         prefs.declinedCount += 1;
       }
       savePrefs(prefs);
 
       return result;
     } catch (error) {
       console.error('Error requesting notification permission:', error);
       return 'denied';
     }
   }, [isSupported, isIOS, isStandalone]);
 
   const sendNotification = useCallback((options: NotificationOptions) => {
     if (!isSupported || permission !== 'granted') {
       console.warn('Notifications not available or not permitted');
       return;
     }
 
     const prefs = getPrefs();
     if (!prefs.enabled) {
       console.log('Notifications disabled by user preference');
       return;
     }
 
     try {
       const notification = new Notification(options.title, {
         body: options.body,
         icon: options.icon || '/icons/icon-192x192.png',
         tag: options.tag,
         requireInteraction: options.requireInteraction,
         data: options.data,
       });
 
       notification.onclick = () => {
         window.focus();
         if (options.data?.url) {
           window.location.href = options.data.url;
         }
         notification.close();
       };
     } catch (error) {
       console.error('Error sending notification:', error);
     }
   }, [isSupported, permission]);
 
   const getIOSInstructions = useCallback(() => {
     return 'To receive notifications on iOS, first add this app to your homescreen using the Share button in Safari, then enable notifications.';
   }, []);
 
   return {
     isSupported,
     permission,
     isIOS,
     isStandalone,
     canRequestPermission,
     requestPermission,
     sendNotification,
     getIOSInstructions,
   };
 }
 
 // Export preferences functions for use in settings
 export function getNotificationPrefs(): NotificationPrefs {
   return getPrefs();
 }
 
 export function setNotificationEnabled(enabled: boolean) {
   const prefs = getPrefs();
   prefs.enabled = enabled;
   savePrefs(prefs);
 }