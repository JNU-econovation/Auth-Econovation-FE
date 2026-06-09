import { ComponentProps } from "react";

interface SelectProps extends ComponentProps<"select"> {
  fullWidth?: boolean;
}

const Select = ({ fullWidth, ...props }: SelectProps) => {
  const baseClasses =
    "border rounded-lg p-3 border-input-border-gray bg-input-bg-gray font-medium leading-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
  const fullWidthClass = fullWidth ? "w-full" : "inline-block";
  const className =
    `${baseClasses} ${fullWidthClass} ${props.className ?? ""}`.trim();

  return <select className={className} {...props} />;
};

export default Select;
