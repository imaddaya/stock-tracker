from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os

EMAIL_ADDRESS = os.environ["EMAIL_ADDRESS"]
EMAIL_PASSWORD = os.environ["EMAIL_PASSWORD"]
TO_EMAIL = os.environ["TO_EMAIL"]

app = FastAPI()

portfolio = []

class StockTicker(BaseModel):
    ticker: str

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI is working!"}

@app.post("/portfolio/add")
def add_stock(stock: StockTicker):
    ticker = stock.ticker.upper()
    if ticker in portfolio:
        raise HTTPException(status_code=400, detail="Ticker already in portfolio")
    portfolio.append(ticker)
    return {"message": f"{ticker} added to portfolio", "portfolio": portfolio}

@app.post("/portfolio/remove")
def remove_stock(stock: StockTicker):
    ticker = stock.ticker.upper()
    if ticker not in portfolio:
        raise HTTPException(status_code=404, detail="Ticker not found in portfolio")
    portfolio.remove(ticker)
    return {"message": f"{ticker} removed from portfolio", "portfolio": portfolio}

@app.get("/portfolio")
def get_portfolio():
    return {"portfolio": portfolio}

ALPHA_VANTAGE_API_KEY = "7Y7XPQL5T98XNE5X"

@app.get("/portfolio/summary")
def get_portfolio_summary():
    if not portfolio:
        return {"message": "Portfolio is empty", "summary": []}

    summary = []

    for ticker in portfolio:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={ALPHA_VANTAGE_API_KEY}"

        try:
            response = httpx.get(url)
            data = response.json()
            quote = data.get("Global Quote", {})

            if not quote:
                summary.append({"ticker": ticker, "error": "No data returned"})
                continue

            summary.append({
                "ticker": quote.get("01. symbol", ticker),
                "price": quote.get("05. price", "N/A"),
                "change_percent": quote.get("10. change percent", "N/A")
            })

        except Exception as e:
            summary.append({"ticker": ticker, "error": str(e)})

    return {"summary": summary}
