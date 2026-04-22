import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Home, FileText } from "lucide-react";

export default function PrivacyPolicyHero() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Airplane Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/plane.jpg')`,
        }}
      ></div>

      {/* Additional Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      {/* Animated Background Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>

      {/* Flight Path Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse delay-500"></div>
      </div>

      {/* Airplane silhouettes */}
      <div className="absolute top-1/3 right-20 opacity-10">
        <svg
          width="60"
          height="60"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-cyan-400 animate-pulse"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>
      <div className="absolute bottom-1/3 left-16 opacity-10">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-blue-400 animate-pulse delay-700"
        >
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
        {/* Hero Content - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-4xl mx-auto">
            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tight leading-none">
              PRIVACY
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                POLICY
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white font-extrabold mb-12 max-w-3xl mx-auto leading-relaxed ">
              Your privacy is our priority. Learn how we collect, use, and
              protect your personal information when you use our aviation
              services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
