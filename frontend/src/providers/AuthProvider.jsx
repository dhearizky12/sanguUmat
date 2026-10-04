import { useEffect, useState } from "react";
import AuthContext from "../contexts/AuthContext";
import { BASE_PATH } from "../lib/basePath";
import { API_URL, pictureUrl, setToken } from "../lib/api";

export default function AuthProvider({ children }) {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
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
        });

        if (!profileRes.ok) {
          setProfile(null);
          return;
        }

        const profileData = await profileRes.json();
        profileData.picture = pictureUrl(profileData.picture);
        setProfile(profileData);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    // Signing out is just forgetting the token. A full load resets all signed-in state.
    setToken(null);
    window.location.assign(`${BASE_PATH}/login`);
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
