import React from "react";
import { cn } from "@/lib/utils";
import squidjobLogo from "@assets/SquidJob Logo_1749998301094.png";

interface LogoProps {
  className?: string;
  textClassName?: string;
  centered?: boolean;
}

export function Logo({ className, textClassName, centered = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", centered && "justify-center", className)}>
      <img 
        src={squidjobLogo} 
        alt="SquidJob" 
        className="h-16 w-auto object-contain"
        onError={(e) => {
          // Fallback to text if image fails
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const textElement = target.nextElementSibling as HTMLElement;
          if (textElement) {
            textElement.style.display = 'block';
          }
        }}
      />
      <h1 className={cn("text-xl font-bold hidden", textClassName)}>
        <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">SquidJob</span>
      </h1>
    </div>
  );
}
