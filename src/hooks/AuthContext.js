import { createContext, useState, useEffect } from "react";
import { auth } from "../helpers/firebase/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Assign role based on email
        const isFactoryUser = firebaseUser?.email === "factory@sukkurbakers.com.pk";

        setUser({
          email: firebaseUser?.email,
          role: isFactoryUser ? "factory" : "user", // Default role is "user"
          label: isFactoryUser ? "Factory User" : "Regular User",
        });
      } else if (!navigator.onLine) {
        // Check offline users
        const savedUsers = JSON.parse(localStorage.getItem("savedUsers")) || {};
        const lastUser = Object.values(savedUsers)[0];

        if (lastUser) {
          setUser(lastUser);
        }
      } else {
        setUser(null);
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
