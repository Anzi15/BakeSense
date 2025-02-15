import { createContext, useState } from "react";

export const AuthContext = createContext(null); // ✅ Ensure it is not undefined

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}> {/* ✅ Provide user & setUser */}
      {children}
    </AuthContext.Provider>
  );
};
