import { PropsWithChildren } from "react";

/**
 *
 * 이 컴포넌트는 모든 페이지의 width 크기를 제한하는 공통 컨포넌트입니다.
 *
 * 페이지를 나타내는 컴포넌트의 최상단에만 사용되어야합니다.
 */

const ScreenWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="max-w-3xl mx-auto sm:px-0 px-4 min-h-screen">
      {children}
    </div>
  );
};

export default ScreenWrapper;
