import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  url: string;
  className?: string;
  children: React.ReactNode;
}

export const Logo = ({ url, className, children }: LogoProps) => {
  return (
    <Link href={url} className={className}>
      {children}
    </Link>
  );
};

interface LogoImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export const LogoImageDesktop = ({ src, alt, title, className }: LogoImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      title={title}
      width={150}
      height={40}
      className={`hidden md:block ${className || ""}`}
    />
  );
};

export const LogoImageMobile = ({ src, alt, title, className }: LogoImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      title={title}
      width={100}
      height={30}
      className={`md:hidden ${className || ""}`}
    />
  );
};
