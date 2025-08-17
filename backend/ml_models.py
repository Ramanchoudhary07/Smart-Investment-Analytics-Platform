import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
from typing import Dict, List, Tuple
from portfolio_analytics import PortfolioAnalytics

class StockPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.analytics = PortfolioAnalytics()
        
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Prepare technical indicators as features"""
        # Moving averages
        df['ma_5'] = df['close'].rolling(window=5).mean()
        df['ma_10'] = df['close'].rolling(window=10).mean()
        df['ma_20'] = df['close'].rolling(window=20).mean()
        
        # RSI
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        df['bb_upper'] = df['ma_20'] + (df['close'].rolling(window=20).std() * 2)
        df['bb_lower'] = df['ma_20'] - (df['close'].rolling(window=20).std() * 2)
        df['bb_width'] = df['bb_upper'] - df['bb_lower']
        
        # Volume indicators
        df['volume_ma'] = df['volume'].rolling(window=10).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma']
        
        # Price ratios
        df['high_low_ratio'] = df['high'] / df['low']
        df['close_open_ratio'] = df['close'] / df['open']
        
        return df
    
    def train_model(self, symbol: str) -> Dict:
        """Train prediction model for a specific stock"""
        # Get historical data
        df = self.analytics.get_historical_data(symbol, 500)  # 2 years
        
        if df.empty or len(df) < 50:
            return {"error": "Insufficient data for training"}
        
        # Prepare features
        df = self.prepare_features(df)
        df = df.dropna()
        
        if len(df) < 30:
            return {"error": "Insufficient data after feature preparation"}
        
        # Prepare target (next day's closing price)
        df['target'] = df['close'].shift(-1)
        df = df.dropna()
        
        # Select features
        feature_columns = ['ma_5', 'ma_10', 'ma_20', 'rsi', 'bb_width', 
                          'volume_ratio', 'high_low_ratio', 'close_open_ratio']
        
        X = df[feature_columns]
        y = df['target']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Predictions
        y_pred = self.model.predict(X_test_scaled)
        
        # Metrics
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        return {
            "mse": round(mse, 4),
            "r2": round(r2, 4),
            "accuracy": round(r2 * 100, 2)
        }
    
    def predict_price(self, symbol: str, days_ahead: int = 1) -> Dict:
        """Predict future price for a stock"""
        try:
            # Get recent data
            df = self.analytics.get_historical_data(symbol, 100)
            
            if df.empty:
                return {"error": "No data available"}
            
            # Prepare features
            df = self.prepare_features(df)
            df = df.dropna()
            
            if df.empty:
                return {"error": "Insufficient data for prediction"}
            
            # Get latest features
            feature_columns = ['ma_5', 'ma_10', 'ma_20', 'rsi', 'bb_width', 
                              'volume_ratio', 'high_low_ratio', 'close_open_ratio']
            
            latest_features = df[feature_columns].iloc[-1:].values
            
            # Quick train on recent data
            df_train = df.copy()
            df_train['target'] = df_train['close'].shift(-1)
            df_train = df_train.dropna()
            
            if len(df_train) < 20:
                return {"error": "Insufficient training data"}
            
            X_train = df_train[feature_columns]
            y_train = df_train['target']
            
            X_train_scaled = self.scaler.fit_transform(X_train)
            self.model.fit(X_train_scaled, y_train)
            
            # Predict
            latest_scaled = self.scaler.transform(latest_features)
            predicted_price = self.model.predict(latest_scaled)[0]
            
            current_price = df['close'].iloc[-1]
            change_percent = ((predicted_price - current_price) / current_price) * 100
            
            return {
                "current_price": round(current_price, 2),
                "predicted_price": round(predicted_price, 2),
                "change_percent": round(change_percent, 2),
                "prediction_for_days": days_ahead,
                "confidence": "Medium"  # You can implement confidence calculation
            }
            
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}

class RiskAnalyzer:
    def __init__(self):
        self.analytics = PortfolioAnalytics()
    
    def calculate_var(self, returns: pd.Series, confidence_level: float = 0.05) -> float:
        """Calculate Value at Risk"""
        return np.percentile(returns, confidence_level * 100)
    
    def calculate_beta(self, stock_returns: pd.Series, market_returns: pd.Series) -> float:
        """Calculate stock beta relative to market"""
        covariance = np.cov(stock_returns, market_returns)[0][17]
        market_variance = np.var(market_returns)
        return covariance / market_variance if market_variance != 0 else 1
    
    def assess_portfolio_risk(self, holdings: List[Dict]) -> Dict:
        """Comprehensive risk assessment"""
        if not holdings:
            return {}
        
        risk_metrics = {}
        
        # Concentration risk
        total_value = sum(h['market_value'] for h in holdings)
        max_weight = max(h['market_value'] / total_value for h in holdings)
        risk_metrics['concentration_risk'] = "High" if max_weight > 0.3 else "Medium" if max_weight > 0.2 else "Low"
        
        # Sector diversification (simplified)
        risk_metrics['diversification_score'] = min(len(holdings) / 10 * 100, 100)
        
        # Volatility assessment
        volatilities = []
        for holding in holdings:
            hist_data = self.analytics.get_historical_data(holding['symbol'], 30)
            if not hist_data.empty:
                returns = hist_data['close'].pct_change().dropna()
                volatility = returns.std() * np.sqrt(252) * 100
                volatilities.append(volatility)
        
        if volatilities:
            avg_volatility = np.mean(volatilities)
            risk_metrics['volatility_level'] = "High" if avg_volatility > 30 else "Medium" if avg_volatility > 20 else "Low"
        
        return risk_metrics
