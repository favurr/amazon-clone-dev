"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full text-white bg-[#232f3e]">
      {/* Back to Top - Responsive */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full py-3 sm:py-4 bg-[#37475a] hover:bg-[#485769] text-xs sm:text-sm font-bold transition-colors"
      >
        Back to top
      </button>

      {/* Main Links Area - Responsive Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-10">
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-bold text-sm sm:text-base">Get to Know Us</h4>
          <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer">Careers</li>
            <li className="hover:underline cursor-pointer">Blog</li>
            <li className="hover:underline cursor-pointer">About Amazon</li>
            <li className="hover:underline cursor-pointer hidden sm:list-item">Investor Relations</li>
          </ul>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-bold text-sm sm:text-base">Make Money with Us</h4>
          <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer">Sell products on Amazon</li>
            <li className="hover:underline cursor-pointer">Sell on Amazon Business</li>
            <li className="hover:underline cursor-pointer">Become an Affiliate</li>
          </ul>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-bold text-sm sm:text-base">Amazon Payment Products</h4>
          <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer">Amazon Business Card</li>
            <li className="hover:underline cursor-pointer">Shop with Points</li>
            <li className="hover:underline cursor-pointer">Reload Your Balance</li>
          </ul>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-bold text-sm sm:text-base">Let Us Help You</h4>
          <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer hidden sm:list-item">Amazon and COVID-19</li>
            <li className="hover:underline cursor-pointer">Your Account</li>
            <li className="hover:underline cursor-pointer">Shipping Rates & Policies</li>
            <li className="hover:underline cursor-pointer">Returns & Replacements</li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal / Branding - Responsive */}
      <div className="border-t border-gray-700 pt-6 sm:pt-8 md:pt-10 pb-10 sm:pb-12 md:pb-16 flex flex-col items-center gap-4 sm:gap-6 px-4">
        <Image 
          src="/amazon-logo-white.png" 
          width={80} 
          height={30} 
          alt="Logo" 
          className="w-16 sm:w-20 h-auto"
        />
        <p className="text-[10px] sm:text-xs text-gray-400 text-center">
          © 1996-2026, Amazon.com, Inc. or its affiliates
        </p>
      </div>
    </footer>
  );
}