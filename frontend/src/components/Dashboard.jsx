import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  IconButton,
  Fab,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  TrendingUp,
  TrendingDown,
  Assessment,
  BusinessCenter as PortfolioIcon, // Fixed: Use BusinessCenter instead of Portfolio
} from "@mui/icons-material";

import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { portfolioAPI, stockAPI } from "../services/api";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [openPortfolioDialog, setOpenPortfolioDialog] = useState(false);
  const [openHoldingDialog, setOpenHoldingDialog] = useState(false);
  const [predictions, setPredictions] = useState({});

  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: "",
  });

  const [newHolding, setNewHolding] = useState({
    symbol: "",
    company_name: "",
    shares: "",
    average_price: "",
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadHoldings();
      loadAnalytics();
    }
  }, [selectedPortfolio]);

  useEffect(() => {
    if (holdings.length > 0) {
      loadPredictions();
    }
  }, [holdings]);

  const loadPortfolios = async () => {
    try {
      const response = await portfolioAPI.getPortfolios();
      setPortfolios(response.data);
      if (response.data.length > 0 && !selectedPortfolio) {
        setSelectedPortfolio(response.data[0]);
      }
    } catch (error) {
      toast.error("Failed to load portfolios");
    }
  };

  const loadHoldings = async () => {
    try {
      const response = await portfolioAPI.getHoldings(selectedPortfolio.id);
      setHoldings(response.data);
    } catch (error) {
      toast.error("Failed to load holdings");
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await portfolioAPI.getAnalytics(selectedPortfolio.id);
      setAnalytics(response.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    }
  };

  const loadPredictions = async () => {
    const newPredictions = {};
    for (const holding of holdings.slice(0, 3)) {
      // Limit to avoid API rate limits
      try {
        const response = await stockAPI.getPrediction(holding.symbol);
        newPredictions[holding.symbol] = response.data;
      } catch (error) {
        console.error(`Failed to load prediction for ${holding.symbol}`);
      }
    }
    setPredictions(newPredictions);
  };

  const handleCreatePortfolio = async () => {
    try {
      await portfolioAPI.createPortfolio(newPortfolio);
      setOpenPortfolioDialog(false);
      setNewPortfolio({ name: "", description: "" });
      loadPortfolios();
      toast.success("Portfolio created successfully!");
    } catch (error) {
      toast.error("Failed to create portfolio");
    }
  };

  const handleAddHolding = async () => {
    try {
      await portfolioAPI.addHolding(selectedPortfolio.id, {
        ...newHolding,
        shares: parseFloat(newHolding.shares),
        average_price: parseFloat(newHolding.average_price),
      });
      setOpenHoldingDialog(false);
      setNewHolding({
        symbol: "",
        company_name: "",
        shares: "",
        average_price: "",
      });
      loadHoldings();
      loadAnalytics();
      toast.success("Holding added successfully!");
    } catch (error) {
      toast.error("Failed to add holding");
    }
  };

  // Chart data
  const portfolioChartData = {
    labels: holdings.map((h) => h.symbol),
    datasets: [
      {
        data: holdings.map((h) => h.market_value),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
          "#4BC0C0",
          "#FF6384",
        ],
      },
    ],
  };

  const performanceData = {
    labels: ["6m ago", "5m ago", "4m ago", "3m ago", "2m ago", "1m ago", "Now"],
    datasets: [
      {
        label: "Portfolio Value ($)",
        data: [
          (analytics.total_value || 0) * 0.85,
          (analytics.total_value || 0) * 0.9,
          (analytics.total_value || 0) * 0.88,
          (analytics.total_value || 0) * 0.95,
          (analytics.total_value || 0) * 0.93,
          (analytics.total_value || 0) * 0.98,
          analytics.total_value || 0,
        ],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 4,
        mb: 4,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ m: 0 }}>
          Investment Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenPortfolioDialog(true)}
        >
          Create Portfolio
        </Button>
      </Box>

      {/* Portfolio Selector */}
      {portfolios.length > 0 && (
        <Grid
          container
          spacing={2}
          sx={{ mb: 3, width: "100%", margin: 0, marginBottom: 3 }}
        >
          {portfolios.map((portfolio) => (
            <Grid item xs={12} sm={6} md={4} key={portfolio.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  border: selectedPortfolio?.id === portfolio.id ? 2 : 1,
                  borderColor:
                    selectedPortfolio?.id === portfolio.id
                      ? "primary.main"
                      : "divider",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={() => setSelectedPortfolio(portfolio)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <PortfolioIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">{portfolio.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {portfolio.description || "No description"}
                  </Typography>
                  <Typography variant="h5" sx={{ mt: 1 }}>
                    ${portfolio.total_value?.toLocaleString() || "0"}
                  </Typography>
                  <Button
                    component={Link}
                    to={`/portfolio/${portfolio.id}`}
                    size="small"
                    startIcon={<ViewIcon />}
                    sx={{ mt: 1 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedPortfolio ? (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ bgcolor: "primary.main", color: "white" }}>
                  <CardContent>
                    <Typography color="inherit" gutterBottom>
                      Total Value
                    </Typography>
                    <Typography variant="h4" color="inherit">
                      ${analytics.total_value?.toLocaleString() || "0"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card
                  sx={{
                    bgcolor:
                      analytics.total_gain_loss >= 0
                        ? "success.main"
                        : "error.main",
                    color: "white",
                  }}
                >
                  <CardContent>
                    <Typography color="inherit" gutterBottom>
                      Total Gain/Loss
                    </Typography>
                    <Typography variant="h4" color="inherit">
                      ${analytics.total_gain_loss?.toLocaleString() || "0"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Annual Return
                    </Typography>
                    <Typography variant="h4">
                      {analytics.metrics?.annual_return || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Sharpe Ratio
                    </Typography>
                    <Typography variant="h4">
                      {analytics.metrics?.sharpe_ratio || 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                Portfolio Performance
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={performanceData}
                  options={{ maintainAspectRatio: false }}
                />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: "flex", flexDirection: "column" }}>
              <Typography
                component="h2"
                variant="h6"
                color="primary"
                gutterBottom
              >
                Asset Allocation
              </Typography>
              <Box sx={{ height: 300 }}>
                {holdings.length > 0 && (
                  <Doughnut
                    data={portfolioChartData}
                    options={{ maintainAspectRatio: false }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          {/* AI Predictions */}
          {Object.keys(predictions).length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography
                  component="h2"
                  variant="h6"
                  color="primary"
                  gutterBottom
                >
                  AI Price Predictions
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(predictions).map(([symbol, prediction]) => (
                    <Grid item xs={12} sm={4} key={symbol}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{symbol}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Current: ${prediction.current_price}
                          </Typography>
                          <Typography
                            variant="h6"
                            color={
                              prediction.change_percent >= 0
                                ? "success.main"
                                : "error.main"
                            }
                          >
                            Predicted: ${prediction.predicted_price}
                          </Typography>
                          <Chip
                            icon={
                              prediction.change_percent >= 0 ? (
                                <TrendingUp />
                              ) : (
                                <TrendingDown />
                              )
                            }
                            label={`${
                              prediction.change_percent >= 0 ? "+" : ""
                            }${prediction.change_percent}%`}
                            color={
                              prediction.change_percent >= 0
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Holdings Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography component="h2" variant="h6" color="primary">
                  Holdings ({holdings.length})
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setOpenHoldingDialog(true)}
                >
                  Add Holding
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell align="right">Shares</TableCell>
                      <TableCell align="right">Avg Price</TableCell>
                      <TableCell align="right">Current Price</TableCell>
                      <TableCell align="right">Market Value</TableCell>
                      <TableCell align="right">Gain/Loss</TableCell>
                      <TableCell align="right">%</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holdings.map((holding) => (
                      <TableRow key={holding.id}>
                        <TableCell>
                          <Button
                            component={Link}
                            to={`/stock/${holding.symbol}`}
                            variant="text"
                            size="small"
                          >
                            {holding.symbol}
                          </Button>
                        </TableCell>
                        <TableCell>{holding.company_name}</TableCell>
                        <TableCell align="right">{holding.shares}</TableCell>
                        <TableCell align="right">
                          ${holding.average_price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${holding.current_price.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          ${holding.market_value.toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              holding.gain_loss >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          ${holding.gain_loss.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${holding.gain_loss_percent.toFixed(1)}%`}
                            color={
                              holding.gain_loss_percent >= 0
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            component={Link}
                            to={`/stock/${holding.symbol}`}
                            size="small"
                          >
                            <Assessment />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Recommendations */}
          {analytics.recommendations &&
            analytics.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography
                    component="h2"
                    variant="h6"
                    color="primary"
                    gutterBottom
                  >
                    AI Recommendations
                  </Typography>
                  {analytics.recommendations.map((rec, index) => (
                    <Alert key={index} severity="info" sx={{ mb: 1 }}>
                      {rec}
                    </Alert>
                  ))}
                </Paper>
              </Grid>
            )}
        </Grid>
      ) : portfolios.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Welcome to Smart Investment Analytics!
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Create your first portfolio to get started
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setOpenPortfolioDialog(true)}
          >
            Create Portfolio
          </Button>
        </Paper>
      ) : null}

      {/* Floating Action Button */}
      {selectedPortfolio && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => setOpenHoldingDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Create Portfolio Dialog */}
      <Dialog
        open={openPortfolioDialog}
        onClose={() => setOpenPortfolioDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Portfolio</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Portfolio Name"
            fullWidth
            variant="outlined"
            value={newPortfolio.name}
            onChange={(e) =>
              setNewPortfolio({ ...newPortfolio, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newPortfolio.description}
            onChange={(e) =>
              setNewPortfolio({ ...newPortfolio, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPortfolioDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreatePortfolio}
            variant="contained"
            disabled={!newPortfolio.name}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Holding Dialog */}
      <Dialog
        open={openHoldingDialog}
        onClose={() => setOpenHoldingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Holding</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Symbol (e.g., AAPL)"
            fullWidth
            variant="outlined"
            value={newHolding.symbol}
            onChange={(e) =>
              setNewHolding({
                ...newHolding,
                symbol: e.target.value.toUpperCase(),
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Company Name"
            fullWidth
            variant="outlined"
            value={newHolding.company_name}
            onChange={(e) =>
              setNewHolding({ ...newHolding, company_name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Number of Shares"
            fullWidth
            variant="outlined"
            type="number"
            value={newHolding.shares}
            onChange={(e) =>
              setNewHolding({ ...newHolding, shares: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Average Purchase Price ($)"
            fullWidth
            variant="outlined"
            type="number"
            value={newHolding.average_price}
            onChange={(e) =>
              setNewHolding({ ...newHolding, average_price: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHoldingDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddHolding}
            variant="contained"
            disabled={
              !newHolding.symbol ||
              !newHolding.shares ||
              !newHolding.average_price
            }
          >
            Add Holding
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
