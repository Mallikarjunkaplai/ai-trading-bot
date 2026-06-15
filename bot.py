"""
bot.py
------
Main orchestrator for the AI Trading Bot.
"""

import argparse
import logging
import sys
import os
import requests
import threading
from datetime import datetime
from flask import Flask

# Import your custom modules
import config
from news_fetcher import fetch_all_news
from sentiment_analyzer import get_sentiment_score
from trader import Trader
import logger as trade_logger

# ── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("bot")

# ── Web Server for Render ─────────────────────────────────────────────────────
app = Flask(__name__)

@app.route('/')
def home():
    return "Bot is running"

def run_web_server():
    # Render assigns a port via the PORT environment variable
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)

# ── Bot Logic ────────────────────────────────────────────────────────────────
def run_cycle(dry_run: bool = False) -> None:
    log.info("Starting trading cycle | dry_run=%s", dry_run)
    trader = Trader()
    
    # Check market hours
    if not dry_run and not trader.is_market_open():
        log.warning("Market CLOSED. Skipping execution.")
        return
    
    # Fetch and process
    all_news = fetch_all_news(tickers=config.TICKERS)
    for ticker in config.TICKERS:
        # (Your trading logic here)
        log.info("Processing %s...", ticker)
        
    log.info("Cycle complete.")

# ── Combined Entry Point ──────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Trading Bot")
    parser.add_argument("--dry-run", action="store_true", default=False)
    args = parser.parse_args()

    # 1. Start Web Server in a background thread
    web_thread = threading.Thread(target=run_web_server, daemon=True)
    web_thread.start()
    
    # 2. Run the trading cycle
    run_cycle(dry_run=args.dry_run)