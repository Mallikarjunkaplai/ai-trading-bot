"""
config.py
---------
Central configuration for the AI Trading Bot.
Edit these values to tune the bot's behaviour without touching core logic.
"""

# ── Tickers ────────────────────────────────────────────────────────────────────
# Stocks the bot will monitor and trade.
TICKERS: list[str] = ["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL"]

# ── Sentiment Thresholds ───────────────────────────────────────────────────────
# Aggregated score in [-1, +1].
#   score ≥  BUY_THRESHOLD  → BUY
#   score ≤  SELL_THRESHOLD → SELL
#   otherwise               → HOLD
BUY_THRESHOLD: float = 0.3
SELL_THRESHOLD: float = -0.3

# ── Position Sizing ────────────────────────────────────────────────────────────
# Dollar-notional amount to spend per BUY order (fractional shares supported).
NOTIONAL_USD: float = 1000.0

# ── News Settings ──────────────────────────────────────────────────────────────
# How many hours back to look for news on each cycle.
NEWS_LOOKBACK_HOURS: int = 4
# Maximum articles to fetch per ticker per cycle.
NEWS_MAX_ARTICLES: int = 10

# ── Hugging Face Model ─────────────────────────────────────────────────────────
# FinBERT — fine-tuned on financial text.
# Labels: "positive", "negative", "neutral"
MODEL_NAME: str = "ProsusAI/finbert"

# ── Alpaca API ─────────────────────────────────────────────────────────────────
# Paper trading base URL (safe — no real money).
PAPER_BASE_URL: str = "https://paper-api.alpaca.markets"

# ── Scheduler ──────────────────────────────────────────────────────────────────
# How often the bot runs (in minutes).
CYCLE_INTERVAL_MINUTES: int = 30
# US Eastern market hours (24h format).
MARKET_OPEN_HOUR: int = 9
MARKET_OPEN_MINUTE: int = 30
MARKET_CLOSE_HOUR: int = 16
MARKET_CLOSE_MINUTE: int = 0

# ── Logging ────────────────────────────────────────────────────────────────────
TRADES_LOG_FILE: str = "trades_log.csv"

# ── Risk Management ───────────────────────────────────────────────────────────
# Max loss allowed before panic selling (e.g., -0.05 = -5%)
STOP_LOSS_PCT: float = -0.05

# Profit target to lock in gains (e.g., 0.15 = +15%)
TAKE_PROFIT_PCT: float = 0.15