import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(username, password);
      const newToken = response.data.access_token;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      toast.success("Login successful!");
      return true;
    } catch (error) {
      toast.error("Invalid credentials");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      await authAPI.register(userData);
      const loginSuccess = await login(userData.username, userData.password);
      if (loginSuccess) {
        toast.success("Registration successful!");
      }
      return loginSuccess;
    } catch (error) {
      toast.error("Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
