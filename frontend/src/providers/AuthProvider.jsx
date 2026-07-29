import { useEffect, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import { API_URL } from "../lib/api";

export default function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });

        if (!meRes.ok) {
          setMe(null);
          setProfile(null);
          return;
        }

        const meJson = await meRes.json();
        setMe(meJson);

        // /api/auth/me answers 200 with { isAuthenticated: false } for signed-out
        // visitors, so meRes.ok says nothing about whether there is a user. Asking
        // for the profile anyway just produces a 404.
        if (!meJson.isAuthenticated) {
          setProfile(null);
          return;
        }

        const profileRes = await fetch(`${API_URL}/api/auth/profile`, {
          credentials: "include",
        });

        if (!profileRes.ok) {
          setProfile(null);
          return;
        }

        const profileData = await profileRes.json();
        profileData.picture = profileData.picture ? API_URL + profileData.picture : null;
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
    window.location.href = `${API_URL}/api/auth/logout`;
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
