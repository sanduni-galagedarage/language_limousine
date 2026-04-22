import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Custom Select component using HTML select
const Select = ({ value, onValueChange, disabled, children, placeholder }) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 focus:border-purple-500 focus:outline-none"
    >
      <option value="" disabled className="bg-slate-800">
        {placeholder}
      </option>
      {children}
    </select>
  );
};

const SelectOption = ({ value, children }) => {
  return (
    <option value={value} className="bg-slate-800 text-white">
      {children}
    </option>
  );
};
import {
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  LogIn,
  Shield,
  UserCog,
  Car,
  Users,
  GraduationCap,
} from "lucide-react";

// Using fetch instead of axios for API calls
const api = {
  post: async (url, data) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return {
      data: await response.json(),
      status: response.status,
    };
  },

  get: async (url, token) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return {
      data: await response.json(),
      status: response.status,
    };
  },
};

// Token Management Utilities
const TOKEN_KEY = "user_token";
const USER_KEY = "user_data";

const tokenManager = {
  setToken: (token) => {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  removeToken: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  setUser: (user) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
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

// Role configuration
const ROLES = {
  Admin: {
    label: "Admin",
    icon: Shield,
    color: "from-red-500 to-pink-500",
    dashboard: "/admin/admin-dashboard",
  },
  Greeter: {
    label: "Greeter",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    dashboard: "/greeter/greeter-dashboard",
  },
  Driver: {
    label: "Driver",
    icon: Car,
    color: "from-green-500 to-emerald-500",
    dashboard: "/driver/dashboard",
  },
  Subdriver: {
    label: "Sub Driver",
    icon: UserCog,
    color: "from-orange-500 to-yellow-500",
    dashboard: "/subdriver/dashboard",
  },
  School: {
    label: "School",
    icon: GraduationCap,
    color: "from-purple-500 to-indigo-500",
    dashboard: "/school/dashboard",
  },
};

const setupApiInterceptors = () => {
  console.log("API setup complete - using fetch with manual token handling");
};

export default function MultiRoleLoginDialog() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    setupApiInterceptors();

    const token = tokenManager.getToken();
    const user = tokenManager.getUser();

    if (token && user) {
      setUserSession({ token, user });
      setIsLoggedIn(true);
      verifyToken();
    }
  }, []);

  // Verify token validity
  const verifyToken = async () => {
    try {
      const token = tokenManager.getToken();
      if (!token) return;

      const response = await api.get(`/auth/verify`, token);

      if (response.data.success) {
        setIsLoggedIn(true);
        setUserSession({
          token,
          user: response.data.user,
        });
        tokenManager.setUser(response.data.user);
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      tokenManager.removeToken();
      setIsLoggedIn(false);
      setUserSession(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all fields");
      }

      const response = await api.post(`/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store token and user data
        tokenManager.setToken(token);
        tokenManager.setUser(user);

        setUserSession({ token, user });
        setIsLoggedIn(true);
        setSuccess(true);

        setTimeout(() => {
          setIsDialogOpen(false);
          resetForm();

          // Redirect based on user role
          const roleConfig = ROLES[user.role];
          if (roleConfig) {
            window.location.href = roleConfig.dashboard;
          } else {
            window.location.href = "/dashboard";
          }

          console.log("Login successful! User:", user);
        }, 2000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    tokenManager.removeToken();
    setUserSession(null);
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForm = () => {
    setFormData({ email: "", password: "" });
    setError("");
    setSuccess(false);
    setIsLoading(false);
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const getUserRoleConfig = () => {
    if (userSession?.user?.role) {
      return ROLES[userSession.user.role] || ROLES.Admin;
    }
    return ROLES.Admin;
  };

  if (isLoggedIn && userSession) {
    const roleConfig = getUserRoleConfig();
    const RoleIcon = roleConfig.icon;

    return (
      <div className="text-center space-y-6">
        <div
          className={`bg-gradient-to-r ${roleConfig.color}/20 border border-white/20 rounded-lg p-4`}
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <RoleIcon className="w-5 h-5 text-white" />
            <span className="text-white font-medium">
              Logged in as {roleConfig.label}
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Welcome, {userSession.user.username}!
          </p>
          <div className="flex space-x-2 justify-center">
            <Button
              onClick={() => (window.location.href = roleConfig.dashboard)}
              className={`bg-gradient-to-r ${roleConfig.color} hover:opacity-90 text-white`}
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Admin Login
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md bg-slate-900/95 backdrop-blur-md border-white/20">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Admin Login
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter your admin credentials
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {success && (
              <Alert className="border-green-500 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  Login successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-500">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading || success}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading || success}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading || success}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <DialogFooter className="flex flex-col space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || success}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging in...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Success!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Login</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-xs font-medium mb-2">
              Admin Demo Credentials:
            </p>
            <div className="space-y-1">
              <p className="text-yellow-300 text-xs">
                Email: admin@example.com
              </p>
              <p className="text-yellow-300 text-xs">Password: admin123</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
