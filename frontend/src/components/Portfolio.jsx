import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { ArrowBack, Add, TrendingUp, TrendingDown } from "@mui/icons-material";
import { Line, Bar } from "react-chartjs-2";
import { portfolioAPI, stockAPI } from "../services/api";
import toast from "react-hot-toast";

const Portfolio = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [historicalData, setHistoricalData] = useState({});

  const [newTransaction, setNewTransaction] = useState({
    symbol: "",
    transaction_type: "BUY",
    shares: "",
    price: "",
  });

  useEffect(() => {
    loadPortfolioData();
  }, [id]);

  useEffect(() => {
    if (holdings.length > 0) {
      loadHistoricalData();
    }
  }, [holdings]);

  const loadPortfolioData = async () => {
    try {
      const [portfoliosResponse, holdingsResponse, analyticsResponse] =
        await Promise.all([
          portfolioAPI.getPortfolios(),
          portfolioAPI.getHoldings(id),
          portfolioAPI.getAnalytics(id),
        ]);

      const currentPortfolio = portfoliosResponse.data.find(
        (p) => p.id === parseInt(id)
      );
      setPortfolio(currentPortfolio);
      setHoldings(holdingsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      toast.error("Failed to load portfolio data");
    }
  };

  const loadHistoricalData = async () => {
    const data = {};
    for (const holding of holdings.slice(0, 5)) {
      // Limit to avoid API rate limits
      try {
        const response = await stockAPI.getHistorical(holding.symbol, 30);
        if (response.data && response.data.data) {
          data[holding.symbol] = response.data.data;
        }
      } catch (error) {
        console.error(`Failed to load historical data for ${holding.symbol}`);
      }
    }
    setHistoricalData(data);
  };

  const handleAddTransaction = async () => {
    try {
      await portfolioAPI.addTransaction(id, {
        ...newTransaction,
        shares: parseFloat(newTransaction.shares),
        price: parseFloat(newTransaction.price),
      });
      setOpenTransactionDialog(false);
      setNewTransaction({
        symbol: "",
        transaction_type: "BUY",
        shares: "",
        price: "",
      });
      loadPortfolioData();
      toast.success("Transaction added successfully!");
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  // Chart data for individual stock performance
  const stockPerformanceData = {
    labels:
      Object.keys(historicalData).length > 0
        ? Object.values(historicalData)[0]
            ?.slice(-7)
            .map((d) => new Date(d["1. timestamp"]).toLocaleDateString()) || []
        : [],
    datasets: Object.entries(historicalData)
      .slice(0, 3)
      .map(([symbol, data], index) => ({
        label: symbol,
        data: data?.slice(-7).map((d) => parseFloat(d["4. close"])) || [],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56"][index],
        backgroundColor: [
          "rgba(255, 99, 132, 0.1)",
          "rgba(54, 162, 235, 0.1)",
          "rgba(255, 206, 86, 0.1)",
        ][index],
        tension: 0.4,
        fill: false,
      })),
  };

  // Risk metrics chart
  const riskData = {
    labels: holdings.map((h) => h.symbol),
    datasets: [
      {
        label: "Volatility %",
        data: holdings.map((h) => Math.abs(h.gain_loss_percent)),
        backgroundColor: holdings.map((h) =>
          h.gain_loss_percent >= 0
            ? "rgba(76, 175, 80, 0.8)"
            : "rgba(244, 67, 54, 0.8)"
        ),
      },
    ],
  };

  if (!portfolio) {
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
        <Typography>Loading...</Typography>
      </Container>
    );
  }

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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <Button
          component={Link}
          to="/dashboard"
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Back to Dashboard
        </Button>
        <Box>
          <Typography variant="h4">{portfolio.name}</Typography>
          <Typography variant="body1" color="textSecondary">
            {portfolio.description || "No description provided"}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab label="Overview" />
          <Tab label="Performance" />
          <Tab label="Risk Analysis" />
          <Tab label="Holdings Details" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Value
                    </Typography>
                    <Typography variant="h4">
                      ${analytics.total_value?.toLocaleString() || "0"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Gain/Loss
                    </Typography>
                    <Typography
                      variant="h4"
                      color={
                        analytics.total_gain_loss >= 0
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      ${analytics.total_gain_loss?.toLocaleString() || "0"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Number of Holdings
                    </Typography>
                    <Typography variant="h4">{holdings.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Diversification
                    </Typography>
                    <Typography variant="h4">
                      {analytics.risk_assessment?.diversification_score || 0}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenTransactionDialog(true)}
                >
                  Add Transaction
                </Button>
                <Button variant="outlined" component={Link} to="/transactions">
                  View All Transactions
                </Button>
                <Button variant="outlined" component={Link} to="/risk">
                  Detailed Risk Analysis
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* AI Recommendations */}
          {analytics.recommendations &&
            analytics.recommendations.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
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
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stock Performance (Last 7 Days)
              </Typography>
              <Box sx={{ height: 400 }}>
                {Object.keys(historicalData).length > 0 && (
                  <Line
                    data={stockPerformanceData}
                    options={{ maintainAspectRatio: false }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Volatility by Holding
              </Typography>
              <Box sx={{ height: 300 }}>
                {holdings.length > 0 && (
                  <Bar
                    data={riskData}
                    options={{ maintainAspectRatio: false }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Risk Metrics
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                  <strong>Annual Return:</strong>{" "}
                  {analytics.metrics?.annual_return || 0}%
                </Typography>
                <Typography variant="body1">
                  <strong>Volatility:</strong>{" "}
                  {analytics.metrics?.annual_volatility || 0}%
                </Typography>
                <Typography variant="body1">
                  <strong>Sharpe Ratio:</strong>{" "}
                  {analytics.metrics?.sharpe_ratio || 0}
                </Typography>
                <Typography variant="body1">
                  <strong>Max Drawdown:</strong>{" "}
                  {analytics.metrics?.max_drawdown || 0}%
                </Typography>
                <Typography variant="body1">
                  <strong>Risk Level:</strong>{" "}
                  {analytics.risk_assessment?.volatility_level || "Unknown"}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Holdings
              </Typography>
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
                      <TableCell align="right">Weight</TableCell>
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
                          ${holding.market_value.toLocaleString()}
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
                          {(
                            (holding.market_value / analytics.total_value) *
                            100
                          ).toFixed(1)}
                          %
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setNewTransaction({
                                ...newTransaction,
                                symbol: holding.symbol,
                              });
                              setOpenTransactionDialog(true);
                            }}
                          >
                            Trade
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Add Transaction Dialog */}
      <Dialog
        open={openTransactionDialog}
        onClose={() => setOpenTransactionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={newTransaction.transaction_type}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  transaction_type: e.target.value,
                })
              }
              label="Transaction Type"
            >
              <MenuItem value="BUY">BUY</MenuItem>
              <MenuItem value="SELL">SELL</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Stock Symbol"
            fullWidth
            variant="outlined"
            value={newTransaction.symbol}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                symbol: e.target.value.toUpperCase(),
              })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Number of Shares"
            fullWidth
            variant="outlined"
            type="number"
            value={newTransaction.shares}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, shares: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Price per Share ($)"
            fullWidth
            variant="outlined"
            type="number"
            value={newTransaction.price}
            onChange={(e) =>
              setNewTransaction({ ...newTransaction, price: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransactionDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddTransaction}
            variant="contained"
            disabled={
              !newTransaction.symbol ||
              !newTransaction.shares ||
              !newTransaction.price
            }
          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Portfolio;
