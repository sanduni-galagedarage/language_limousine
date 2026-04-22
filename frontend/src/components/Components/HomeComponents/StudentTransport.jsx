import React from "react";
import {
  Truck,
  HandHeart,
  Building,
  Clock,
  Package,
  ArrowUp,
} from "lucide-react";
import takeOff from "../../../../public/images/takeoff.jpg";

const StudentTransportService = () => {
  return (
    <div className="relative bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
          STUDENT TRANSPORT SERVICE
        </h2>
        <div className="w-16 h-1 bg-orange-500 mx-auto mb-8"></div>
        <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
          Language Limousine provides reliable and efficient transportation
          solutions for students arriving from both domestic and international
          locations. Our service includes safe transfers from the airport to
          student hostels, ensuring a seamless and stress-free start to their
          journey.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Column - Features */}
          <div className="space-y-12">
            {/* Airport Transfers */}
            <div className="text-center lg:text-right">
              <div className="flex justify-center lg:justify-end mb-4">
                <div className="w-16 h-16 border-2 border-orange-400 border-dashed rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                AIRPORT TRANSFERS
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Safe and timely airport pick-ups and drop-offs for all students.
              </p>
            </div>

            {/* International Student Assistance */}
            <div className="text-center lg:text-right">
              <div className="flex justify-center lg:justify-end mb-4">
                <div className="w-16 h-16 border-2 border-orange-400 border-dashed rounded-full flex items-center justify-center">
                  <HandHeart className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                INTERNATIONAL STUDENT
                <br />
                ASSISTANCE
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Personalized service to assist students with their travel needs.
              </p>
            </div>

            {/* Comfortable and Secure Rides */}
            <div className="text-center lg:text-right">
              <div className="flex justify-center lg:justify-end mb-4">
                <div className="w-16 h-16 border-2 border-orange-400 border-dashed rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                COMFORTABLE AND
                <br />
                SECURE RIDES
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Well-maintained vehicles ensuring comfort and security.
              </p>
            </div>
          </div>

          {/* Center Column - Image */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
              <img
                src={takeOff}
                alt="Student Transport Service"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-12">
            {/* Door-to-Door Service */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="w-16 h-16 border-2 border-orange-400 border-dashed rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                DOOR-TO-DOOR SERVICE
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Convenient drop-off at the student's exact hostel location.
              </p>
            </div>

            {/* 24/7 Availability */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="w-16 h-16 border-2 border-orange-400 border-dashed rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                24/7 AVAILABILITY
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Flexible service times to accommodate all flight schedules.
              </p>
            </div>

            {/* Student Tracker */}
            <div className="text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="w-16 h-16 border-2 border-orange-400 border-dashed rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                STUDENT TRACKER
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                You can see if a student has been greeted, is in a car, or has
                been delivered.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTransportService;
