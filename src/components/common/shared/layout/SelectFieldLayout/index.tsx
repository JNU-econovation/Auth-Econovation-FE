import Spacing from "@shared/layout/Spacing";
import Select from "@shared/ui/Select";
import Text from "@shared/ui/Text";
import type { TextColor } from "@shared/ui/Text";
import { ComponentProps } from "react";

interface SelectFieldLayoutProps extends ComponentProps<typeof Select> {
  id?: string;
  label?: string;
  helperText?: string;
  helperTextColor?: TextColor;
}

const SelectFieldLayout = ({
  id = "select-field",
  label,
  helperText,
  helperTextColor = "gray1",
  children,
  ...selectProps
}: SelectFieldLayoutProps) => {
  return (
    <div>
      {label && (
        <label htmlFor={id}>
          <Text size="6">{label}</Text>
        </label>
      )}
      <Spacing size={6} direction="vertical" />
      <Select fullWidth id={id} {...selectProps}>
        {children}
      </Select>
      {helperText && (
        <div className="flex flex-col items-end">
          <Spacing size={6} direction="vertical" />
          <Text size="7" color={helperTextColor}>
            {helperText}
          </Text>
        </div>
      )}
    </div>
  );
};

export default SelectFieldLayout;
