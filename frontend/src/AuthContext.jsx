/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import useToken from "./useToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { token, saveToken, removeToken } = useToken();
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const response = await fetch("http://localhost:8000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    saveToken(data);
    setUser(data.username);
    return data;
  };

  const signup = async (newUser) => {
    const response = await fetch("http://localhost:8000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error("Signup failed");
    }

    const data = await response.json();
    saveToken(data);
    setUser(data.username);
    return data;
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const value = {
    token,
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
