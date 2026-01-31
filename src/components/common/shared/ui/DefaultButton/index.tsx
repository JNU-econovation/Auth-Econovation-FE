import { ComponentProps } from "react";

interface DefaultButtonProps extends ComponentProps<"button"> {
  fullWidth?: boolean;
}

const DefaultButton = ({ title, fullWidth, ...props }: DefaultButtonProps) => {
  const baseClasses = "px-6 py-3 bg-primary text-white rounded-lg";
  const fullWidthClass = fullWidth ? "w-full" : "inline-block";
  const className =
    `${baseClasses} ${fullWidthClass} ${props.className ?? ""}`.trim();

  return (
    <button className={className} {...props}>
      {title}
    </button>
  );
};

export default DefaultButton;
