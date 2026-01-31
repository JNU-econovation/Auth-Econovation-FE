import Spacing from "@shared/layout/Spacing";
import Input from "@shared/ui/Input";
import Text from "@shared/ui/Text";
import type { TextColor } from "@shared/ui/Text";
import { ComponentProps } from "react";

interface TextFieldLayoutProps extends ComponentProps<typeof Input> {
  id?: string;
  label?: string;
  helperText?: string;
  helperTextColor?: TextColor;
  helperComponent?: React.ReactNode;
}

const TextFieldLayout = ({
  id = "input-field",
  label,
  helperText,
  helperTextColor = "gray1",
  helperComponent,
  ...InputProps
}: TextFieldLayoutProps) => {
  return (
    <div>
      {label && (
        <label htmlFor={id}>
          <Text size="6">{label}</Text>
        </label>
      )}
      <Spacing size={6} direction="vertical" />
      <Input placeholder="Enter text" fullWidth id={id} {...InputProps} />
      {helperText && !helperComponent && (
        <div className="flex flex-col items-end">
          <Spacing size={6} direction="vertical" />
          <Text size="7" color={helperTextColor}>
            {helperText}
          </Text>
        </div>
      )}
      {helperComponent && (
        <div className="flex flex-col items-end">
          <Spacing size={6} direction="vertical" />
          {helperComponent}
        </div>
      )}
    </div>
  );
};

export default TextFieldLayout;
