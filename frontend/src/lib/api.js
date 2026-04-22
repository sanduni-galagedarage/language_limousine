import axios from "axios";
import { API_BASE_URL } from "./config";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Check both localStorage (for admin) and sessionStorage (for other roles)
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("user_token") ||
      sessionStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("user_token");
      sessionStorage.removeItem("user_data");
      sessionStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// Assignment API functions
export const assignmentAPI = {
  // Get unassigned students
  getUnassignedStudents: (params = {}) => {
    return api.get("/assignments/unassigned-students", { params });
  },

  // Get all drivers and subdrivers
  getDriversAndSubdrivers: () => {
    return api.get("/assignments/drivers");
  },

  // Assign students to driver/subdriver
  assignStudents: (data) => {
    return api.post("/assignments", data);
  },

  // Get all assignments
  getAssignments: (params = {}) => {
    return api.get("/assignments", { params });
  },

  // Update assignment
  updateAssignment: (assignmentId, data) => {
    return api.put(`/assignments/${assignmentId}`, data);
  },

  // Cancel assignment
  cancelAssignment: (assignmentId) => {
    return api.delete(`/assignments/${assignmentId}`);
  },

  // Driver-specific functions
  // Get driver's assignments for today
  getDriverAssignments: (params = {}) => {
    return api.get("/driver/my-assignments", { params });
  },

  // Get driver's completed tasks
  getDriverCompletedTasks: (params = {}) => {
    return api.get("/driver/completed-tasks", { params });
  },

  // Update pickup status
  updatePickupStatus: (assignmentId, data) => {
    return api.put(`/driver/update-pickup/${assignmentId}`, data);
  },

  // Update delivery status
  updateDeliveryStatus: (assignmentId, data) => {
    return api.put(`/driver/update-delivery/${assignmentId}`, data);
  },

  // Update delivery time
  updateDeliveryTime: (assignmentId, data) => {
    return api.put(`/driver/update-delivery-time/${assignmentId}`, data);
  },

  // Driver profile functions
  getDriverProfile: () => {
    return api.get("/driver/profile");
  },

  updateDriverProfile: (data) => {
    return api.put("/driver/profile", data);
  },

  getDriverStats: (params = {}) => {
    return api.get("/driver/stats", { params });
  },

  // Subdriver-specific functions
  // Get subdriver's assignments for today
  getSubdriverAssignments: (params = {}) => {
    return api.get("/subdriver/my-assignments", { params });
  },

  // Get subdriver's completed tasks
  getSubdriverCompletedTasks: (params = {}) => {
    return api.get("/subdriver/completed-tasks", { params });
  },

  // Update pickup status
  updateSubdriverPickupStatus: (assignmentId, data) => {
    return api.put(`/subdriver/update-pickup/${assignmentId}`, data);
  },

  // Update delivery status
  updateSubdriverDeliveryStatus: (assignmentId, data) => {
    return api.put(`/subdriver/update-delivery/${assignmentId}`, data);
  },

  // Update delivery time
  updateSubdriverDeliveryTime: (assignmentId, data) => {
    return api.put(`/subdriver/update-delivery-time/${assignmentId}`, data);
  },

  // Subdriver profile functions
  getSubdriverProfile: () => {
    return api.get("/subdriver/profile");
  },

  updateSubdriverProfile: (data) => {
    return api.put("/subdriver/profile", data);
  },

  getSubdriverStats: (params = {}) => {
    return api.get("/subdriver/stats", { params });
  },
};

// School API functions
export const schoolAPI = {
  // Get students with status for a school
  getSchoolStudentsStatus: (params = {}) => {
    return api.get("/school/students-status", { params });
  },

  // Get status statistics for a school
  getSchoolStatusStats: (params = {}) => {
    return api.get("/school/status-stats", { params });
  },
};

