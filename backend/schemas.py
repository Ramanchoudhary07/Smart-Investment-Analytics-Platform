from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    total_value: float
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class HoldingBase(BaseModel):
    symbol: str
    company_name: str
    shares: float
    average_price: float

class HoldingCreate(HoldingBase):
    portfolio_id: int

class Holding(HoldingBase):
    id: int
    portfolio_id: int
    current_price: float
    market_value: float
    gain_loss: float
    gain_loss_percent: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    symbol: str
    transaction_type: str
    shares: float
    price: float

class TransactionCreate(TransactionBase):
    portfolio_id: int

class Transaction(TransactionBase):
    id: int
    portfolio_id: int
    total_amount: float
    transaction_date: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
