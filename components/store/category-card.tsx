import Link from "next/link";
import Image from "next/image";

interface CategoryCardProps {
  title: string;
  image: string;
  href: string;
  linkText?: string;
}

export function CategoryCard({ title, image, href, linkText = "See more" }: CategoryCardProps) {
  return (
    <div className="bg-white p-3 sm:p-4 md:p-5 rounded-md h-[280px] sm:h-[350px] md:h-[420px] flex flex-col hover:shadow-lg transition-shadow">
      <h2 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-[#0F1111]">{title}</h2>
      <div className="flex-1 relative mb-2 sm:mb-3 md:mb-4 overflow-hidden rounded">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover hover:scale-105 transition-transform"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <Link
        href={href}
        className="text-xs sm:text-sm text-[#007185] hover:text-[#c7511f] hover:underline font-medium"
      >
        {linkText}
      </Link>
    </div>
  );
}