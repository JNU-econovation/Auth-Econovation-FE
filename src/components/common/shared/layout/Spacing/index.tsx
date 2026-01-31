interface SpacingProps {
  size: number;
  direction?: "horizontal" | "vertical";
}

/**
 *
 * 해당 컴포넌트는 레이아웃에서 요소들 사이에 일정한 간격을 주기 위해 사용됩니다.
 *
 * 빠른 레이아웃 버그를 판단하기 위하여 mt, mb, ml, mr 등의 마진 속성을 사용하는 대신, Spacing 컴포넌트를 사용해야합니다.
 *
 * @prop size - 간격의 크기를 픽셀 단위로 지정합니다.
 * @prop direction - 간격의 방향을 지정합니다. "vertical" (기본값) 또는 "horizontal" 중 하나를 선택할 수 있습니다.
 */
const Spacing = ({ size, direction = "vertical" }: SpacingProps) => {
  return (
    <div
      style={{ [direction === "vertical" ? "height" : "width"]: `${size}px` }}
    />
  );
};

export default Spacing;
