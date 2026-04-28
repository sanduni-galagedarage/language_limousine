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
import {
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  CheckCircle,
  LogIn,
  Car,
  Users,
  GraduationCap,
  UserCog,
  Shield,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const ROLES = {
  Admin: {
    label: "Admin",
    icon: Shield,
    color: "from-red-500 to-pink-500",
    dashboard: "/admin/admin-dashboard",
    endpoint: "admin",
  },
  Greeter: {
    label: "Greeter",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    dashboard: "/greeter/greeter-dashboard",
    endpoint: "user",
  },
  Driver: {
    label: "Driver",
    icon: Car,
    color: "from-green-500 to-emerald-500",
    dashboard: "/driver/driver-dashboard",
    endpoint: "user",
  },
  Subdriver: {
    label: "Sub Driver",
    icon: UserCog,
    color: "from-orange-500 to-yellow-500",
    dashboard: "/subdriver/subdriver-dashboard",
    endpoint: "user",
  },
  School: {
    label: "School",
    icon: GraduationCap,
    color: "from-purple-500 to-indigo-500",
    dashboard: "/school/school-studentsdetails",
    endpoint: "user",
  },
};

const TOKEN_KEY = "user_token";
const USER_KEY = "user_data";
const ADMIN_TOKEN_KEY = "admin_token";
const ADMIN_USER_KEY = "admin_user";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const tokenManager = {
  setToken: (token, isAdmin = false) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    if (isAdmin) sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  getToken: () => sessionStorage.getItem(TOKEN_KEY),
  removeToken: (isAdmin = false) => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    if (isAdmin) {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      sessionStorage.removeItem(ADMIN_USER_KEY);
    }
  },
  setUser: (user, isAdmin = false) => {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    if (isAdmin) sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
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

export default function RoleLoginDialog({ trigger }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = tokenManager.getToken();
    const user = tokenManager.getUser();
    if (token && user) {
      setUserSession({ token, user });
      setIsLoggedIn(true);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRoleChange = (e) => {
    setFormData((prev) => ({ ...prev, role: e.target.value }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (!formData.email || !formData.password || !formData.role) {
        throw new Error("Please fill in all fields including role");
      }
      const roleConfig = ROLES[formData.role];
      if (!roleConfig) throw new Error("Invalid role selected");
      let endpoint = "";
      if (formData.role === "Admin") {
        endpoint = "/auth/login";
      } else {
        endpoint = "/auth/user/login";
      }
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        email: formData.email,
        password: formData.password,
      });
      if (response.data.success) {
        const { token, user } = response.data.data;
        const isAdmin = user.role === "Admin";
        // Store token and user data
        tokenManager.setToken(token, isAdmin);
        tokenManager.setUser(user, isAdmin);
        setUserSession({ token, user });
        setIsLoggedIn(true);
        setSuccess(true);
        toast.success(`Welcome back, ${user.username}!`, {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          setIsDialogOpen(false);
          resetForm();
          // Redirect based on user role
          const roleCfg = ROLES[user.role];
          if (roleCfg) {
            window.location.href = roleCfg.dashboard;
          } else {
            window.location.href = "/dashboard";
          }
        }, 2000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const isAdmin = userSession?.user?.role === "Admin";
    tokenManager.removeToken(isAdmin);
    setUserSession(null);
    setIsLoggedIn(false);
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    });
    window.location.href = "/";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", role: "" });
    setError("");
    setSuccess(false);
    setIsLoading(false);
  };

  return (
    <div className="text-center space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-50 to-white border-0 shadow-2xl rounded-3xl">
          <DialogHeader className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <User className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black text-gray-900">
              Welcome Back
            </DialogTitle>
            <DialogDescription className="text-gray-500 text-base">
              Sign in to access your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 mt-6">
            {success && (
              <Alert className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-700 font-medium">
                  Login successful! Redirecting...
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="border-0 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-700 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700 font-semibold text-sm">
                Select Your Role
              </Label>
              <div className="relative">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  disabled={isLoading || success}
                  className="w-full bg-white border-2 border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-200 appearance-none cursor-pointer font-medium"
                >
                  <option value="" disabled>
                    Choose your role
                  </option>
                  {Object.entries(ROLES).map(([key, role]) => (
                    <option
                      key={key}
                      value={key}
                      className="bg-white text-gray-900"
                    >
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading || success}
                className="bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-3 transition-all duration-200 font-medium"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading || success}
                  className="bg-white border-2 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 rounded-xl px-4 py-3 pr-12 transition-all duration-200 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading || success}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <DialogFooter className="flex flex-col space-y-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isLoading || success}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Success!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-5 h-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
