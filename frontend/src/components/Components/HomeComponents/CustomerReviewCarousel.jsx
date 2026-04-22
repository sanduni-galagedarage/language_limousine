import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, ArrowUp, MapPin } from "lucide-react";

const CustomerReviewsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const reviews = [
    {
      id: 1,
      title: "Safe, Comfortable, and Convenient",
      rating: 5,
      review:
        "Language Limousine truly understands the needs of students. The vehicle was clean, comfortable, and the driver was extremely courteous. This service made my travel so much less stressful. If you're looking for reliable student transportation, look no further!",
      customer: "Daniel M",
      role: "Graduate Student",
      avatar: `data:image/svg+xml;base64,${btoa(`
        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#4A90E2"/>
          <circle cx="40" cy="32" r="12" fill="white"/>
          <ellipse cx="40" cy="65" rx="18" ry="15" fill="white"/>
        </svg>
      `)}`,
    },
    {
      id: 2,
      title: "Excellent Service and Punctuality",
      rating: 5,
      review:
        "I was impressed by the punctuality and professionalism of Language Limousine. The driver arrived exactly on time and helped with my luggage. The vehicle was spotless and very comfortable. Highly recommend for international students!",
      customer: "Sarah K",
      role: "International Student",
      avatar: `data:image/svg+xml;base64,${btoa(`
        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#E74C3C"/>
          <circle cx="40" cy="32" r="12" fill="white"/>
          <ellipse cx="40" cy="65" rx="18" ry="15" fill="white"/>
        </svg>
      `)}`,
    },
    {
      id: 3,
      title: "Outstanding Airport Transfer Experience",
      rating: 5,
      review:
        "From booking to drop-off, everything was seamless. The driver was waiting for me at the airport with a sign, and the journey to my hostel was smooth and comfortable. Great value for money and excellent customer service throughout.",
      customer: "Mike T",
      role: "Undergraduate Student",
      avatar: `data:image/svg+xml;base64,${btoa(`
        <svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#27AE60"/>
          <circle cx="40" cy="32" r="12" fill="white"/>
          <ellipse cx="40" cy="65" rx="18" ry="15" fill="white"/>
        </svg>
      `)}`,
    },
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % reviews.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + reviews.length) % reviews.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "text-orange-500 fill-orange-500" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="relative bg-slate-800 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 border border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-white rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-orange-500 text-lg font-medium italic mb-4">
            Happy Customer Quotes
          </p>
          <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">
            Our Top Reviews
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full flex-shrink-0 px-4">
                  <div className="max-w-4xl mx-auto">
                    {/* Review Title */}
                    <h3 className="text-white text-2xl sm:text-3xl font-bold mb-6 text-center">
                      "{review.title}"
                    </h3>

                    {/* Star Rating */}
                    <div className="flex justify-center mb-8">
                      <div className="flex space-x-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                    {/* Review Text */}
                    <blockquote className="text-gray-300 text-lg sm:text-xl leading-relaxed italic text-center mb-12 max-w-4xl mx-auto">
                      "{review.review}"
                    </blockquote>

                    {/* Customer Info */}
                    <div className="flex items-center justify-center space-x-4">
                      <img
                        src={review.avatar}
                        alt={review.customer}
                        className="w-16 h-16 rounded-full border-2 border-orange-500"
                      />
                      <div className="text-left">
                        <h4 className="text-white text-xl font-bold">
                          {review.customer}
                        </h4>
                        <p className="text-orange-500 text-sm font-medium">
                          {review.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition-colors duration-200 z-10"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-slate-700 hover:bg-slate-600 text-white p-3 rounded-lg transition-colors duration-200 z-10"
            aria-label="Next review"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center space-x-2 mt-12">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentSlide
                  ? "bg-orange-500"
                  : "bg-gray-500 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Location Pin Icon */}
        <div className="absolute bottom-8 left-8">
          <MapPin className="w-12 h-12 text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewsCarousel;
