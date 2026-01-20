import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ChevronDown, Search, ShoppingCart } from "lucide-react";

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  // Common class for the "Amazon-box" hover effect
  const navBoxClass = "flex flex-col justify-center px-2 py-1 border border-transparent hover:border-white cursor-pointer rounded-sm transition-all duration-100";

  return (
    <nav className="flex items-center gap-4 px-4 bg-[#131921] h-[60px] text-white">
      {/* Amazon Logo */}
      <Link href="/" className="px-2 border border-transparent hover:border-white pt-1 rounded-sm">
        <Image
          src="/amazon-logo-white.png"
          alt="Amazon Logo"
          height={30}
          width={100}
          className="object-contain"
        />
      </Link>

      {/* Category Dropdown */}
      <div className={`${navBoxClass} flex-row items-end gap-1`}>
        <div className="flex flex-col">
          <span className="text-[12px] leading-none text-gray-300 font-light">Select</span>
          <span className="text-[14px] leading-none font-bold">Category</span>
        </div>
        <ChevronDown size={14} className="text-gray-400 mb-0.5" />
      </div>

      {/* Search Bar */}
      <div className="flex flex-1 h-10 group">
        <input
          type="text"
          placeholder="Search Amazon"
          className="w-full rounded-l-md bg-white outline-none border-none px-4 text-gray-900 focus:ring-2 focus:ring-[#febd69]"
        />
        <Button className="h-full w-12 rounded-none rounded-r-md bg-[#febd69] hover:bg-[#f3a847] border-none flex justify-center items-center text-black">
          <Search size={22} strokeWidth={2.5} />
        </Button>
      </div>

      {/* Account & Lists */}
      <div className={`${navBoxClass} flex-row items-end gap-1`}>
        <div className="flex flex-col">
          <span className="text-[12px] leading-none text-gray-300 font-light">
            Hello, {user ? user.firstName : <Link href="/auth/login" className="hover:underline">sign in</Link>}
          </span>
          <span className="text-[14px] leading-none font-bold">Account & Lists</span>
        </div>
        <ChevronDown size={14} className="text-gray-400 mb-0.5" />
      </div>

      {/* Orders */}
      <div className={navBoxClass}>
        <span className="text-[12px] leading-none text-gray-300 font-light">Returns</span>
        <span className="text-[14px] leading-none font-bold">& Orders</span>
      </div>

      {/* Improved Cart Component */}
      <Link href="/cart" className="flex items-end px-2 py-1 border border-transparent hover:border-white rounded-sm relative cursor-pointer h-[44px]">
        <div className="relative flex items-center">
          {/* Cart Icon */}
          <Image src="/cart.png" alt="Cart" width={40} height={40} />
          
          {/* Item Count - Perfectly positioned in the basket notch */}
          <span className="absolute top-[-2px] left-[13px] w-5 text-center text-[#f08804] text-[16px] font-bold leading-none bg-transparent">
            5
          </span>
        </div>
        
        {/* Cart Text */}
        <span className="text-[14px] font-bold pb-1 ml-1">Cart</span>
      </Link>
    </nav>
  );
}

/* <form action={logoutAction}>
  <Button
    variant="ghost"
    className="text-sm font-bold hover:bg-transparent hover:text-orange-400 p-0 h-auto"
    type="submit"
  >
    Sign Out
  </Button>
</form> */
