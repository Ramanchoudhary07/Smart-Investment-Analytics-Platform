import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Tab,
  Tabs,
  Divider,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  TrendingUp,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const { login, register, loading } = useAuth();
  const [tab, setTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginData.username || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }

    const success = await login(loginData.username, loginData.password);
    if (!success) {
      setError("Invalid username or password");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !registerData.username ||
      !registerData.email ||
      !registerData.password
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const success = await register({
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
    });

    if (!success) {
      setError("Registration failed. Username or email may already exist.");
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 2,
          margin: 0,
        }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            width: "100%",
            maxWidth: 500,
            borderRadius: 2,
            mx: "auto",
          }}
        >
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 2,
              }}
            >
              <TrendingUp sx={{ fontSize: 40, color: "primary.main", mr: 1 }} />
              <Typography
                component="h1"
                variant="h4"
                color="primary.main"
                fontWeight="bold"
              >
                SmartInvest
              </Typography>
            </Box>
            <Typography variant="h6" color="textSecondary">
              Your Intelligent Investment Analytics Platform
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Sign In" />
            <Tab label="Sign Up" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          {tab === 0 && (
            <Box component="form" onSubmit={handleLogin}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                autoFocus
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({ ...loginData, username: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} /> : "Sign In"}
              </Button>

              <Box sx={{ textAlign: "center" }}>
                <Link href="#" variant="body2">
                  Forgot password?
                </Link>
              </Box>
            </Box>
          )}

          {/* Register Form */}
          {tab === 1 && (
            <Box component="form" onSubmit={handleRegister}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Username"
                autoFocus
                value={registerData.username}
                onChange={(e) =>
                  setRegisterData({ ...registerData, username: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email Address"
                type="email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={registerData.confirmPassword}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
                size="large"
              >
                {loading ? <CircularProgress size={24} /> : "Create Account"}
              </Button>

              <Typography variant="body2" color="textSecondary" align="center">
                By signing up, you agree to our{" "}
                <Link href="#" color="primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" color="primary">
                  Privacy Policy
                </Link>
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Demo Credentials */}
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Demo Access:</strong>
              <br />
              Username: demo | Password: demo123
            </Typography>
          </Alert>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
