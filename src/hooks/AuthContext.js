import { createContext, useState, useEffect } from "react";
import { auth } from "../helpers/firebase/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Step 1: Load user from localStorage first
    const savedUser = JSON.parse(localStorage.getItem("savedUser"));
    if (savedUser) {
      setUser(savedUser); // Set user immediately for offline persistence
      setLoading(false);
    }
  
    // Step 2: Subscribe to Firebase auth changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const isFactoryUser = firebaseUser.email === "factory@sukkurbakers.com.pk";
  
        const authenticatedUser = {
          email: firebaseUser.email,
          role: isFactoryUser ? "factory" : "user",
          label: isFactoryUser ? "Factory User" : "Regular User",
        };
  
        setUser(authenticatedUser);
        localStorage.setItem("savedUser", JSON.stringify(authenticatedUser)); // Persist login state
      } else {
        // Only clear localStorage if explicitly logging out
        if (navigator.onLine) {
          setUser(null);
          localStorage.removeItem("savedUser");
        }
      }
  
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);
  
  

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
