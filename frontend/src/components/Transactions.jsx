import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  TrendingUp,
  TrendingDown,
  FilterList,
  Download,
  Refresh,
} from "@mui/icons-material";
import { Line } from "react-chartjs-2";
import { portfolioAPI } from "../services/api";
import toast from "react-hot-toast";

const Transactions = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState("30");

  const [newTransaction, setNewTransaction] = useState({
    portfolio_id: "",
    symbol: "",
    transaction_type: "BUY",
    shares: "",
    price: "",
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  useEffect(() => {
    if (selectedPortfolio) {
      loadTransactions();
    }
  }, [selectedPortfolio, filter, dateRange]);

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

  const loadTransactions = async () => {
    // Note: This would need a new API endpoint for fetching transactions
    // For now, we'll simulate some data
    const sampleTransactions = [
      {
        id: 1,
        symbol: "AAPL",
        transaction_type: "BUY",
        shares: 10,
        price: 150.0,
        total_amount: 1500.0,
        transaction_date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 2,
        symbol: "MSFT",
        transaction_type: "BUY",
        shares: 5,
        price: 300.0,
        total_amount: 1500.0,
        transaction_date: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: 3,
        symbol: "AAPL",
        transaction_type: "SELL",
        shares: 2,
        price: 155.0,
        total_amount: 310.0,
        transaction_date: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
    setTransactions(sampleTransactions);
  };

  const handleAddTransaction = async () => {
    try {
      await portfolioAPI.addTransaction(selectedPortfolio, {
        ...newTransaction,
        shares: parseFloat(newTransaction.shares),
        price: parseFloat(newTransaction.price),
      });
      setOpenDialog(false);
      setNewTransaction({
        portfolio_id: "",
        symbol: "",
        transaction_type: "BUY",
        shares: "",
        price: "",
      });
      loadTransactions();
      toast.success("Transaction added successfully!");
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "ALL") return true;
    return transaction.transaction_type === filter;
  });

  // Transaction volume chart
  const transactionChartData = {
    labels: transactions
      .slice(-10)
      .map((t) => new Date(t.transaction_date).toLocaleDateString()),
    datasets: [
      {
        label: "Transaction Amount ($)",
        data: transactions.slice(-10).map((t) => t.total_amount),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Summary statistics
  const totalBuyAmount = transactions
    .filter((t) => t.transaction_type === "BUY")
    .reduce((sum, t) => sum + t.total_amount, 0);

  const totalSellAmount = transactions
    .filter((t) => t.transaction_type === "SELL")
    .reduce((sum, t) => sum + t.total_amount, 0);

  const netAmount = totalBuyAmount - totalSellAmount;

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
          Transaction Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: "success.main", color: "white" }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Total Bought
              </Typography>
              <Typography variant="h4" color="inherit">
                ${totalBuyAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="inherit">
                {
                  transactions.filter((t) => t.transaction_type === "BUY")
                    .length
                }{" "}
                transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: "error.main", color: "white" }}>
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Total Sold
              </Typography>
              <Typography variant="h4" color="inherit">
                ${totalSellAmount.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="inherit">
                {
                  transactions.filter((t) => t.transaction_type === "SELL")
                    .length
                }{" "}
                transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card
            sx={{
              bgcolor: netAmount >= 0 ? "warning.main" : "info.main",
              color: "white",
            }}
          >
            <CardContent>
              <Typography color="inherit" gutterBottom>
                Net Investment
              </Typography>
              <Typography variant="h4" color="inherit">
                ${Math.abs(netAmount).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="inherit">
                {netAmount >= 0 ? "Net buying" : "Net selling"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h4">{transactions.length}</Typography>
              <Typography variant="body2" color="textSecondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transaction Volume Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Transaction Volume Over Time
            </Typography>
            <Box sx={{ height: 300 }}>
              {transactions.length > 0 && (
                <Line
                  data={transactionChartData}
                  options={{ maintainAspectRatio: false }}
                />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Portfolio</InputLabel>
              <Select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                label="Portfolio"
              >
                {portfolios.map((portfolio) => (
                  <MenuItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                label="Transaction Type"
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value="BUY">Buy Only</MenuItem>
                <MenuItem value="SELL">Sell Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="7">Last 7 days</MenuItem>
                <MenuItem value="30">Last 30 days</MenuItem>
                <MenuItem value="90">Last 3 months</MenuItem>
                <MenuItem value="365">Last year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton onClick={loadTransactions}>
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export">
                <IconButton>
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Transaction History ({filteredTransactions.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Shares</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total Amount</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(
                      transaction.transaction_date
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {transaction.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        transaction.transaction_type === "BUY" ? (
                          <TrendingUp />
                        ) : (
                          <TrendingDown />
                        )
                      }
                      label={transaction.transaction_type}
                      color={
                        transaction.transaction_type === "BUY"
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{transaction.shares}</TableCell>
                  <TableCell align="right">
                    ${transaction.price.toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={
                        transaction.transaction_type === "BUY"
                          ? "error.main"
                          : "success.main"
                      }
                      fontWeight="bold"
                    >
                      {transaction.transaction_type === "BUY" ? "-" : "+"}$
                      {transaction.total_amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip label="Completed" color="success" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Transaction Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Portfolio</InputLabel>
            <Select
              value={newTransaction.portfolio_id || selectedPortfolio}
              onChange={(e) =>
                setNewTransaction({
                  ...newTransaction,
                  portfolio_id: e.target.value,
                })
              }
              label="Portfolio"
            >
              {portfolios.map((portfolio) => (
                <MenuItem key={portfolio.id} value={portfolio.id}>
                  {portfolio.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          {newTransaction.shares && newTransaction.price && (
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total: $
              {(
                parseFloat(newTransaction.shares) *
                parseFloat(newTransaction.price)
              ).toFixed(2)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
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

export default Transactions;
