import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Clock,
  UserPlus,
  Printer,
  MapPin,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  Eye,
  Upload,
  RotateCcw,
  Download,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeItem, setActiveItem] = useState();
  const [expandedSections, setExpandedSections] = useState({
    users: false,
    students: false,
  });
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Set active item based on current path
  useEffect(() => {
    const currentPath = location.pathname;

    // Check main menu items
    const mainItem = menuItems.find((item) => item.path === currentPath);
    if (mainItem) {
      setActiveItem(mainItem.id);
      return;
    }

    // Check submenu items
    for (const item of menuItems) {
      if (item.children) {
        const childItem = item.children.find(
          (child) => child.path === currentPath
        );
        if (childItem) {
          setActiveItem(childItem.id);
          setExpandedSections((prev) => ({
            ...prev,
            [item.id]: true,
          }));
          return;
        }
      }
    }

    // Check bottom menu items
    const bottomItem = bottomMenuItems.find(
      (item) => item.path === currentPath
    );
    if (bottomItem) {
      setActiveItem(bottomItem.id);
    }
  }, [location.pathname]);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
      if (!isCollapsed) {
        setExpandedSections({
          users: false,
          students: false,
        });
      }
    }
  };

  const toggleSection = (section) => {
    if (!isCollapsed || isMobile) {
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    }
  };

  // Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("user_token");
    sessionStorage.removeItem("user_data");

    if (isMobile) {
      setIsMobileOpen(false);
    }

    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 2000,
    });

    navigate("/");
  };

  const handleNavigation = (itemId, path) => {
    setActiveItem(itemId);

    if (itemId === "logout") {
      handleLogout();
      return;
    }

    try {
      navigate(path);
      console.log(`Successfully navigated to: ${path}`);
      if (isMobile) {
        setIsMobileOpen(false);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      console.log(`Failed to navigate to: ${path}`);
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      path: "/admin/admin-dashboard",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users className="w-4 h-4" />,
      path: "/admin/admin-users",
      expandable: true,
      expanded: expandedSections.users,
      children: [
        {
          label: "Greeters",
          icon: <ChevronRight className="w-3 h-3" />,
          path: "/admin/admin-users/greeters",
          id: "greeters",
        },
        {
          label: "Drivers",
          icon: <ChevronRight className="w-3 h-3" />,
          path: "/admin/admin-users/drivers",
          id: "drivers",
        },
        {
          label: "School",
          icon: <ChevronRight className="w-3 h-3" />,
          path: "/admin/admin-users/school",
          id: "school",
        },
        {
          label: "Sub Drivers",
          icon: <ChevronRight className="w-3 h-3" />,
          path: "/admin/admin-users/subdrivers",
          id: "sub-drivers",
        },
        {
          label: "Admins",
          icon: <ChevronRight className="w-3 h-3" />,
          path: "/admin/admin-users/admins",
          id: "admins",
        },
      ],
    },
    {
      id: "students",
      label: "Students",
      icon: <GraduationCap className="w-4 h-4" />,
      path: "/students",
      expandable: true,
      expanded: expandedSections.students,
      children: [
        {
          label: "Add",
          icon: <Plus className="w-3 h-3" />,
          path: "/admin/admin-students/add",
          id: "students-add",
        },
        {
          label: "View",
          icon: <Eye className="w-3 h-3" />,
          path: "/admin/admin-students/view",
          id: "students-view",
        },
        {
          label: "Upload",
          icon: <Upload className="w-3 h-3" />,
          path: "/admin/admin-students/upload",
          id: "students-upload",
        },
        {
          label: "Update",
          icon: <RotateCcw className="w-3 h-3" />,
          path: "/admin/admin-students/update",
          id: "students-update",
        },
        {
          label: "Download",
          icon: <Download className="w-3 h-3" />,
          path: "/admin/admin-students/download",
          id: "students-download",
        },
      ],
    },
    {
      id: "waiting-time",
      label: "Update Waiting Time",
      icon: <Clock className="w-4 h-4" />,
      path: "/admin/admin-waitingtime",
    },
    {
      id: "assign-drivers",
      label: "Assign Drivers",
      icon: <UserPlus className="w-4 h-4" />,
      path: "/admin/assigndrivers",
    },
    {
      id: "print",
      label: "Print",
      icon: <Printer className="w-4 h-4" />,
      path: "/admin/printmap",
    },
    {
      id: "map",
      label: "Map",
      icon: <MapPin className="w-4 h-4" />,
      path: "/admin/map",
    },
  ];

  const bottomMenuItems = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="w-4 h-4" />,
      path: "/admin/profile",
    },
    {
      id: "logout",
      label: "Logout",
      icon: <LogOut className="w-4 h-4" />,
      path: "/logout",
    },
  ];

  const SidebarButton = ({ item, children, onClick, className = "" }) => {
    const shouldShowTooltip = !isMobile && isCollapsed;
    const isActive = activeItem === item.id;

    return (
      <div className="group relative">
        <Button
          variant={isActive ? "default" : "ghost"}
          className={cn(
            "w-full justify-start h-auto p-3 font-medium transition-all duration-200",
            !isMobile && isCollapsed ? "px-3" : "px-4",
            isActive && "bg-primary text-primary-foreground shadow-md",
            item.id === "logout" && !isActive && "text-destructive hover:text-destructive hover:bg-destructive/10",
            className
          )}
          onClick={onClick}
        >
          <div
            className={cn(
              "flex items-center",
              !isMobile && isCollapsed ? "justify-center" : "space-x-3 w-full"
            )}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            {(!isCollapsed || isMobile) && (
              <span className="flex-1 text-left">{item.label}</span>
            )}
            {(!isCollapsed || isMobile) && children}
          </div>
        </Button>

        {/* Tooltip for collapsed state on desktop */}
        {shouldShowTooltip && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border">
            {item.label}
            <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-popover border-l border-t rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          onClick={toggleSidebar}
          variant="outline"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50 shadow-lg"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Card
        className={cn(
          "h-screen flex flex-col transition-all duration-300 ease-in-out z-40 rounded-none border-r shadow-lg",
          isMobile
            ? `fixed left-0 top-0 w-64 transform ${
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `fixed left-0 top-0 ${isCollapsed ? "w-16" : "w-64"}`
        )}
      >
        <CardContent className="p-0 flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "flex items-center space-x-3",
                  !isMobile && isCollapsed && "justify-center"
                )}
              >
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-xl">A</span>
                </div>
                {(!isCollapsed || isMobile) && (
                  <div className="transition-opacity duration-200">
                    <h1 className="font-bold text-lg leading-tight">Language</h1>
                    <h2 className="font-bold text-lg leading-tight">Limousine</h2>
                  </div>
                )}
              </div>
              {!isMobile && (
                <Button
                  onClick={toggleSidebar}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isCollapsed ? "rotate-0" : "rotate-180"
                    )}
                  />
                </Button>
              )}
            </div>
          </div>

          {/* Main Navigation - Scrollable */}
          <div className="flex-1 py-6 overflow-y-auto">
            <nav className="space-y-2 px-4">
              {menuItems.map((item) => (
                <div key={item.id} className="space-y-1">
                  <SidebarButton
                    item={item}
                    onClick={() => {
                      if (item.expandable) {
                        toggleSection(item.id);
                      } else {
                        handleNavigation(item.id, item.path);
                      }
                    }}
                  >
                    {item.expandable && (!isCollapsed || isMobile) && (
                      <div className="transition-transform duration-200 ease-in-out ml-auto">
                        {item.expanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    )}
                  </SidebarButton>

                  {/* Submenu */}
                  {item.expandable && (!isCollapsed || isMobile) && (
                    <div
                      className={cn(
                        "ml-8 overflow-hidden transition-all duration-300 ease-in-out",
                        item.expanded
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      )}
                    >
                      <div className="space-y-1 pt-2 border-l-2 border-border pl-4">
                        {item.children.map((child, index) => {
                          const isChildActive = activeItem === child.id;
                          return (
                            <Button
                              key={child.id}
                              variant={isChildActive ? "default" : "ghost"}
                              className={cn(
                                "w-full justify-start h-auto p-2.5 text-sm font-medium transition-all duration-200",
                                isChildActive && "shadow-md"
                              )}
                              style={{
                                transitionDelay: item.expanded
                                  ? `${index * 50}ms`
                                  : "0ms",
                              }}
                              onClick={() =>
                                handleNavigation(child.id, child.path)
                              }
                            >
                              <div className="flex items-center space-x-3">
                                {child.icon}
                                <span>{child.label}</span>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Separator */}
          <div className="border-t mx-4" />

          {/* Bottom Navigation */}
          <div className="p-4 space-y-2">
            {bottomMenuItems.map((item) => (
              <SidebarButton
                key={item.id}
                item={item}
                onClick={() => handleNavigation(item.id, item.path)}
              />
            ))}
          </div>

          {/* Footer */}
          {(!isCollapsed || isMobile) && (
            <>
              <div className="border-t mx-4" />
              <div className="p-4 transition-opacity duration-200">
                <p className="text-xs text-muted-foreground text-center font-medium">
                  Copyright © 2024. All rights reserved.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}