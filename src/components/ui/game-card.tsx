import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface GameCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient";
}

const GameCard = forwardRef<HTMLDivElement, GameCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-card border border-border shadow-soft",
      glass: "glass shadow-soft",
      gradient: "gradient-primary shadow-primary text-primary-foreground"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl p-6 transition-smooth",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GameCard.displayName = "GameCard";

export { GameCard };
