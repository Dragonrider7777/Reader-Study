import { useState } from "react";

const TOKEN_KEY = "token";

export default function useToken() {
  const getToken = () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored)?.token ?? null;
    } catch {
      return null;
    }
  };

  const [token, setTokenState] = useState(getToken());

  const saveToken = (userToken) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(userToken));
    setTokenState(userToken.token);
  };

  const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  };

  return { token, saveToken, removeToken };
}
