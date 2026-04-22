import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Shield } from "lucide-react";

export default function LanguageLimousinePrivacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23E2E8F0%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-2xl"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-2xl"></div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 min-h-screen flex items-center justify-center">
        <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl shadow-slate-200/20">
          <CardContent className="p-12">
            {/* Header Section */}
            <div className="text-center mb-12">
              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-6 tracking-tight leading-tight">
                PRIVACY POLICY FOR{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  LANGUAGE LIMOUSINE
                </span>
              </h1>

              {/* Decorative Line */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              {/* Effective Date Badge */}
              <div className="flex justify-center mb-8">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Calendar className="w-5 h-5 mr-2" />
                  Effective Date: 01/01/2025
                </Badge>
              </div>

              {/* Description */}
              <div className="max-w-3xl mx-auto">
                <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                  Language Limousine is committed to safeguarding your privacy
                  and ensuring the protection of your personal information. This
                  Privacy Policy outlines how we collect, use, store, and
                  protect the information you provide when using our services.
                </p>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">
                  Data Protection
                </h3>
                <p className="text-sm text-slate-600">
                  Your information is secured with industry-standard encryption
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800 mb-2">
                  Regular Updates
                </h3>
                <p className="text-sm text-slate-600">
                  This policy is reviewed and updated regularly
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200/50">
                <svg
                  className="w-8 h-8 text-pink-600 mx-auto mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <h3 className="font-semibold text-slate-800 mb-2">
                  Compliance
                </h3>
                <p className="text-sm text-slate-600">
                  Fully compliant with privacy regulations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
