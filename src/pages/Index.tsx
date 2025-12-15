import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hasCompletedOnboarding } from "./Onboarding";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
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

  // If not authenticated, go to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated but hasn't completed onboarding, show onboarding
  if (!hasCompletedOnboarding()) {
    return <Navigate to="/onboarding" replace />;
  }

  // Otherwise go to home
  return <Navigate to="/home" replace />;
};

export default Index;