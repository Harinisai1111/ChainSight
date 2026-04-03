import { useAuth } from "@clerk/clerk-react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  // Wait for Clerk to finish loading session
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0b] text-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-t-2 border-green-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-green-500/20" />
          </div>
        </div>
        <p className="mt-8 text-[10px] font-bold tracking-[0.4em] uppercase text-gray-500 animate-pulse">Initializing Secure Session...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/cryptoflow/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
