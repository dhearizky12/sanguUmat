import { useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5236/api/auth/me", {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
  }, []);

  const logout = () => {
    window.location.href = "http://localhost:5236/api/auth/logout";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user?.isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
