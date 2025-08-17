import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Portfolio from "./components/Portfolio";
import StockAnalysis from "./components/StockAnalysis";
import Transactions from "./components/Transactions";
import RiskDashboard from "./components/RiskDashboard";
import UserSettings from "./components/UserSettings";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    success: {
      main: "#2e7d32",
    },
    error: {
      main: "#d32f2f",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "24px !important",
          paddingRight: "24px !important",
          margin: "0 auto",
        },
      },
    },
  },
});

function AppContent() {
  const { token } = useAuth();

  if (!token) {
    return <Login />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "#f5f5f5",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/portfolio/:id" element={<Portfolio />} />
          <Route path="/stock/:symbol" element={<StockAnalysis />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/risk" element={<RiskDashboard />} />
          <Route path="/settings" element={<UserSettings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
