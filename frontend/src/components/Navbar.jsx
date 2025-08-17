import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  AccountCircle,
  Dashboard as DashboardIcon,
  TrendingUp,
  Assessment,
  Settings,
  Logout,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { path: "/transactions", label: "Transactions", icon: <TrendingUp /> },
    { path: "/risk", label: "Risk Analysis", icon: <Assessment /> },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Investment Analytics
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              startIcon={item.icon}
              variant={location.pathname === item.path ? "outlined" : "text"}
              sx={{ color: "white", borderColor: "white" }}
            >
              {item.label}
            </Button>
          ))}

          <IconButton size="large" onClick={handleMenu} color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                navigate("/settings");
                handleClose();
              }}
            >
              <Settings sx={{ mr: 1 }} /> Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
