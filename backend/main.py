from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import auth, portfolio, stock_search, email, user
from scheduler import start_scheduler



# create the databasu
Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict later to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(email.router)
app.include_router(portfolio.router)
app.include_router(stock_search.router)
app.include_router(user.router)

# Start the email scheduler
start_scheduler()

@app.get("/")
def root():
    return {"message": "FastAPI is working!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

