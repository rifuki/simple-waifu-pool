// FILE: src/components/Layout.tsx
import { type ReactNode } from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: ReactNode;
  navigateToHome: () => void;
  navigateToCreate: () => void;
}

const Layout = ({
  children,
  navigateToHome,
  navigateToCreate,
}: LayoutProps) => (
  <div className="min-h-screen bg-gray-900 text-white">
    <Navbar
      navigateToHome={navigateToHome}
      navigateToCreate={navigateToCreate}
    />
    <main className="container mx-auto p-4">{children}</main>
  </div>
);
export default Layout;
