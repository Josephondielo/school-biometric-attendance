import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-card-bg border border-white/5 rounded-2xl p-5 shadow-xl backdrop-blur-sm",
          "min-h-[1px] min-w-[1px]"
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