// Waiting Time API functions
export const waitingTimeAPI = {
  // Get waiting times for a specific date
  getWaitingTimes: (params = {}) => {
    return api.get("/waiting-time", { params });
  },

  // Get waiting time statistics
  getWaitingTimeStats: (params = {}) => {
    return api.get("/waiting-time/stats", { params });
  },

  // Create or update waiting time
  updateWaitingTime: (data) => {
    return api.post("/waiting-time", data);
  },

  // Update specific waiting time by ID
  updateWaitingTimeById: (id, data) => {
    return api.put(`/waiting-time/${id}`, data);
  },

  // Delete waiting time
  deleteWaitingTime: (id) => {
    return api.delete(`/waiting-time/${id}`);
  },
};

// Absent Feedback API functions
export const absentFeedbackAPI = {
  // Get absent feedback for a specific date
  getAbsentFeedback: (params = {}) => {
    return api.get("/absent-feedback", { params });
  },

  // Get feedback statistics
  getFeedbackStats: (params = {}) => {
    return api.get("/absent-feedback/stats", { params });
  },

  // Create or update absent feedback
  submitAbsentFeedback: (data) => {
    return api.post("/absent-feedback", data);
  },

  // Update specific feedback by ID
  updateFeedbackById: (id, data) => {
    return api.put(`/absent-feedback/${id}`, data);
  },

  // Delete feedback
  deleteFeedback: (id) => {
    return api.delete(`/absent-feedback/${id}`);
  },
};

// Student API functions
export const studentAPI = {
  // Get all students
  getAllStudents: (params = {}) => {
    return api.get("/students", { params });
  },

  // Get students by school (for school users)
  getStudentsBySchool: (schoolUsername, params = {}) => {
    return api.get(`/school-students/${schoolUsername}`, { params });
  },

  // Get student by ID
  getStudentById: (studentId) => {
    return api.get(`/students/${studentId}`);
  },

  // Add new student
  addStudent: (data) => {
    return api.post("/students", data);
  },

  // Update student
  updateStudent: (studentId, data) => {
    return api.put(`/students/${studentId}`, data);
  },

  // Delete student
  deleteStudent: (studentId) => {
    return api.delete(`/students/${studentId}`);
  },

  // Export students PDF
  exportStudentsPdf: (date) => {
    return api.get(`/students/export/pdf?date=${date}`, {
      responseType: "blob",
    });
  },
};

// User API functions
export const userAPI = {
  // Get users by role
  getUsersByRole: (role, params = {}) => {
    return api.get(`/users/role/${role}`, { params });
  },

  // Get all schools for dropdown
  getAllSchools: () => {
    return api.get("/users/schools/dropdown");
  },

  // Get all users
  getAllUsers: (params = {}) => {
    return api.get("/users", { params });
  },

  // Get user by ID
  getUserById: (userId) => {
    return api.get(`/users/${userId}`);
  },

  // Add new user
  addUser: (data) => {
    return api.post("/users", data);
  },

  // Update user
  updateUser: (userId, data) => {
    return api.put(`/users/${userId}`, data);
  },

  // Delete user
  deleteUser: (userId) => {
    return api.delete(`/users/${userId}`);
  },

  // Admin management functions
  getAllAdmins: () => {
    return api.get("/users/admins");
  },
  addAdmin: (data) => {
    return api.post("/users/admins", data);
  },
  // Public admin registration
  registerAdmin: (data) => {
    return api.post("/users/register-admin", data);
  },
  // Get user statistics
  getUserStats: () => {
    return api.get("/users/stats");
  },
};

// Auth API functions
export const authAPI = {
  // Login
  login: (credentials) => {
    return api.post("/auth/login", credentials);
  },

  // Register
  register: (userData) => {
    return api.post("/auth/register", userData);
  },

  // Verify token
  verifyToken: () => {
    return api.get("/auth/verify");
  },

  // Logout
  logout: () => {
    return api.post("/auth/logout");
  },
};

export default api;
