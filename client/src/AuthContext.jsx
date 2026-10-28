import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("imovies_user"));
    } catch {
      return null;
    }
  });

  const login = ({ token, user }) => {
    localStorage.setItem("imovies_token", token);
    localStorage.setItem("imovies_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("imovies_token");
    localStorage.removeItem("imovies_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
