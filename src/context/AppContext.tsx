// src/context/AppContext.tsx
import React, { createContext, useContext, useState } from "react";

const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <AppContext.Provider value={{ products, setProducts, loading, setLoading }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
