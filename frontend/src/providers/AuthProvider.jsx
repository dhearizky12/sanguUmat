import { useEffect, useState } from "react";
import AuthContext from "../contexts/AuthContext";

export default function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meRes = await fetch("http://localhost:5236/api/auth/me", {
          credentials: "include",
        });

        if (!meRes.ok) {
          setMe(null);
          setProfile(null);
          return;
        }

        const meJson = await meRes.json();
        setMe(meJson);

        const profileRes = await fetch("http://localhost:5236/api/auth/profile", {
          credentials: "include",
        });

        if (!profileRes.ok) {
          setProfile(null);
          return;
        }

        const profileData = await profileRes.json();
        profileData.picture = "http://localhost:5236/" + profileData.picture;
        setProfile(profileData);
      } catch {
        setProfile(null);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    window.location.href = "http://localhost:5236/api/auth/logout";
  };

  return (
    <AuthContext.Provider
      value={{
        me,
        profile,
        loading,
        isAuthenticated: !!me?.isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
