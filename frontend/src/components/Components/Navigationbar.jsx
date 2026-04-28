import React, { useState, useEffect } from "react";
import { Home, Info, Shield, LogIn, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import RoleLogin from "./RoleLogin";

const NavigationBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");

  const navigationItems = [
    { name: "Home", href: "/", icon: Home, color: "text-blue-500" },
    { name: "About Us", href: "/aboutus", icon: Info, color: "text-green-500" },
    { name: "Privacy", href: "/privacy", icon: Shield, color: "text-purple-500" },
    { name: "Contact", href: "/contact", icon: Mail, color: "text-orange-500" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get current path to set active tab
  useEffect(() => {
    const path = window.location.pathname;
    const active = navigationItems.find(item => item.href === path);
    if (active) setActiveTab(active.name);
  }, []);

  return (
    <>
      {/* Desktop & Mobile Top Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-900 font-black text-lg leading-tight tracking-tight">
                  LANGUAGE
                </span>
                <span className="text-orange-500 font-black text-lg leading-tight tracking-tight">
                  LIMOUSINE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 relative ${
                    activeTab === item.name
                      ? "text-orange-500"
                      : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                  }`}
                >
                  {item.name}
                  {/* Underline for active link */}
                  {activeTab === item.name && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full"></span>
                  )}
                </a>
              ))}
              
              {/* Login Button */}
              <div className="ml-4">
                <RoleLogin />
              </div>
            </div>

            {/* Mobile - Empty space (navigation is at bottom) */}
            <div className="md:hidden w-12"></div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl pb-safe">
        <div className="grid grid-cols-5 h-20">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <a
                key={index}
                href={item.href}
                onClick={() => setActiveTab(item.name)}
                className="flex flex-col items-center justify-center space-y-1 transition-all duration-300 active:scale-95 group relative"
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400 rounded-b-full"></div>
                )}
                
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                  isActive ? "bg-orange-50" : "group-hover:bg-gray-50"
                }`}>
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-300 ${
                      isActive ? item.color : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
                <span className={`text-xs font-semibold transition-colors duration-300 ${
                  isActive ? "text-orange-500" : "text-gray-500 group-hover:text-gray-700"
                }`}>
                  {item.name}
                </span>
              </a>
            );
          })}
          
          {/* Login Icon - Opens RoleLogin Dialog */}
          <div className="flex flex-col items-center justify-center">
            <RoleLogin 
              trigger={
                <div className="flex flex-col items-center justify-center space-y-1 transition-all duration-300 active:scale-95 group cursor-pointer">
                  <div className="w-12 h-12 flex items-center justify-center rounded-2xl group-hover:bg-orange-50 transition-all duration-300">
                    <LogIn 
                      className="w-6 h-6 text-orange-500 transition-colors duration-300 group-hover:text-orange-600"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-xs font-semibold text-orange-500 group-hover:text-orange-600 transition-colors duration-300">
                    Login
                  </span>
                </div>
              }
            />
          </div>
        </div>
      </nav>

      {/* Add padding to body for bottom nav */}
      <style>
        {`
          @media (max-width: 768px) {
            body {
              padding-bottom: 80px;
            }
          }
        `}
      </style>
    </>
  );
};

export default NavigationBar;
