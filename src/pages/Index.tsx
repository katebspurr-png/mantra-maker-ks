import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasCompletedOnboarding } from "./Onboarding";
import Landing from "./Landing";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not authenticated — show landing page with demo CTA
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Authenticated but hasn't completed onboarding
  if (!hasCompletedOnboarding()) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/home" replace />;
};

export default Index;
