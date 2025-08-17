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
  Chip,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  TrendingUp,
  TrendingDown,
  ShowChart,
  Assessment,
  Psychology,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2"; // Removed Candlestick
import { stockAPI } from "../services/api";
import toast from "react-hot-toast";

const StockAnalysis = () => {
  const { symbol } = useParams();
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, [symbol]);

  const loadStockData = async () => {
    setLoading(true);
    try {
      const [priceResponse, historicalResponse, predictionResponse] =
        await Promise.all([
          stockAPI.getPrice(symbol),
          stockAPI.getHistorical(symbol, 90),
          stockAPI.getPrediction(symbol),
        ]);

      setStockData(priceResponse.data);
      if (historicalResponse.data && historicalResponse.data.data) {
        setHistoricalData(historicalResponse.data.data);
      }
      setPrediction(predictionResponse.data);
    } catch (error) {
      toast.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  // Price chart data
  const priceChartData = {
    labels: historicalData
      .slice(-30)
      .map((d) => new Date(d["1. timestamp"]).toLocaleDateString()),
    datasets: [
      {
        label: "Close Price",
        data: historicalData.slice(-30).map((d) => parseFloat(d["4. close"])),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Volume (scaled)",
        data: historicalData
          .slice(-30)
          .map((d) => parseFloat(d["5. volume"]) / 1000000),
        borderColor: "rgba(255, 99, 132, 0.5)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        type: "bar",
        yAxisID: "y1",
      },
    ],
  };

  // Technical indicators
  const calculateSMA = (data, period) => {
    const prices = data.map((d) => parseFloat(d["4. close"]));
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices
        .slice(i - period + 1, i + 1)
        .reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateRSI = (data, period = 14) => {
    const prices = data.map((d) => parseFloat(d["4. close"]));
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 0; i < period; i++) {
      if (changes[i] > 0) avgGain += changes[i];
      else avgLoss += Math.abs(changes[i]);
    }
    avgGain /= period;
    avgLoss /= period;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    return rsi;
  };

  const sma20 = calculateSMA(historicalData, 20);
  const sma50 = calculateSMA(historicalData, 50);
  const rsi = calculateRSI(historicalData);
  const currentPrice = stockData?.price || 0;

  // Technical analysis chart
  const technicalChartData = {
    labels: historicalData
      .slice(-30)
      .map((d) => new Date(d["1. timestamp"]).toLocaleDateString()),
    datasets: [
      {
        label: "Price",
        data: historicalData.slice(-30).map((d) => parseFloat(d["4. close"])),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.4,
      },
      {
        label: "SMA 20",
        data: sma20.slice(-30),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "transparent",
        borderDash: [5, 5],
      },
      {
        label: "SMA 50",
        data: sma50.slice(-30),
        borderColor: "rgb(255, 206, 86)",
        backgroundColor: "transparent",
        borderDash: [10, 5],
      },
    ],
  };

  if (loading) {
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
        <CircularProgress />
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
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4">{symbol}</Typography>
          <Typography variant="h6" color="textSecondary">
            Stock Analysis & Predictions
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h4">${currentPrice.toFixed(2)}</Typography>
          <Chip
            icon={
              parseFloat(stockData?.change || 0) >= 0 ? (
                <TrendingUp />
              ) : (
                <TrendingDown />
              )
            }
            label={`${stockData?.change_percent || 0}%`}
            color={
              parseFloat(stockData?.change || 0) >= 0 ? "success" : "error"
            }
          />
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
        >
          <Tab icon={<ShowChart />} label="Price Chart" />
          <Tab icon={<Assessment />} label="Technical Analysis" />
          <Tab icon={<Psychology />} label="AI Predictions" />
          <Tab label="Key Statistics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Price & Volume (Last 30 Days)
              </Typography>
              <Box sx={{ height: 400 }}>
                {historicalData.length > 0 && (
                  <Line
                    data={priceChartData}
                    options={{
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          type: "linear",
                          display: true,
                          position: "left",
                        },
                        y1: {
                          type: "linear",
                          display: true,
                          position: "right",
                          grid: {
                            drawOnChartArea: false,
                          },
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Statistics
                </Typography>
                {historicalData.length > 0 && (
                  <Box>
                    <Typography variant="body1">
                      <strong>Open:</strong> $
                      {parseFloat(
                        historicalData[historicalData.length - 1]["1. open"]
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>High:</strong> $
                      {parseFloat(
                        historicalData[historicalData.length - 1]["2. high"]
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Low:</strong> $
                      {parseFloat(
                        historicalData[historicalData.length - 1]["3. low"]
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Volume:</strong>{" "}
                      {parseInt(
                        historicalData[historicalData.length - 1]["5. volume"]
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Price Range (30 Days)
                </Typography>
                {historicalData.length > 0 && (
                  <Box>
                    <Typography variant="body1">
                      <strong>Highest:</strong> $
                      {Math.max(
                        ...historicalData
                          .slice(-30)
                          .map((d) => parseFloat(d["2. high"]))
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Lowest:</strong> $
                      {Math.min(
                        ...historicalData
                          .slice(-30)
                          .map((d) => parseFloat(d["3. low"]))
                      ).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Average Volume:</strong>{" "}
                      {Math.round(
                        historicalData
                          .slice(-30)
                          .reduce(
                            (sum, d) => sum + parseInt(d["5. volume"]),
                            0
                          ) / 30
                      ).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Technical Indicators
              </Typography>
              <Box sx={{ height: 400 }}>
                {historicalData.length > 0 && (
                  <Line
                    data={technicalChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          mode: "index",
                          intersect: false,
                        },
                      },
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Moving Averages
                </Typography>
                <Typography variant="body1">
                  <strong>SMA 20:</strong> $
                  {sma20.length > 0
                    ? sma20[sma20.length - 1].toFixed(2)
                    : "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>SMA 50:</strong> $
                  {sma50.length > 0
                    ? sma50[sma50.length - 1].toFixed(2)
                    : "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Trend:</strong>{" "}
                  {currentPrice > (sma20[sma20.length - 1] || 0)
                    ? "Bullish"
                    : "Bearish"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  RSI (14)
                </Typography>
                <Typography
                  variant="h4"
                  color={
                    rsi > 70
                      ? "error.main"
                      : rsi < 30
                      ? "success.main"
                      : "text.primary"
                  }
                >
                  {rsi.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {rsi > 70 ? "Overbought" : rsi < 30 ? "Oversold" : "Neutral"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Support & Resistance
                </Typography>
                <Typography variant="body1">
                  <strong>Support:</strong> $
                  {Math.min(
                    ...historicalData
                      .slice(-20)
                      .map((d) => parseFloat(d["3. low"]))
                  ).toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  <strong>Resistance:</strong> $
                  {Math.max(
                    ...historicalData
                      .slice(-20)
                      .map((d) => parseFloat(d["2. high"]))
                  ).toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {tabValue === 2 && (
        <Grid container spacing={3}>
          {prediction && !prediction.error ? (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: "primary.main", color: "white" }}>
                  <CardContent>
                    <Typography variant="h6" color="inherit" gutterBottom>
                      AI Price Prediction
                    </Typography>
                    <Typography variant="h3" color="inherit">
                      ${prediction.predicted_price}
                    </Typography>
                    <Chip
                      icon={
                        prediction.change_percent >= 0 ? (
                          <TrendingUp />
                        ) : (
                          <TrendingDown />
                        )
                      }
                      label={`${prediction.change_percent >= 0 ? "+" : ""}${
                        prediction.change_percent
                      }%`}
                      sx={{
                        bgcolor:
                          prediction.change_percent >= 0
                            ? "success.main"
                            : "error.main",
                        color: "white",
                        mt: 1,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Prediction Details
                    </Typography>
                    <Typography variant="body1">
                      <strong>Current Price:</strong> $
                      {prediction.current_price}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Predicted Price:</strong> $
                      {prediction.predicted_price}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Expected Change:</strong>{" "}
                      {prediction.change_percent >= 0 ? "+" : ""}
                      {prediction.change_percent}%
                    </Typography>
                    <Typography variant="body1">
                      <strong>Confidence:</strong>{" "}
                      {prediction.confidence || "Medium"}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Time Horizon:</strong>{" "}
                      {prediction.prediction_for_days || 1} day(s)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info">
                  <strong>Disclaimer:</strong> These predictions are based on
                  machine learning models and historical data. They should not
                  be considered as financial advice. Always do your own research
                  and consider consulting with a financial advisor before making
                  investment decisions.
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Model Insights
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Our AI model analyzes various technical indicators including
                    moving averages, RSI, volume patterns, and historical price
                    movements to generate predictions. The model uses a Random
                    Forest algorithm trained on historical market data.
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Factors considered: 5-day MA, 10-day MA, 20-day MA, RSI,
                    Bollinger Bands, Volume ratios, High-Low ratios, and Price
                    momentum indicators.
                  </Typography>
                </Paper>
              </Grid>
            </>
          ) : (
            <Grid item xs={12}>
              <Alert severity="warning">
                {prediction?.error ||
                  "Unable to generate predictions for this stock. This may be due to insufficient historical data or API limitations."}
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Metric</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Current Price</TableCell>
                    <TableCell align="right">
                      ${currentPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Daily Change</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color:
                          parseFloat(stockData?.change || 0) >= 0
                            ? "success.main"
                            : "error.main",
                      }}
                    >
                      {stockData?.change_percent || 0}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>52-Week High</TableCell>
                    <TableCell align="right">
                      $
                      {historicalData.length > 0
                        ? Math.max(
                            ...historicalData.map((d) =>
                              parseFloat(d["2. high"])
                            )
                          ).toFixed(2)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>52-Week Low</TableCell>
                    <TableCell align="right">
                      $
                      {historicalData.length > 0
                        ? Math.min(
                            ...historicalData.map((d) =>
                              parseFloat(d["3. low"])
                            )
                          ).toFixed(2)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Average Volume (30d)</TableCell>
                    <TableCell align="right">
                      {historicalData.length > 0
                        ? Math.round(
                            historicalData
                              .slice(-30)
                              .reduce(
                                (sum, d) => sum + parseInt(d["5. volume"]),
                                0
                              ) / 30
                          ).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Analysis
              </Typography>
              <Alert
                severity={
                  currentPrice > (sma20[sma20.length - 1] || 0)
                    ? "success"
                    : "error"
                }
                sx={{ mb: 2 }}
              >
                <strong>Trend:</strong>{" "}
                {currentPrice > (sma20[sma20.length - 1] || 0)
                  ? "Bullish - Price above 20-day MA"
                  : "Bearish - Price below 20-day MA"}
              </Alert>
              <Alert
                severity={rsi > 70 ? "warning" : rsi < 30 ? "info" : "success"}
                sx={{ mb: 2 }}
              >
                <strong>Momentum:</strong>{" "}
                {rsi > 70
                  ? "Overbought conditions"
                  : rsi < 30
                  ? "Oversold conditions"
                  : "Neutral momentum"}
              </Alert>
              {prediction && !prediction.error && (
                <Alert
                  severity={
                    prediction.change_percent >= 0 ? "success" : "error"
                  }
                >
                  <strong>AI Outlook:</strong>{" "}
                  {prediction.change_percent >= 0 ? "Positive" : "Negative"}{" "}
                  prediction for next trading session
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default StockAnalysis;
