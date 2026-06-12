"""
bot.py
------
Main orchestrator for the AI Trading Bot.

Run a single cycle manually:
    python bot.py

Dry-run (log decisions, no orders placed):
    python bot.py --dry-run

The scheduler (scheduler.py) calls run_cycle() automatically.
"""

import argparse
import logging
import sys

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
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("bot")


def run_cycle(dry_run: bool = False) -> None:
    """
    Execute one full trading cycle across all configured tickers.

    Steps per ticker:
        1. Fetch recent news headlines
        2. Skip if no news found
        3. Run FinBERT sentiment analysis on all headlines
        4. Apply buy/sell/hold threshold logic
        5. Submit order (unless dry_run=True)
        6. Log decision to trades_log.csv
    """
    log.info("=" * 60)
    log.info("Starting trading cycle | dry_run=%s", dry_run)
    log.info("=" * 60)

    trader = Trader()

    # ── Market hours guard ────────────────────────────────────────────────────
    if not dry_run and not trader.is_market_open():
        log.warning("Market is currently CLOSED. Skipping order execution.")
        # We still log the cycle attempt but won't place orders.
        # In scheduler mode this is expected outside market hours.
        return

    # ── Account snapshot ──────────────────────────────────────────────────────
    account = trader.get_account()
    if account:
        log.info(
            "Account — equity: $%.2f | cash: $%.2f | buying_power: $%.2f",
            account["equity"], account["cash"], account["buying_power"],
        )

    # ── Fetch news for all tickers ────────────────────────────────────────────
    log.info("Fetching news for tickers: %s", config.TICKERS)
    all_news = fetch_all_news(tickers=config.TICKERS)

    # ── Per-ticker loop ───────────────────────────────────────────────────────
    for ticker in config.TICKERS:
        # ── RISK GUARD: Check Stop-Loss / Take-Profit First ───────────────────
        position = trader.get_position(ticker)
        if position:
            pl_pct = position["unrealized_pl_pc"]
            log.info("[%s] Current position return: %+.2f%%", ticker, pl_pct * 100)
            
            if pl_pct <= config.STOP_LOSS_PCT:
                log.warning("[%s] STOP-LOSS TRIGGERED (%.2f%%) — Liquidating!", ticker, pl_pct * 100)
                if not dry_run:
                    trader.sell(ticker)
                continue
                
            elif pl_pct >= config.TAKE_PROFIT_PCT:
                log.info("[%s] TAKE-PROFIT TRIGGERED (%.2f%%) — Locking in gains!", ticker, pl_pct * 100)
                if not dry_run:
                    trader.sell(ticker)
                continue
        articles = all_news.get(ticker, [])

        # ── Skip if no news ───────────────────────────────────────────────────
        if not articles:
            log.info("[%s] No recent news found — SKIP", ticker)
            trade_logger.log_decision(
                ticker=ticker,
                sentiment_score=0.0,
                action="SKIP",
                status="no_news",
            )
            continue

        # ── Build text corpus for inference ──────────────────────────────────
        # Combine headline + summary for richer signal.
        texts = []
        for art in articles:
            parts = [art["headline"]]
            if art.get("summary"):
                parts.append(art["summary"])
            texts.append(" ".join(parts))

        # ── Run sentiment analysis ────────────────────────────────────────────
        try:
            score = get_sentiment_score(texts)
        except Exception as exc:
            log.error("[%s] Sentiment analysis failed: %s — SKIP", ticker, exc)
            trade_logger.log_decision(
                ticker=ticker,
                sentiment_score=0.0,
                action="SKIP",
                status="sentiment_error",
                error=str(exc),
            )
            continue

        log.info(
            "[%s] %d articles | avg sentiment score: %+.4f",
            ticker, len(articles), score,
        )

        # ── Trading decision ──────────────────────────────────────────────────
        action = "HOLD"
        order_result: dict = {}

        if score >= config.BUY_THRESHOLD:
            # Check for existing position to avoid doubling up
            position = trader.get_position(ticker)
            if position:
                log.info(
                    "[%s] BUY signal but already holding %.4f shares — HOLD",
                    ticker, position["qty"],
                )
                action = "HOLD"
            else:
                action = "BUY"
                if dry_run:
                    log.info("[%s] [DRY-RUN] Would BUY $%.2f", ticker, config.NOTIONAL_USD)
                    order_result = {"status": "dry_run", "order_id": ""}
                else:
                    log.info("[%s] Executing BUY $%.2f", ticker, config.NOTIONAL_USD)
                    order_result = trader.buy(ticker, notional=config.NOTIONAL_USD)

        elif score <= config.SELL_THRESHOLD:
            # Only sell if we actually hold the stock
            position = trader.get_position(ticker)
            if not position:
                log.info("[%s] SELL signal but no position held — HOLD", ticker)
                action = "HOLD"
            else:
                action = "SELL"
                if dry_run:
                    log.info("[%s] [DRY-RUN] Would SELL position", ticker)
                    order_result = {"status": "dry_run", "order_id": ""}
                else:
                    log.info("[%s] Executing SELL (liquidate position)", ticker)
                    order_result = trader.sell(ticker)

        else:
            log.info(
                "[%s] Score %+.4f within neutral band [%.2f, %.2f] — HOLD",
                ticker, score, config.SELL_THRESHOLD, config.BUY_THRESHOLD,
            )

        # ── Log decision ──────────────────────────────────────────────────────
        trade_logger.log_decision(
            ticker=ticker,
            sentiment_score=score,
            action=action,
            order_id=order_result.get("order_id", ""),
            status=order_result.get("status", ""),
            error=order_result.get("error", ""),
        )

    log.info("Cycle complete. Log written to: %s", config.TRADES_LOG_FILE)
    log.info("=" * 60)


# ── CLI Entry Point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Trading Bot — single cycle")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Log decisions without placing any real orders.",
    )
    args = parser.parse_args()
    run_cycle(dry_run=args.dry_run)
