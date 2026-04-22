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

export default function RoleLoginDialog() {
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
          <Button
            size="lg"
            className="bg-black hover:bg-gray-800 text-white font-medium px-8 py-3"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white border-gray-300">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-black">
              Role-based Login
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Select your role and enter your credentials
            </DialogDescription>
            {/* <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">
                New admin?{" "}
                <a
                  href="/admin/register"
                  className="text-black hover:text-gray-700 underline transition-colors"
                >
                  Register here
                </a>
              </p>
            </div> */}
          </DialogHeader>
          <div className="space-y-4">
            {success && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Login successful! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="border-red-500 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-black">
                Select Role
              </Label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleRoleChange}
                disabled={isLoading || success}
                className="w-full bg-white border border-gray-300 text-black rounded-md px-3 py-2 focus:border-black focus:outline-none"
              >
                <option value="" disabled>
                  Choose your role
                </option>
                {Object.entries(ROLES).map(([key, role]) => (
                  <option
                    key={key}
                    value={key}
                    className="bg-white text-black"
                  >
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-black">
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
                className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-black"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">
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
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-black pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading || success}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black transition-colors"
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
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
