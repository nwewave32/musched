import type { ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <>
      {/* 여기에 Context Provider, React Query 등 추가 */}
      {children}
    </>
  );
};
