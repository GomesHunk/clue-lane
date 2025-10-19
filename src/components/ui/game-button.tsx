import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

const GameButton = forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles = "font-semibold rounded-2xl transition-smooth hover-lift disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none touch-manipulation";
    
    const variants = {
      primary: "gradient-primary text-primary-foreground shadow-primary",
      secondary: "gradient-secondary text-secondary-foreground shadow-secondary",
      accent: "gradient-accent text-accent-foreground shadow-accent",
      ghost: "bg-transparent hover:bg-muted text-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    };

    const sizes = {
      sm: "px-4 py-2 text-sm min-h-[40px]",
      md: "px-6 py-3 text-base min-h-[48px]",
      lg: "px-8 py-4 text-lg min-h-[56px]"
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GameButton.displayName = "GameButton";

export { GameButton };
