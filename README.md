# AI Trading Bot 🤖📈

A Python-based paper trading bot that uses **FinBERT sentiment analysis** on live financial news to automatically execute market orders via the **Alpaca Paper Trading API**.

> ⚠️ **This bot uses paper trading only — no real money is at risk.**

---

## Architecture

```
News (Alpaca News API)
        ↓
Sentiment Analysis (FinBERT / HuggingFace)
        ↓
Score Aggregation & Threshold Logic
        ↓
Order Execution (Alpaca Paper Trading)
        ↓
Trade Log (trades_log.csv)
```

---

## Project Structure

| File | Purpose |
|---|---|
| `.env` | Alpaca API credentials (**never commit this**) |
| `config.py` | All tuneable parameters |
| `news_fetcher.py` | Fetches news via Alpaca News API |
| `sentiment_analyzer.py` | FinBERT inference, returns score in [-1, +1] |
| `trader.py` | Alpaca buy / sell / position helpers |
| `logger.py` | Writes decisions to `trades_log.csv` |
| `bot.py` | Orchestrator — single cycle logic |
| `scheduler.py` | APScheduler loop (every 30 min, market hours) |
| `trades_log.csv` | Auto-generated runtime log |

---

## Setup

### 1. Prerequisites

- Python 3.11+
- An [Alpaca](https://alpaca.markets/) account (free paper trading)

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

> **Note:** The FinBERT model (~260 MB) will be downloaded from Hugging Face on first run.

### 3. Configure Credentials

Your `.env` file should contain:

```
ALPACA_API_KEY="your_key_here"
ALPACA_SECRET_KEY="your_secret_here"
```

### 4. (Optional) Edit Configuration

Open `config.py` to customise:

| Parameter | Default | Description |
|---|---|---|
| `TICKERS` | `["AAPL", "MSFT", "TSLA", "AMZN", "GOOGL"]` | Stocks to trade |
| `BUY_THRESHOLD` | `0.3` | Score ≥ this → BUY |
| `SELL_THRESHOLD` | `-0.3` | Score ≤ this → SELL |
| `NOTIONAL_USD` | `1000.0` | Dollars per BUY order |
| `CYCLE_INTERVAL_MINUTES` | `30` | How often the bot runs |
| `NEWS_LOOKBACK_HOURS` | `4` | Hours of news per cycle |

---

## Usage

### Single Manual Run (recommended for testing)

```bash
# Dry-run — logs decisions, places NO orders
python bot.py --dry-run

# Live paper run — executes real paper orders
python bot.py
```

### Automated Scheduler (runs every 30 min during market hours)

```bash
# Dry-run mode
python scheduler.py --dry-run

# Live paper trading
python scheduler.py
```

Press **Ctrl+C** to stop the scheduler gracefully.

---

## Trade Log

Every decision is recorded in `trades_log.csv`:

| Column | Description |
|---|---|
| `timestamp` | UTC ISO 8601 time |
| `ticker` | Stock symbol |
| `sentiment_score` | Aggregated FinBERT score (-1 to +1) |
| `action` | `BUY` / `SELL` / `HOLD` / `SKIP` |
| `order_id` | Alpaca order UUID (empty for HOLD/SKIP) |
| `status` | Order status from Alpaca |
| `error` | Error message if applicable |

---

## Sentiment Logic

FinBERT returns three labels per text: `positive`, `negative`, `neutral`.

The bot aggregates them as:

```
signed_score = positive_confidence - negative_confidence   ∈ [-1, +1]
avg_score    = mean(signed_score for all headlines)
```

| Score Range | Decision |
|---|---|
| `≥ +0.30` | BUY (if not already holding) |
| `≤ -0.30` | SELL (if holding a position) |
| Between | HOLD |

---

## Disclaimer

This bot is for **educational purposes only**. Paper trading performance does not guarantee live trading results. Always understand the risks before live trading.
