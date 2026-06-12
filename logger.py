"""
logger.py
---------
Appends structured trade decision records to a CSV log file.

Each row represents one bot decision per ticker per cycle:
    timestamp, ticker, sentiment_score, action, order_id, status, error
"""

import csv
import logging
import os
from datetime import datetime, timezone

import config

module_logger = logging.getLogger(__name__)


# CSV column definitions
_FIELDNAMES = [
    "timestamp",
    "ticker",
    "sentiment_score",
    "action",
    "order_id",
    "status",
    "error",
]


def _ensure_header(filepath: str) -> None:
    """Write CSV header row if the file does not yet exist or is empty."""
    if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
        with open(filepath, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=_FIELDNAMES)
            writer.writeheader()
        module_logger.info("[Logger] Created new trade log: %s", filepath)


def log_decision(
    ticker: str,
    sentiment_score: float,
    action: str,                # "BUY" | "SELL" | "HOLD" | "SKIP"
    order_id: str = "",
    status: str = "",
    error: str = "",
    filepath: str = config.TRADES_LOG_FILE,
) -> None:
    """
    Append a single trade decision row to the CSV log.

    Args:
        ticker:           Stock symbol.
        sentiment_score:  Aggregated sentiment in [-1, +1].
        action:           Decision taken by the bot.
        order_id:         Alpaca order ID (empty for HOLD/SKIP).
        status:           Order status returned by Alpaca.
        error:            Error message if the order failed.
        filepath:         Path to the CSV log file.
    """
    _ensure_header(filepath)

    row = {
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "ticker": ticker,
        "sentiment_score": round(sentiment_score, 6),
        "action": action,
        "order_id": order_id,
        "status": status,
        "error": error,
    }

    try:
        with open(filepath, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=_FIELDNAMES)
            writer.writerow(row)
        module_logger.debug("[Logger] Logged %s | %s | score=%.4f", ticker, action, sentiment_score)
    except OSError as exc:
        module_logger.error("[Logger] Failed to write to %s: %s", filepath, exc)
