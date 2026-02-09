import Navbar from "@/components/store/navbar";
import Footer from "@/components/store/footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Secondary Navigation - Responsive scrollable menu */}
      <div className="bg-[#232f3e] text-white flex items-center px-2 sm:px-4 py-2 gap-2 sm:gap-4 text-xs sm:text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
        <span className="flex items-center gap-1 cursor-pointer hover:border-white border border-transparent p-1 rounded transition-colors">
          All
        </span>
        <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded transition-colors">
          Today's Deals
        </span>
        <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded transition-colors hidden sm:inline-block">
          Customer Service
        </span>
        <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded transition-colors hidden md:inline-block">
          Registry
        </span>
        <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded transition-colors">
          Gift Cards
        </span>
        <span className="cursor-pointer hover:border-white border border-transparent p-1 rounded transition-colors">
          Sell
        </span>
      </div>
      
      <main className="flex-grow bg-[#eaeded]">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}