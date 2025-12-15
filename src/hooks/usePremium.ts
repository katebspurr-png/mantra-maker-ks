import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user has premium status.
 * 
 * FUTURE: This hook should be extended to check the user's subscription status
 * from a subscriptions/memberships table or a Stripe integration.
 * 
 * For now, it returns false (free user) as a stub for premium gating.
 * When subscriptions are implemented, update the logic here to check
 * the user's actual subscription tier.
 */
export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsPremium(false);
          setIsLoading(false);
          return;
        }

        // FUTURE: Check subscription status from database or Stripe
        // Example:
        // const { data: subscription } = await supabase
        //   .from("subscriptions")
        //   .select("tier, status")
        //   .eq("user_id", user.id)
        //   .eq("status", "active")
        //   .single();
        // 
        // setIsPremium(subscription?.tier === "pro" || subscription?.tier === "premium");

        // STUB: For now, all users are free users
        setIsPremium(false);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking premium status:", error);
        setIsPremium(false);
        setIsLoading(false);
      }
    };

    checkPremiumStatus();
  }, []);

  return { isPremium, isLoading };
};

/**
 * Helper to check if a specific feature requires premium.
 * This makes it easy to add more premium features later.
 * 
 * FUTURE: When building playlists, you could use this to:
 * - Prefer Best Takes when auto-building playlists
 * - Filter recordings by Best Take status
 */
export const PREMIUM_FEATURES = {
  BEST_TAKE: "best_take",
  // Add more premium features here as needed
} as const;

export type PremiumFeature = typeof PREMIUM_FEATURES[keyof typeof PREMIUM_FEATURES];
