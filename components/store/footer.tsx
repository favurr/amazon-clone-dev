"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full text-white bg-[#232f3e]">
      {/* Back to Top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full py-4 bg-[#37475a] hover:bg-[#485769] text-sm font-bold transition-colors"
      >
        Back to top
      </button>

      {/* Main Links Area */}
      <div className="max-w-7xl mx-auto px-10 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div className="space-y-3">
          <h4 className="font-bold text-base">Get to Know Us</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer">Careers</li>
            <li className="hover:underline cursor-pointer">Blog</li>
            <li className="hover:underline cursor-pointer">About Amazon</li>
            <li className="hover:underline cursor-pointer">Investor Relations</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-base">Make Money with Us</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer">Sell products on Amazon</li>
            <li className="hover:underline cursor-pointer">Sell on Amazon Business</li>
            <li className="hover:underline cursor-pointer">Become an Affiliate</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-base">Amazon Payment Products</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer">Amazon Business Card</li>
            <li className="hover:underline cursor-pointer">Shop with Points</li>
            <li className="hover:underline cursor-pointer">Reload Your Balance</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="font-bold text-base">Let Us Help You</h4>
          <ul className="text-sm space-y-2 text-gray-300">
            <li className="hover:underline cursor-pointer">Amazon and COVID-19</li>
            <li className="hover:underline cursor-pointer">Your Account</li>
            <li className="hover:underline cursor-pointer">Shipping Rates & Policies</li>
            <li className="hover:underline cursor-pointer">Returns & Replacements</li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal / Branding */}
      <div className="border-t border-gray-700 pt-10 pb-16 flex flex-col items-center gap-6">
        <Image src="/amazon-logo-white.png" width={80} height={30} alt="Logo" />
        <p className="text-xs text-gray-400">© 1996-2026, Amazon.com, Inc. or its affiliates</p>
      </div>
    </footer>
  );
}