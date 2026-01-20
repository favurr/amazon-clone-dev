import Navbar from "@/components/store/navbar";
import Footer from "@/components/store/footer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Secondary Nav bar (the one with "Today's Deals", "Customer Service") */}
      <div className="bg-[#232f3e] text-white flex items-center px-4 py-2 gap-4 text-sm font-medium overflow-x-auto whitespace-nowrap">
        <span className="flex items-center gap-1 cursor-pointer border border-transparent hover:border-white p-1">All</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1">Today's Deals</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1">Customer Service</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1">Registry</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1">Gift Cards</span>
        <span className="cursor-pointer border border-transparent hover:border-white p-1">Sell</span>
      </div>
      
      <main className="flex-grow bg-[#eaeded]">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}