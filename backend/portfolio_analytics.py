import requests
import os
import pandas as pd
import numpy as np
from typing import Dict, List
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

class PortfolioAnalytics:
    def __init__(self):
        self.api_key = ALPHA_VANTAGE_API_KEY
        
    def get_stock_price(self, symbol: str) -> Dict:
        """Get current stock price from Alpha Vantage"""
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "GLOBAL_QUOTE",
            "symbol": symbol,
            "apikey": self.api_key
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if "Global Quote" in data:
                quote = data["Global Quote"]
                return {
                    "symbol": quote.get("01. symbol", symbol),
                    "price": float(quote.get("05. price", 0)),
                    "change": float(quote.get("09. change", 0)),
                    "change_percent": quote.get("10. change percent", "0%").replace("%", "")
                }
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
            
        return {"symbol": symbol, "price": 0, "change": 0, "change_percent": "0"}
    
    def get_historical_data(self, symbol: str, days: int = 30) -> pd.DataFrame:
        """Get historical stock data"""
        url = f"https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "apikey": self.api_key,
            "outputsize": "compact"
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            if "Time Series (Daily)" in data:
                time_series = data["Time Series (Daily)"]
                df = pd.DataFrame.from_dict(time_series, orient='index')
                df.columns = ['open', 'high', 'low', 'close', 'volume']
                df.index = pd.to_datetime(df.index)
                df = df.astype(float)
                df = df.sort_index()
                return df.tail(days)
        except Exception as e:
            print(f"Error fetching historical data for {symbol}: {e}")
            
        return pd.DataFrame()
    
    def calculate_portfolio_metrics(self, holdings: List[Dict]) -> Dict:
        """Calculate portfolio risk and return metrics"""
        if not holdings:
            return {}
            
        symbols = [h['symbol'] for h in holdings]
        weights = [h['market_value'] for h in holdings]
        total_value = sum(weights)
        weights = [w/total_value for w in weights]
        
        # Get historical data for all holdings
        returns_data = {}
        for symbol in symbols:
            hist_data = self.get_historical_data(symbol, 252)  # 1 year of data
            if not hist_data.empty:
                returns = hist_data['close'].pct_change().dropna()
                returns_data[symbol] = returns
        
        if not returns_data:
            return {}
        
        # Convert to DataFrame
        returns_df = pd.DataFrame(returns_data)
        returns_df = returns_df.dropna()
        
        if returns_df.empty:
            return {}
        
        # Calculate portfolio returns
        portfolio_returns = (returns_df * weights).sum(axis=1)
        
        # Calculate metrics
        annual_return = portfolio_returns.mean() * 252
        annual_volatility = portfolio_returns.std() * np.sqrt(252)
        sharpe_ratio = annual_return / annual_volatility if annual_volatility != 0 else 0
        
        # Calculate maximum drawdown
        cumulative = (1 + portfolio_returns).cumprod()
        running_max = cumulative.expanding().max()
        drawdown = (cumulative - running_max) / running_max
        max_drawdown = drawdown.min()
        
        return {
            "annual_return": round(annual_return * 100, 2),
            "annual_volatility": round(annual_volatility * 100, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
            "max_drawdown": round(max_drawdown * 100, 2),
            "total_return": round(portfolio_returns.sum() * 100, 2)
        }
    
    def generate_recommendations(self, holdings: List[Dict]) -> List[str]:
        """Generate portfolio recommendations based on analysis"""
        recommendations = []
        
        if not holdings:
            return ["Start by adding some stocks to your portfolio"]
        
        # Diversification analysis
        if len(holdings) < 5:
            recommendations.append("Consider diversifying with more holdings (5-10 stocks recommended)")
        
        # Concentration risk
        total_value = sum(h['market_value'] for h in holdings)
        for holding in holdings:
            weight = holding['market_value'] / total_value
            if weight > 0.3:
                recommendations.append(f"Consider reducing exposure to {holding['symbol']} (currently {weight:.1%} of portfolio)")
        
        # Performance analysis
        losing_stocks = [h for h in holdings if h['gain_loss'] < 0]
        if len(losing_stocks) > len(holdings) * 0.6:
            recommendations.append("Consider reviewing your stock selection - majority of holdings are underperforming")
        
        return recommendations
