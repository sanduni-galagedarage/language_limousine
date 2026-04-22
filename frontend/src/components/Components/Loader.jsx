import React from "react";

const ColorfulTextLoader = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-zinc-900 flex items-center justify-center z-50 p-4">
      <div className="text-center w-full max-w-4xl">
        {/* Animated logo text */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold tracking-wide text-gray-900 dark:text-white leading-tight">
            {"Language".split("").map((letter, index) => (
              <span
                key={`language-${index}`}
                className="inline-block animate-pulse"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animationDuration: "1.5s",
                }}
              >
                {letter}
              </span>
            ))}
            <span className="inline-block mx-2 sm:mx-3 md:mx-4 text-gray-400 text-2xl sm:text-3xl md:text-4xl lg:text-6xl">
              •
            </span>
            {"Limousine".split("").map((letter, index) => (
              <span
                key={`limousine-${index}`}
                className="inline-block animate-pulse"
                style={{
                  animationDelay: `${(index + 8) * 0.1}s`,
                  animationDuration: "1.5s",
                }}
              >
                {letter}
              </span>
            ))}
          </h1>
        </div>

        {/* Loading message */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl animate-pulse px-2">
            {message}
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2 sm:space-x-3">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-700 dark:bg-gray-300 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-700 dark:bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-700 dark:bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          ></div>
          <div
            className="w-2 h-2 sm:w-3 sm:h-3 bg-gray-700 dark:bg-gray-300 rounded-full animate-bounce"
            style={{ animationDelay: "0.6s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ColorfulTextLoader;
