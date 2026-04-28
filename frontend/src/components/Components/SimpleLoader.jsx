import React from "react";

const SimpleLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen pt-16">
      <div className="relative">
        {/* Spinning circle */}
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default SimpleLoader;
