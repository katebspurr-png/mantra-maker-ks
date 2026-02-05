 import { useState, useEffect } from 'react';
 import { Bell, BellOff, BellRing, AlertCircle, Send, Smartphone } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Switch } from '@/components/ui/switch';
 import { Label } from '@/components/ui/label';
 import { useNotifications, getNotificationPrefs, setNotificationEnabled } from '@/hooks/useNotifications';
 import { NotificationPrompt } from '@/components/NotificationPrompt';
 import { useToast } from '@/hooks/use-toast';
 
 export function NotificationSettings() {
   const { 
     isSupported, 
     permission, 
     isIOS, 
     isStandalone,
     sendNotification,
     requestPermission
   } = useNotifications();
   const { toast } = useToast();
   
   const [isEnabled, setIsEnabled] = useState(true);
   const [showPrompt, setShowPrompt] = useState(false);
 
   useEffect(() => {
     const prefs = getNotificationPrefs();
     setIsEnabled(prefs.enabled);
   }, []);
 
   const handleToggle = (checked: boolean) => {
     setIsEnabled(checked);
     setNotificationEnabled(checked);
     toast({
       title: checked ? 'Notifications enabled' : 'Notifications disabled',
     });
   };
 
   const handleSendTest = () => {
     sendNotification({
       title: '✨ Test Notification',
       body: 'Great! Notifications are working perfectly.',
       tag: 'test-notification',
     });
     toast({
       title: 'Test notification sent!',
       description: 'Check your notification center.',
     });
   };
 
   const handleRequestPermission = async () => {
     if (permission === 'denied') {
       // Can't re-request, show instructions
       toast({
         title: 'Permission blocked',
         description: 'Please enable notifications in your browser settings.',
       });
       return;
     }
     
     if (isIOS && !isStandalone) {
       setShowPrompt(true);
       return;
     }
     
     setShowPrompt(true);
   };
 
   // Not supported
   if (!isSupported) {
     return (
       <div className="bg-card rounded-xl border border-border p-4">
         <div className="flex items-start gap-3">
           <BellOff className="w-5 h-5 text-muted-foreground mt-0.5" />
           <div>
             <h3 className="font-medium text-sm">Notifications</h3>
             <p className="text-sm text-muted-foreground mt-1">
               Your browser doesn't support notifications.
             </p>
           </div>
         </div>
       </div>
     );
   }
 
   // iOS not installed
   if (isIOS && !isStandalone) {
     return (
       <>
         <div className="bg-card rounded-xl border border-border p-4">
           <div className="flex items-start gap-3">
             <Smartphone className="w-5 h-5 text-primary mt-0.5" />
             <div className="flex-1">
               <h3 className="font-medium text-sm">Notifications</h3>
               <p className="text-sm text-muted-foreground mt-1">
                 To receive notifications on iPhone, add this app to your homescreen first.
               </p>
               <Button 
                 variant="outline" 
                 size="sm" 
                 className="mt-3"
                 onClick={() => setShowPrompt(true)}
               >
                 Learn how
               </Button>
             </div>
           </div>
         </div>
         <NotificationPrompt trigger={showPrompt} onClose={() => setShowPrompt(false)} />
       </>
     );
   }
 
   // Permission not yet requested
   if (permission === 'default') {
     return (
       <>
         <div className="bg-card rounded-xl border border-border p-4">
           <div className="flex items-start gap-3">
             <Bell className="w-5 h-5 text-primary mt-0.5" />
             <div className="flex-1">
               <h3 className="font-medium text-sm">Notifications</h3>
               <p className="text-sm text-muted-foreground mt-1">
                 Get gentle reminders to keep your practice going.
               </p>
               <Button 
                 size="sm" 
                 className="mt-3"
                 onClick={handleRequestPermission}
               >
                 <BellRing className="w-4 h-4 mr-1.5" />
                 Enable Notifications
               </Button>
             </div>
           </div>
         </div>
         <NotificationPrompt trigger={showPrompt} onClose={() => setShowPrompt(false)} />
       </>
     );
   }
 
   // Permission denied
   if (permission === 'denied') {
     return (
       <div className="bg-card rounded-xl border border-border p-4">
         <div className="flex items-start gap-3">
           <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
           <div>
             <h3 className="font-medium text-sm">Notifications Blocked</h3>
             <p className="text-sm text-muted-foreground mt-1">
               Notifications are blocked for this site. To enable them, go to your browser settings and allow notifications for this website.
             </p>
           </div>
         </div>
       </div>
     );
   }
 
   // Permission granted - show toggle and test button
   return (
     <div className="bg-card rounded-xl border border-border p-4 space-y-4">
       <div className="flex items-center justify-between">
         <div className="flex items-start gap-3">
           <BellRing className="w-5 h-5 text-primary mt-0.5" />
           <div>
             <h3 className="font-medium text-sm">Notifications</h3>
             <p className="text-xs text-muted-foreground mt-0.5">
               Receive practice reminders
             </p>
           </div>
         </div>
         <Switch
           checked={isEnabled}
           onCheckedChange={handleToggle}
           aria-label="Toggle notifications"
         />
       </div>
 
       {isEnabled && (
         <div className="pt-2 border-t border-border">
           <Button 
             variant="outline" 
             size="sm"
             onClick={handleSendTest}
             className="w-full"
           >
             <Send className="w-4 h-4 mr-1.5" />
             Send Test Notification
           </Button>
         </div>
       )}
     </div>
   );
 }