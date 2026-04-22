import React, { useState, useEffect, useRef } from "react";
import { Package, MapPin, User, ThumbsUp, ArrowUp } from "lucide-react";

const AnimatedCounter = ({
  end,
  duration = 2000,
  suffix = "",
  decimals = 0,
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const counterRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);

      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, end, duration]);

  const formatNumber = (num) => {
    if (decimals > 0) {
      return num.toFixed(decimals);
    }
    return num.toLocaleString();
  };

  return (
    <span ref={counterRef} className="tabular-nums">
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

const AnimatedStatsSection = () => {
  const stats = [
    {
      icon: Package,
      number: 3560,
      label: "Students Transported",
      color: "text-purple-600",
    },
    {
      icon: MapPin,
      number: 195,
      label: "Countries Covered",
      color: "text-purple-600",
    },
    {
      icon: User,
      number: 455,
      suffix: " k",
      label: "Happy Customer",
      color: "text-purple-600",
    },
    {
      icon: ThumbsUp,
      number: 99,
      suffix: " Yr",
      label: "Year Experience",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="relative bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center">
                    <IconComponent
                      className={`w-12 h-12 ${stat.color} stroke-2`}
                    />
                  </div>
                </div>

                {/* Animated Number */}
                <div className="mb-4">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-orange-500 block">
                    <AnimatedCounter
                      end={stat.number}
                      suffix={stat.suffix || ""}
                      duration={2500}
                    />
                  </span>
                </div>

                {/* Label */}
                <p className="text-gray-700 font-medium text-base sm:text-lg">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnimatedStatsSection;
