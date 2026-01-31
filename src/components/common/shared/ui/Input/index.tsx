import { ComponentProps } from "react";

interface InputProps extends ComponentProps<"input"> {
  fullWidth?: boolean;
}

const Input = ({ fullWidth, ...props }: InputProps) => {
  const baseClasses =
    "border rounded-lg p-3 border-input-border-gray bg-input-bg-gray font-medium leading-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-input-placeholder-gray";
  const fullWidthClass = fullWidth ? "w-full" : "inline-block";
  const className =
    `${baseClasses} ${fullWidthClass} ${props.className ?? ""}`.trim();

  return <input className={className} {...props} />;
};

export default Input;
