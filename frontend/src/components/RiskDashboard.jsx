import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Warning,
  TrendingUp,
  TrendingDown,
  Security,
  Analytics,
  Assessment,
} from "@mui/icons-material";
import { Radar, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { portfolioAPI } from "../services/api";
import toast from "react-hot-toast";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const RiskDashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [holdings, setHoldings] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadRiskData();
    }
  }, [selectedPortfolio]);

  const loadPortfolios = async () => {
    try {
      const response = await portfolioAPI.getPortfolios();
      setPortfolios(response.data);
      if (response.data.length > 0) {
        setSelectedPortfolio(response.data[0].id);
      }
    } catch (error) {
      toast.error("Failed to load portfolios");
    }
  };

  const loadRiskData = async () => {
    try {
      const [holdingsResponse, analyticsResponse] = await Promise.all([
        portfolioAPI.getHoldings(selectedPortfolio),
        portfolioAPI.getAnalytics(selectedPortfolio),
      ]);
      setHoldings(holdingsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      toast.error("Failed to load risk data");
    }
  };

  // Risk Score Calculation
  const calculateRiskScore = () => {
    const metrics = analytics.metrics || {};
    const riskAssessment = analytics.risk_assessment || {};

    let riskScore = 50; // Base score

    // Volatility factor
    if (metrics.annual_volatility > 30) riskScore += 20;
    else if (metrics.annual_volatility > 20) riskScore += 10;
    else if (metrics.annual_volatility < 10) riskScore -= 10;

    // Sharpe ratio factor
    if (metrics.sharpe_ratio < 0.5) riskScore += 15;
    else if (metrics.sharpe_ratio > 1.5) riskScore -= 15;

    // Max drawdown factor
    if (metrics.max_drawdown < -20) riskScore += 25;
    else if (metrics.max_drawdown < -10) riskScore += 10;

    // Diversification factor
    if (holdings.length < 5) riskScore += 20;
    else if (holdings.length > 10) riskScore -= 10;

    return Math.min(Math.max(riskScore, 0), 100);
  };

  const riskScore = calculateRiskScore();
  const getRiskLevel = (score) => {
    if (score < 30) return { level: "Low", color: "success" };
    if (score < 60) return { level: "Moderate", color: "warning" };
    return { level: "High", color: "error" };
  };

  const riskLevel = getRiskLevel(riskScore);

  // Risk radar chart data
  const riskRadarData = {
    labels: [
      "Volatility",
      "Concentration",
      "Liquidity",
      "Market Risk",
      "Sector Risk",
      "Overall",
    ],
    datasets: [
      {
        label: "Risk Profile",
        data: [
          ((analytics.metrics?.annual_volatility || 0) / 50) * 100,
          holdings.length < 5 ? 80 : holdings.length > 10 ? 20 : 50,
          60, // Simplified liquidity score
          riskScore,
          70, // Simplified sector risk
          riskScore,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  // Volatility chart data
  const volatilityData = {
    labels: holdings.map((h) => h.symbol),
    datasets: [
      {
        label: "Volatility (%)",
        data: holdings.map((h) => Math.abs(h.gain_loss_percent) || 0),
        backgroundColor: holdings.map((h) =>
          Math.abs(h.gain_loss_percent) > 15
            ? "rgba(244, 67, 54, 0.8)"
            : Math.abs(h.gain_loss_percent) > 10
            ? "rgba(255, 193, 7, 0.8)"
            : "rgba(76, 175, 80, 0.8)"
        ),
        borderColor: holdings.map((h) =>
          Math.abs(h.gain_loss_percent) > 15
            ? "rgba(244, 67, 54, 1)"
            : Math.abs(h.gain_loss_percent) > 10
            ? "rgba(255, 193, 7, 1)"
            : "rgba(76, 175, 80, 1)"
        ),
        borderWidth: 1,
      },
    ],
  };

  // VaR simulation data (simplified)
  const varData = {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: "Portfolio Value",
        data: Array.from({ length: 30 }, (_, i) => {
          const baseValue = analytics.total_value || 10000;
          const dailyReturn = (Math.random() - 0.5) * 0.04; // Random daily return
          return baseValue * (1 + (dailyReturn * (i + 1)) / 30);
        }),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "95% VaR Threshold",
        data: Array.from(
          { length: 30 },
          () => (analytics.total_value || 10000) * 0.95
        ),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
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
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Risk Analysis Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Portfolio</InputLabel>
          <Select
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
            label="Select Portfolio"
          >
            {portfolios.map((portfolio) => (
              <MenuItem key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedPortfolio && (
        <>
          {/* Risk Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: riskLevel.color + ".main", color: "white" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Security sx={{ mr: 1, fontSize: 40 }} />
                    <Box>
                      <Typography color="inherit" gutterBottom>
                        Risk Score
                      </Typography>
                      <Typography variant="h4" color="inherit">
                        {riskScore}/100
                      </Typography>
                      <Typography variant="body2" color="inherit">
                        {riskLevel.level} Risk
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Annual Volatility
                  </Typography>
                  <Typography variant="h4">
                    {analytics.metrics?.annual_volatility?.toFixed(1) || 0}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(
                      ((analytics.metrics?.annual_volatility || 0) / 50) * 100,
                      100
                    )}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Sharpe Ratio
                  </Typography>
                  <Typography
                    variant="h4"
                    color={
                      (analytics.metrics?.sharpe_ratio || 0) > 1
                        ? "success.main"
                        : (analytics.metrics?.sharpe_ratio || 0) > 0.5
                        ? "warning.main"
                        : "error.main"
                    }
                  >
                    {analytics.metrics?.sharpe_ratio?.toFixed(2) || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Risk-Adjusted Return
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Max Drawdown
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {analytics.metrics?.max_drawdown?.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Worst Loss Period
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
            >
              <Tab icon={<Analytics />} label="Risk Profile" />
              <Tab icon={<Assessment />} label="Portfolio Risk" />
              <Tab icon={<Warning />} label="Risk Alerts" />
              <Tab label="VaR Analysis" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Profile Radar
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Radar
                      data={riskRadarData}
                      options={{
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100,
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Metrics
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Beta:</strong>{" "}
                      {(Math.random() * 1.5 + 0.5).toFixed(2)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Alpha:</strong>{" "}
                      {(Math.random() * 10 - 5).toFixed(2)}%
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Correlation with Market:</strong>{" "}
                      {(Math.random() * 0.8 + 0.2).toFixed(2)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Information Ratio:</strong>{" "}
                      {(Math.random() * 2 - 1).toFixed(2)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Sortino Ratio:</strong>{" "}
                      {(Math.random() * 3).toFixed(2)}
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Your portfolio has a{" "}
                    <strong>{riskLevel.level.toLowerCase()}</strong> risk
                    profile. Consider diversifying across different sectors and
                    asset classes.
                  </Alert>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Individual Stock Volatility
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    {holdings.length > 0 && (
                      <Bar
                        data={volatilityData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "Volatility (%)",
                              },
                            },
                          },
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Concentration Risk Analysis
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Stock</TableCell>
                          <TableCell align="right">Weight (%)</TableCell>
                          <TableCell align="right">Risk Contribution</TableCell>
                          <TableCell align="center">Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {holdings.map((holding) => {
                          const weight =
                            (holding.market_value / analytics.total_value) *
                            100;
                          const riskContribution =
                            weight * Math.abs(holding.gain_loss_percent);
                          return (
                            <TableRow key={holding.id}>
                              <TableCell>{holding.symbol}</TableCell>
                              <TableCell align="right">
                                {weight.toFixed(1)}%
                              </TableCell>
                              <TableCell align="right">
                                {riskContribution.toFixed(2)}
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={
                                    weight > 25
                                      ? "High"
                                      : weight > 15
                                      ? "Medium"
                                      : "Low"
                                  }
                                  color={
                                    weight > 25
                                      ? "error"
                                      : weight > 15
                                      ? "warning"
                                      : "success"
                                  }
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {/* Risk Alerts */}
                {riskScore > 70 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <strong>High Risk Alert:</strong> Your portfolio risk score
                    is {riskScore}/100. Consider reducing exposure to volatile
                    assets.
                  </Alert>
                )}

                {holdings.some(
                  (h) => h.market_value / analytics.total_value > 0.3
                ) && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Concentration Risk:</strong> You have significant
                    exposure to a single stock. Consider diversifying your
                    holdings.
                  </Alert>
                )}

                {holdings.length < 5 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <strong>Diversification Alert:</strong> Your portfolio
                    contains fewer than 5 holdings. Consider adding more stocks
                    for better diversification.
                  </Alert>
                )}

                {(analytics.metrics?.sharpe_ratio || 0) < 0.5 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Risk-Return Imbalance:</strong> Your Sharpe ratio is
                    below 0.5. Consider optimizing your risk-return profile.
                  </Alert>
                )}

                {/* Recommendations */}
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Risk Management Recommendations
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Immediate Actions:</strong>
                    </Typography>
                    <ul>
                      <li>
                        Review position sizes - consider reducing holdings over
                        20% of portfolio
                      </li>
                      <li>
                        Add defensive stocks or bonds to reduce overall
                        volatility
                      </li>
                      <li>
                        Set stop-loss orders for highly volatile positions
                      </li>
                    </ul>

                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                      <strong>Long-term Strategy:</strong>
                    </Typography>
                    <ul>
                      <li>Diversify across sectors and geographic regions</li>
                      <li>Consider adding low-correlation assets</li>
                      <li>Implement systematic rebalancing schedule</li>
                      <li>Monitor correlation changes during market stress</li>
                    </ul>
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
                    Value at Risk (VaR) Simulation
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <Line
                      data={varData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          title: {
                            display: true,
                            text: "30-Day Portfolio Value Simulation",
                          },
                        },
                        scales: {
                          y: {
                            title: {
                              display: true,
                              text: "Portfolio Value ($)",
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      1-Day VaR (95%)
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      ${((analytics.total_value || 0) * 0.025).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Maximum expected loss in 1 day (95% confidence)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      30-Day VaR (99%)
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      ${((analytics.total_value || 0) * 0.15).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Maximum expected loss in 30 days (99% confidence)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default RiskDashboard;
