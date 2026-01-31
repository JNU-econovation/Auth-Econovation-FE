import { PropsWithChildren } from "react";

const ScreenWrapper = ({ children }: PropsWithChildren) => {
  return <div className="max-w-3xl mx-auto sm:px-0 px-4">{children}</div>;
};

export default ScreenWrapper;
