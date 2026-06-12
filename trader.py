"""
trader.py
---------
Wraps the Alpaca alpaca-py TradingClient to provide simple
buy / sell / position-check helpers for paper trading.

All orders are MARKET orders submitted as NOTIONAL (fractional-share capable).
"""

import logging
import os
from datetime import datetime, timezone

from alpaca.trading.client import TradingClient
from alpaca.trading.requests import MarketOrderRequest
from alpaca.trading.enums import OrderSide, TimeInForce
from alpaca.common.exceptions import APIError
from dotenv import load_dotenv

import config

load_dotenv()
logger = logging.getLogger(__name__)


class Trader:
    """
    Provides high-level paper-trading operations backed by the Alpaca SDK.
    """

    def __init__(self) -> None:
        api_key = os.getenv("ALPACA_API_KEY")
        secret_key = os.getenv("ALPACA_SECRET_KEY")

        if not api_key or not secret_key:
            raise EnvironmentError(
                "ALPACA_API_KEY and ALPACA_SECRET_KEY must be set in your .env file."
            )

        # paper=True targets https://paper-api.alpaca.markets automatically
        self._client = TradingClient(
            api_key=api_key,
            secret_key=secret_key,
            paper=True,
        )
        logger.info("[Trader] Connected to Alpaca paper trading account.")

    # ── Market Status ──────────────────────────────────────────────────────────

    def is_market_open(self) -> bool:
        """Return True if the US equity market is currently open."""
        try:
            clock = self._client.get_clock()
            return clock.is_open
        except APIError as e:
            logger.error("[Trader] Failed to fetch market clock: %s", e)
            return False

    # ── Account Info ───────────────────────────────────────────────────────────

    def get_account(self) -> dict:
        """Return key account fields (equity, cash, buying power)."""
        try:
            acct = self._client.get_account()
            return {
                "equity": float(acct.equity),
                "cash": float(acct.cash),
                "buying_power": float(acct.buying_power),
                "currency": acct.currency,
            }
        except APIError as e:
            logger.error("[Trader] Failed to fetch account: %s", e)
            return {}

    # ── Positions ──────────────────────────────────────────────────────────────
    def get_position(self, ticker: str) -> dict | None:
        """
        Return position info for a ticker, or None if not held.
        """
        try:
            pos = self._client.get_open_position(ticker)
            return {
                "ticker": ticker,
                "qty": float(pos.qty),
                "market_value": float(pos.market_value),
                "avg_entry_price": float(pos.avg_entry_price),
                "unrealized_pl": float(pos.unrealized_pl),
                "unrealized_pl_pc": float(pos.unrealized_plpc),  # Corrected to unrealized_plpc
            }
        except APIError as e:
            if "position does not exist" in str(e).lower() or "40410000" in str(e):
                return None
            logger.error("[Trader] Unexpected error fetching position for %s: %s", ticker, e)
            return None

    # ── Orders ────────────────────────────────────────────────────────────────

    def buy(self, ticker: str, notional: float = config.NOTIONAL_USD) -> dict:
        """
        Submit a notional BUY market order.

        Args:
            ticker:   Stock symbol (e.g. "AAPL").
            notional: Dollar amount to spend (fractional shares allowed).

        Returns:
            dict with order_id, status, and submitted_at.
        """
        request = MarketOrderRequest(
            symbol=ticker,
            notional=round(notional, 2),
            side=OrderSide.BUY,
            time_in_force=TimeInForce.DAY,
        )
        try:
            order = self._client.submit_order(request)
            result = {
                "order_id": str(order.id),
                "ticker": ticker,
                "side": "BUY",
                "notional": notional,
                "status": str(order.status),
                "submitted_at": str(order.submitted_at),
            }
            logger.info(
                "[Trader] BUY submitted — %s $%.2f | order_id=%s status=%s",
                ticker, notional, result["order_id"], result["status"],
            )
            return result
        except APIError as e:
            logger.error("[Trader] BUY order failed for %s: %s", ticker, e)
            return {"ticker": ticker, "side": "BUY", "status": "ERROR", "error": str(e)}

    def sell(self, ticker: str) -> dict:
        """
        Liquidate the entire position in a ticker with a SELL market order.

        Returns:
            dict with order_id, status, and submitted_at.
        """
        try:
            # close_position handles the full quantity automatically
            order = self._client.close_position(ticker)
            result = {
                "order_id": str(order.id),
                "ticker": ticker,
                "side": "SELL",
                "status": str(order.status),
                "submitted_at": str(order.submitted_at),
            }
            logger.info(
                "[Trader] SELL submitted — %s | order_id=%s status=%s",
                ticker, result["order_id"], result["status"],
            )
            return result
        except APIError as e:
            logger.error("[Trader] SELL order failed for %s: %s", ticker, e)
            return {"ticker": ticker, "side": "SELL", "status": "ERROR", "error": str(e)}
