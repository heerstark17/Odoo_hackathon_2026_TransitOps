import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("transitops_token");
    if (!token) return setLoading(false);

    api
      .get("/auth/me")
      .then(({ data }) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("transitops_token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async ({ role, ...credentials }) => {
        const { data } = await api.post("/auth/login", credentials);
        if (role && data.user.role !== role) {
          await api.post("/auth/logout");
          throw new Error(
            `This account is registered as ${data.user.role.replaceAll("_", " ")}.`,
          );
        }
        localStorage.setItem("transitops_token", data.token);
        setUser(data.user);
        return data.user;
      },
      register: async (payload) => {
        const { data } = await api.post("/auth/register", payload);
        localStorage.setItem("transitops_token", data.token);
        setUser(data.user);
        return data.user;
      },
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } finally {
          localStorage.removeItem("transitops_token");
          setUser(null);
        }
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
