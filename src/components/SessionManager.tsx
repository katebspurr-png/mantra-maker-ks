import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const REMEMBER_ME_KEY = "loop-remember-me";

/**
 * Manages session persistence based on "Remember Me" preference.
 * If user unchecked "Remember Me", signs out when browser/tab closes.
 */
export const SessionManager = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
      
      // If remember me is explicitly set to false, sign out
      if (rememberMe === "false") {
        // Use synchronous signOut approach for beforeunload
        supabase.auth.signOut();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
};
