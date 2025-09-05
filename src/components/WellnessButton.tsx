import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const wellnessButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-gradient-primary text-primary-foreground shadow-soft hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-gradient-safe text-secondary-foreground shadow-gentle border border-border hover:shadow-soft hover:scale-[1.02]",
        warm: "bg-gradient-warm text-warning-foreground shadow-warm hover:shadow-lg hover:scale-[1.02]",
        outline: "border-2 border-primary text-primary bg-background hover:bg-primary/5 hover:shadow-gentle",
        ghost: "text-primary hover:bg-primary/10 hover:text-primary",
        calm: "bg-wellness-calm/10 text-wellness-calm border border-wellness-calm/20 hover:bg-wellness-calm/20",
        critical: "bg-wellness-critical text-white shadow-lg hover:bg-wellness-critical/90"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-12 w-12 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface WellnessButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof wellnessButtonVariants> {
  asChild?: boolean;
}

const WellnessButton = React.forwardRef<HTMLButtonElement, WellnessButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(wellnessButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
WellnessButton.displayName = "WellnessButton";

export { WellnessButton, wellnessButtonVariants };