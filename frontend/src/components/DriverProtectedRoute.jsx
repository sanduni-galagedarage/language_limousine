import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Token Management for drivers
const TOKEN_KEY = "user_token";
const USER_KEY = "user_data";

const tokenManager = {
  getToken: () => {
    return sessionStorage.getItem(TOKEN_KEY);
  },
  getUser: () => {
    const user = sessionStorage.getItem(USER_KEY);
    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  },
};

export default function DriverProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = tokenManager.getToken();
      const user = tokenManager.getUser();

      if (!token || !user) {
        // No token or user, redirect to home
        navigate("/");
        return;
      }

      // Check if user is a driver or subdriver
      if (user.role !== "Driver" && user.role !== "Subdriver") {
        // User is not a driver, redirect to home
        navigate("/");
        return;
      }

      // User is authenticated and is a driver
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
