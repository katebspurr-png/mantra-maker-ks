 import { useState, useEffect } from 'react';
 import { Bell, BellRing, Smartphone, X, CheckCircle2, XCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { useNotifications } from '@/hooks/useNotifications';
 import { useIsMobile } from '@/hooks/use-mobile';
 
 const PROMPT_STORAGE_KEY = 'notification-prompt-state';
 const DAYS_BETWEEN_PROMPTS = 7;
 const MAX_PROMPTS = 3;
 
 interface PromptState {
   promptCount: number;
   lastPrompted: string | null;
   neverAsk: boolean;
 }
 
 function getPromptState(): PromptState {
   try {
     const stored = localStorage.getItem(PROMPT_STORAGE_KEY);
     return stored ? JSON.parse(stored) : { promptCount: 0, lastPrompted: null, neverAsk: false };
   } catch {
     return { promptCount: 0, lastPrompted: null, neverAsk: false };
   }
 }
 
 function savePromptState(state: PromptState) {
   localStorage.setItem(PROMPT_STORAGE_KEY, JSON.stringify(state));
 }
 
 function shouldShowPrompt(permission: NotificationPermission): boolean {
   // Never show if already granted or denied
   if (permission !== 'default') return false;
 
   const state = getPromptState();
   
   // User said never ask
   if (state.neverAsk) return false;
   
   // Reached max prompts
   if (state.promptCount >= MAX_PROMPTS) return false;
   
   // Check time since last prompt
   if (state.lastPrompted) {
     const lastDate = new Date(state.lastPrompted);
     const now = new Date();
     const daysSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
     if (daysSince < DAYS_BETWEEN_PROMPTS) return false;
   }
   
   return true;
 }
 
 interface NotificationPromptProps {
   /** Trigger externally - when true, shows the prompt */
   trigger?: boolean;
   onClose?: () => void;
 }
 
 export function NotificationPrompt({ trigger, onClose }: NotificationPromptProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [resultState, setResultState] = useState<'idle' | 'granted' | 'denied'>('idle');
   const { 
     isSupported, 
     permission, 
     isIOS, 
     isStandalone,
     canRequestPermission,
     requestPermission 
   } = useNotifications();
   const isMobile = useIsMobile();
 
   // Auto-show on mobile after delay (only if conditions are met)
   useEffect(() => {
     if (!isMobile || !isSupported) return;
     if (!shouldShowPrompt(permission)) return;
     
     // Don't auto-show on iOS if not standalone
     if (isIOS && !isStandalone) return;
     
     const timer = setTimeout(() => {
       setIsOpen(true);
     }, 5000); // Show after 5 seconds
     
     return () => clearTimeout(timer);
   }, [isMobile, isSupported, permission, isIOS, isStandalone]);
 
   // Handle external trigger
   useEffect(() => {
     if (trigger) {
       setIsOpen(true);
       setResultState('idle');
     }
   }, [trigger]);
 
   const handleClose = () => {
     setIsOpen(false);
     setResultState('idle');
     onClose?.();
   };
 
   const handleMaybeLater = () => {
     const state = getPromptState();
     state.promptCount += 1;
     state.lastPrompted = new Date().toISOString();
     savePromptState(state);
     handleClose();
   };
 
   const handleNeverAsk = () => {
     const state = getPromptState();
     state.neverAsk = true;
     savePromptState(state);
     handleClose();
   };
 
   const handleEnableNotifications = async () => {
     const result = await requestPermission();
     
     if (result === 'granted') {
       setResultState('granted');
       // Auto-close after showing success
       setTimeout(() => {
         handleClose();
       }, 2000);
     } else if (result === 'denied') {
       setResultState('denied');
     }
   };
 
   // Don't render if not supported
   if (!isSupported) return null;
 
   // iOS-specific messaging when not installed
   const showIOSInstallMessage = isIOS && !isStandalone;
 
   return (
     <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
       <DialogContent className="max-w-[340px] rounded-2xl p-0 gap-0 border-border/50">
         {/* Result states */}
         {resultState === 'granted' && (
           <div className="p-8 text-center">
             <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
               <CheckCircle2 className="w-8 h-8 text-primary" />
             </div>
             <h3 className="text-lg font-semibold mb-2">You're all set! 🎉</h3>
             <p className="text-sm text-muted-foreground">
               We'll send you helpful reminders for your practice.
             </p>
           </div>
         )}
 
         {resultState === 'denied' && (
           <div className="p-6">
             <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
               <XCircle className="w-7 h-7 text-muted-foreground" />
             </div>
             <h3 className="text-lg font-semibold text-center mb-2">No problem!</h3>
             <p className="text-sm text-muted-foreground text-center mb-4">
               You can always enable notifications later in your browser settings.
             </p>
             <Button variant="ghost" className="w-full" onClick={handleClose}>
               Got it
             </Button>
           </div>
         )}
 
         {/* Main prompt */}
         {resultState === 'idle' && (
           <>
             {/* Header with icon */}
             <div className="pt-6 pb-2 text-center">
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                 <BellRing className="w-8 h-8 text-primary" />
               </div>
               <DialogHeader className="px-5">
                 <DialogTitle className="text-xl font-semibold">
                   Stay on track with gentle reminders 🔔
                 </DialogTitle>
               </DialogHeader>
             </div>
 
             {/* Benefits */}
             <div className="px-5 py-4">
               {showIOSInstallMessage ? (
                 <div className="bg-secondary/50 rounded-xl p-4 text-center">
                   <Smartphone className="w-8 h-8 text-primary mx-auto mb-3" />
                   <p className="text-sm font-medium mb-2">
                     Add to homescreen first
                   </p>
                   <p className="text-xs text-muted-foreground">
                     To receive notifications on iPhone, first save this app to your homescreen using Safari's Share button, then enable notifications.
                   </p>
                 </div>
               ) : (
                 <div className="space-y-3">
                   <p className="text-sm text-muted-foreground text-center mb-4">
                     Get helpful nudges to keep your affirmation practice going strong.
                   </p>
                   
                   <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                     <span className="text-lg">✨</span>
                     <div>
                       <p className="text-sm font-medium">Daily practice reminders</p>
                       <p className="text-xs text-muted-foreground">
                         Gentle nudges at the time that works for you
                       </p>
                     </div>
                   </div>
 
                   <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                     <span className="text-lg">🎯</span>
                     <div>
                       <p className="text-sm font-medium">Stay consistent</p>
                       <p className="text-xs text-muted-foreground">
                         Build your habit with timely motivation
                       </p>
                     </div>
                   </div>
 
                   <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                     <span className="text-lg">🔒</span>
                     <div>
                       <p className="text-sm font-medium">Respectful & private</p>
                       <p className="text-xs text-muted-foreground">
                         No spam, ever. You're in control.
                       </p>
                     </div>
                   </div>
                 </div>
               )}
             </div>
 
             {/* Actions */}
             <div className="p-5 pt-2 space-y-2">
               {!showIOSInstallMessage && canRequestPermission && (
                 <Button 
                   className="w-full h-12 text-base font-semibold"
                   onClick={handleEnableNotifications}
                 >
                   <Bell className="w-5 h-5 mr-2" />
                   Enable Notifications
                 </Button>
               )}
               
               {showIOSInstallMessage && (
                 <Button 
                   className="w-full"
                   onClick={handleClose}
                 >
                   Got it
                 </Button>
               )}
               
               <Button
                 variant="ghost"
                 className="w-full text-muted-foreground"
                 onClick={handleMaybeLater}
               >
                 Maybe later
               </Button>
               
               <button
                 className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground py-1"
                 onClick={handleNeverAsk}
               >
                 Don't ask again
               </button>
             </div>
           </>
         )}
       </DialogContent>
     </Dialog>
   );
 }