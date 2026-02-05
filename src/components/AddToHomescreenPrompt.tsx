 import { useState, useEffect } from 'react';
 import { X, Share, MoreVertical, Smartphone, Zap, AppWindow } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from '@/components/ui/dialog';
 import { useIsMobile } from '@/hooks/use-mobile';
 import { useInstallPrompt } from '@/hooks/useInstallPrompt';
 
 const STORAGE_KEY = 'homescreen-prompt-dismissals';
 const MAX_DISMISSALS = 3;
 const HOURS_BETWEEN_PROMPTS = 24;
 
 interface DismissalData {
   count: number;
   lastDismissed: string;
 }
 
 function getDismissalData(): DismissalData | null {
   try {
     const stored = localStorage.getItem(STORAGE_KEY);
     return stored ? JSON.parse(stored) : null;
   } catch {
     return null;
   }
 }
 
 function setDismissalData(data: DismissalData) {
   localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
 }
 
 function shouldShowPrompt(): boolean {
   const data = getDismissalData();
   
   if (!data) return true;
   if (data.count >= MAX_DISMISSALS) return false;
   
   const lastDismissed = new Date(data.lastDismissed);
   const now = new Date();
   const hoursSince = (now.getTime() - lastDismissed.getTime()) / (1000 * 60 * 60);
   
   return hoursSince >= HOURS_BETWEEN_PROMPTS;
 }
 
 function detectPlatform(): 'ios' | 'android' | 'other' {
   const ua = navigator.userAgent.toLowerCase();
   
   if (/iphone|ipad|ipod/.test(ua)) return 'ios';
   if (/android/.test(ua)) return 'android';
   return 'other';
 }
 
 function isStandalone(): boolean {
   return window.matchMedia('(display-mode: standalone)').matches 
     || (window.navigator as any).standalone === true;
 }
 
 export function AddToHomescreenPrompt() {
   const [isOpen, setIsOpen] = useState(false);
   const isMobile = useIsMobile();
   const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
   const platform = detectPlatform();
 
   useEffect(() => {
     // Don't show if not mobile, already installed, or is standalone
     if (!isMobile || isInstalled || isStandalone()) return;
     
     // Check dismissal logic
     if (!shouldShowPrompt()) return;
     
     // Small delay to not interrupt initial load
     const timer = setTimeout(() => {
       setIsOpen(true);
     }, 2000);
     
     return () => clearTimeout(timer);
   }, [isMobile, isInstalled]);
 
   const handleDismiss = () => {
     const data = getDismissalData();
     setDismissalData({
       count: (data?.count || 0) + 1,
       lastDismissed: new Date().toISOString(),
     });
     setIsOpen(false);
   };
 
   const handleInstallClick = async () => {
     if (isInstallable) {
       await promptInstall();
       setIsOpen(false);
     }
   };
 
   // Don't render on desktop or if already installed
   if (!isMobile || isInstalled || isStandalone()) return null;
 
   return (
     <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
       <DialogContent className="max-w-[340px] rounded-2xl p-0 gap-0 border-border/50">
         {/* Header */}
         <DialogHeader className="p-5 pb-3 space-y-1">
           <DialogTitle className="text-xl font-semibold text-center">
             ✨ Save to your homescreen!
           </DialogTitle>
           <p className="text-sm text-muted-foreground text-center">
             Get quick access to your affirmations anytime
           </p>
         </DialogHeader>
 
         {/* Instructions */}
         <div className="px-5 pb-4">
           {/* Android with native install prompt */}
           {platform === 'android' && isInstallable ? (
             <div className="space-y-4">
               <p className="text-sm text-muted-foreground text-center">
                 Tap the button below to install the app instantly! 🚀
               </p>
               <Button 
                 className="w-full h-12 text-base font-semibold"
                 onClick={handleInstallClick}
               >
                 <Smartphone className="w-5 h-5 mr-2" />
                 Install App
               </Button>
             </div>
           ) : platform === 'ios' ? (
             /* iOS Instructions */
             <div className="space-y-3">
               <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                 <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <span className="text-sm font-semibold text-primary">1</span>
                 </div>
                 <div>
                   <p className="text-sm font-medium">Tap the Share button</p>
                   <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                     <Share className="w-3.5 h-3.5" /> at the bottom of Safari
                   </p>
                 </div>
               </div>
 
               <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                 <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <span className="text-sm font-semibold text-primary">2</span>
                 </div>
                 <div>
                   <p className="text-sm font-medium">Scroll & tap "Add to Home Screen"</p>
                   <p className="text-xs text-muted-foreground mt-0.5">
                     Look for the + icon in the menu
                   </p>
                 </div>
               </div>
 
               <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                 <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <span className="text-sm font-semibold text-primary">3</span>
                 </div>
                 <div>
                   <p className="text-sm font-medium">Name it & tap "Add"</p>
                   <p className="text-xs text-muted-foreground mt-0.5">
                     Done! Find us on your homescreen 🎉
                   </p>
                 </div>
               </div>
             </div>
           ) : (
             /* Android Manual Instructions */
             <div className="space-y-3">
               <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                 <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <span className="text-sm font-semibold text-primary">1</span>
                 </div>
                 <div>
                   <p className="text-sm font-medium">Tap the menu</p>
                   <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                     <MoreVertical className="w-3.5 h-3.5" /> three dots in the top-right
                   </p>
                 </div>
               </div>
 
               <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                 <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <span className="text-sm font-semibold text-primary">2</span>
                 </div>
                 <div>
                   <p className="text-sm font-medium">Tap "Add to Home screen"</p>
                   <p className="text-xs text-muted-foreground mt-0.5">
                     Or "Install app" if you see it
                   </p>
                 </div>
               </div>
 
               <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-xl">
                 <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                   <span className="text-sm font-semibold text-primary">3</span>
                 </div>
                 <div>
                   <p className="text-sm font-medium">Confirm by tapping "Add"</p>
                   <p className="text-xs text-muted-foreground mt-0.5">
                     All set! ✨
                   </p>
                 </div>
               </div>
             </div>
           )}
         </div>
 
         {/* Benefits */}
         <div className="px-5 py-4 bg-secondary/30 border-t border-border/50">
           <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
             Why add to homescreen?
           </p>
           <div className="grid grid-cols-3 gap-2">
             <div className="flex flex-col items-center text-center gap-1.5 p-2">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                 <Zap className="w-4 h-4 text-primary" />
               </div>
               <span className="text-xs text-muted-foreground leading-tight">
                 Launch instantly
               </span>
             </div>
             <div className="flex flex-col items-center text-center gap-1.5 p-2">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                 <AppWindow className="w-4 h-4 text-primary" />
               </div>
               <span className="text-xs text-muted-foreground leading-tight">
                 Works like an app
               </span>
             </div>
             <div className="flex flex-col items-center text-center gap-1.5 p-2">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                 <Smartphone className="w-4 h-4 text-primary" />
               </div>
               <span className="text-xs text-muted-foreground leading-tight">
                 Always ready
               </span>
             </div>
           </div>
         </div>
 
         {/* Dismiss button */}
         <div className="p-4 pt-3">
           <Button
             variant="ghost"
             className="w-full text-muted-foreground"
             onClick={handleDismiss}
           >
             Maybe later
           </Button>
         </div>
       </DialogContent>
     </Dialog>
   );
 }