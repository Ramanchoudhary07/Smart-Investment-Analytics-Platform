from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    portfolios = relationship("Portfolio", back_populates="owner")

class Portfolio(Base):
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_value = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio")
    transactions = relationship("Transaction", back_populates="portfolio")

class Holding(Base):
    __tablename__ = "holdings"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    symbol = Column(String, index=True)
    company_name = Column(String)
    shares = Column(Float)
    average_price = Column(Float)
    current_price = Column(Float, default=0.0)
    market_value = Column(Float, default=0.0)
    gain_loss = Column(Float, default=0.0)
    gain_loss_percent = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    portfolio = relationship("Portfolio", back_populates="holdings")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    symbol = Column(String, index=True)
    transaction_type = Column(String)  # BUY, SELL
    shares = Column(Float)
    price = Column(Float)
    total_amount = Column(Float)
    transaction_date = Column(DateTime(timezone=True), server_default=func.now())
    
    portfolio = relationship("Portfolio", back_populates="transactions")

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    price = Column(Float)
    volume = Column(Integer)
    change_percent = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
