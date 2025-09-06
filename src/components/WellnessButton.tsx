import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const wellnessButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:shadow-md active:scale-[0.99]",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:shadow-md",
        accent: "bg-accent/10 text-accent-foreground border border-accent/20 hover:bg-accent/20",
        outline: "border border-primary text-primary bg-transparent hover:bg-primary/10",
        ghost: "text-primary hover:bg-primary/10 hover:text-primary",
        critical: "bg-wellness-critical text-destructive-foreground shadow-md hover:bg-wellness-critical/90",
        safe: "bg-wellness-safe text-white shadow-sm hover:bg-wellness-safe/90",
        concerned: "bg-wellness-concerned text-white shadow-sm hover:bg-wellness-concerned/90",
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
