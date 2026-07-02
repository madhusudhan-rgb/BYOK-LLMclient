import React, { createContext, useState } from "react";

interface NavbarContextType {
  showNavbar: boolean;
  setShowNavbar: (show: boolean) => void;
}

export const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: React.ReactNode }) {
  const [showNavbar, setShowNavbar] = useState(true);

  return (
    <NavbarContext.Provider value={{ showNavbar, setShowNavbar }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = React.useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within NavbarProvider");
  }
  return context;
}
