import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import {
  Person,
  Security,
  Notifications,
  Palette,
  Delete,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";
import toast from "react-hot-toast";

const UserSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [userProfile, setUserProfile] = useState({
    username: "testuser",
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+1 234 567 8900",
    country: "United States",
    timezone: "EST",
    bio: "Passionate investor focused on long-term value investing strategies.",
  });

  const [originalProfile, setOriginalProfile] = useState(userProfile);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketAlerts: true,
    portfolioSummary: true,
    riskAlerts: true,
    priceAlerts: false,
    darkMode: false,
    currency: "USD",
    language: "English",
  });

  const handleProfileEdit = () => {
    setOriginalProfile(userProfile);
    setIsEditing(true);
  };

  const handleProfileSave = async () => {
    try {
      // Here you would make API call to update user profile
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleProfileCancel = () => {
    setUserProfile(originalProfile);
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // Here you would make API call to change password
      toast.success("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    toast.success("Preference updated");
  };

  const handleAccountDelete = async () => {
    try {
      // Here you would make API call to delete account
      toast.success("Account deletion initiated");
      setOpenDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 4,
        mb: 4,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Notifications />} label="Preferences" />
          <Tab icon={<Palette />} label="Appearance" />
        </Tabs>
      </Paper>

      {/* Profile Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "primary.main",
                    fontSize: 48,
                  }}
                >
                  {userProfile.firstName[0]}
                  {userProfile.lastName[0]}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {userProfile.firstName} {userProfile.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  @{userProfile.username}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Member since January 2024
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }}>
                  Change Photo
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6">Personal Information</Typography>
                {!isEditing ? (
                  <Button startIcon={<Edit />} onClick={handleProfileEdit}>
                    Edit Profile
                  </Button>
                ) : (
                  <Box>
                    <Button
                      startIcon={<Save />}
                      onClick={handleProfileSave}
                      sx={{ mr: 1 }}
                      variant="contained"
                    >
                      Save
                    </Button>
                    <Button
                      startIcon={<Cancel />}
                      onClick={handleProfileCancel}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={userProfile.firstName}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        firstName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={userProfile.lastName}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        lastName: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={userProfile.username}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={userProfile.email}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, email: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={userProfile.phone}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={userProfile.country}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        country: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={userProfile.bio}
                    onChange={(e) =>
                      setUserProfile({ ...userProfile, bio: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Security Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                onClick={handlePasswordChange}
                disabled={
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
              >
                Change Password
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Login Alerts"
                    secondary="Get notified of new login attempts"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Session Timeout"
                    secondary="Auto logout after inactivity"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>

            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Danger Zone
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Once you delete your account, there is no going back. Please be
                certain.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setOpenDeleteDialog(true)}
              >
                Delete Account
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Preferences Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Email Notifications"
                    secondary="Receive updates via email"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Push Notifications"
                    secondary="Browser push notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.pushNotifications}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "pushNotifications",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Market Alerts"
                    secondary="Significant market movements"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.marketAlerts}
                      onChange={(e) =>
                        handlePreferenceChange("marketAlerts", e.target.checked)
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Portfolio Summary"
                    secondary="Daily portfolio performance"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.portfolioSummary}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "portfolioSummary",
                          e.target.checked
                        )
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Risk Alerts"
                    secondary="Portfolio risk warnings"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={preferences.riskAlerts}
                      onChange={(e) =>
                        handlePreferenceChange("riskAlerts", e.target.checked)
                      }
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Trading Preferences
              </Typography>
              <TextField
                fullWidth
                select
                label="Default Currency"
                value={preferences.currency}
                onChange={(e) =>
                  handlePreferenceChange("currency", e.target.value)
                }
                sx={{ mb: 2 }}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </TextField>
              <TextField
                fullWidth
                select
                label="Language"
                value={preferences.language}
                onChange={(e) =>
                  handlePreferenceChange("language", e.target.value)
                }
                SelectProps={{
                  native: true,
                }}
              >
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
              </TextField>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Appearance Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Appearance Settings
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.darkMode}
                    onChange={(e) =>
                      handlePreferenceChange("darkMode", e.target.checked)
                    }
                  />
                }
                label="Dark Mode"
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Switch between light and dark themes
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Delete Account Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently
            deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete your account? Type "DELETE" to
            confirm:
          </Typography>
          <TextField
            fullWidth
            margin="dense"
            placeholder="Type DELETE to confirm"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAccountDelete}
            color="error"
            variant="contained"
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserSettings;
