from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List

from database import SessionLocal, engine, get_db
from models import Base, User as UserModel, Portfolio as PortfolioModel, Holding as HoldingModel, Transaction as TransactionModel
import schemas
from auth import *
from portfolio_analytics import PortfolioAnalytics
from ml_models import StockPredictor, RiskAnalyzer

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Investment Analytics Platform", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
analytics = PortfolioAnalytics()
predictor = StockPredictor()
risk_analyzer = RiskAnalyzer()

# Authentication endpoints
@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Portfolio endpoints
@app.get("/portfolios", response_model=List[schemas.Portfolio])
def get_portfolios(current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PortfolioModel).filter(PortfolioModel.user_id == current_user.id).all()

@app.post("/portfolios", response_model=schemas.Portfolio)
def create_portfolio(portfolio: schemas.PortfolioCreate, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    db_portfolio = PortfolioModel(**portfolio.dict(), user_id=current_user.id)
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

@app.get("/portfolios/{portfolio_id}/holdings", response_model=List[schemas.Holding])
def get_holdings(portfolio_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id, PortfolioModel.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return db.query(HoldingModel).filter(HoldingModel.portfolio_id == portfolio_id).all()

@app.post("/portfolios/{portfolio_id}/holdings", response_model=schemas.Holding)
def add_holding(portfolio_id: int, holding: schemas.HoldingBase, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id, PortfolioModel.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get current stock price
    stock_data = analytics.get_stock_price(holding.symbol)
    current_price = stock_data['price']
    
    db_holding = HoldingModel(
        **holding.dict(),
        portfolio_id=portfolio_id,
        current_price=current_price,
        market_value=holding.shares * current_price,
        gain_loss=(current_price - holding.average_price) * holding.shares,
        gain_loss_percent=((current_price - holding.average_price) / holding.average_price) * 100 if holding.average_price > 0 else 0
    )
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    return db_holding

@app.get("/portfolios/{portfolio_id}/analytics")
def get_portfolio_analytics(portfolio_id: int, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id, PortfolioModel.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    holdings = db.query(HoldingModel).filter(HoldingModel.portfolio_id == portfolio_id).all()
    holdings_data = [
        {
            "symbol": h.symbol,
            "shares": h.shares,
            "market_value": h.market_value,
            "gain_loss": h.gain_loss
        }
        for h in holdings
    ]
    
    metrics = analytics.calculate_portfolio_metrics(holdings_data)
    recommendations = analytics.generate_recommendations(holdings_data)
    risk_assessment = risk_analyzer.assess_portfolio_risk(holdings_data)
    
    return {
        "metrics": metrics,
        "recommendations": recommendations,
        "risk_assessment": risk_assessment,
        "total_value": sum(h.market_value for h in holdings),
        "total_gain_loss": sum(h.gain_loss for h in holdings)
    }

@app.get("/stock/{symbol}/price")
def get_stock_price(symbol: str):
    return analytics.get_stock_price(symbol)

@app.get("/stock/{symbol}/prediction")
def get_stock_prediction(symbol: str):
    return predictor.predict_price(symbol)

@app.get("/stock/{symbol}/historical")
def get_historical_data(symbol: str, days: int = 30):
    data = analytics.get_historical_data(symbol, days)
    if data.empty:
        return {"error": "No data available"}
    
    return {
        "symbol": symbol,
        "data": data.reset_index().to_dict('records')
    }

@app.post("/portfolios/{portfolio_id}/transactions", response_model=schemas.Transaction)
def add_transaction(portfolio_id: int, transaction: schemas.TransactionBase, current_user: UserModel = Depends(get_current_user), db: Session = Depends(get_db)):
    portfolio = db.query(PortfolioModel).filter(PortfolioModel.id == portfolio_id, PortfolioModel.user_id == current_user.id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    total_amount = transaction.shares * transaction.price
    db_transaction = TransactionModel(
        **transaction.dict(),
        portfolio_id=portfolio_id,
        total_amount=total_amount
    )
    db.add(db_transaction)
    
    # Update or create holding
    holding = db.query(HoldingModel).filter(
        HoldingModel.portfolio_id == portfolio_id,
        HoldingModel.symbol == transaction.symbol
    ).first()
    
    if holding:
        if transaction.transaction_type == "BUY":
            total_cost = (holding.shares * holding.average_price) + total_amount
            holding.shares += transaction.shares
            holding.average_price = total_cost / holding.shares
        elif transaction.transaction_type == "SELL":
            holding.shares -= transaction.shares
            if holding.shares <= 0:
                db.delete(holding)
        
        # Update current price and market value
        stock_data = analytics.get_stock_price(transaction.symbol)
        holding.current_price = stock_data['price']
        holding.market_value = holding.shares * holding.current_price
        holding.gain_loss = (holding.current_price - holding.average_price) * holding.shares
        holding.gain_loss_percent = ((holding.current_price - holding.average_price) / holding.average_price) * 100 if holding.average_price > 0 else 0
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/")
def read_root():
    return {"message": "Smart Investment Analytics Platform API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
