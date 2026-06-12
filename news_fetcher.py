"""
news_fetcher.py
---------------
Fetches recent financial news headlines for a given stock ticker
using the Alpaca News API (v1beta1).

No additional API key is required beyond the standard Alpaca credentials.
"""

import os
import logging
from datetime import datetime, timedelta, timezone

import requests
from dotenv import load_dotenv

import config

load_dotenv()
logger = logging.getLogger(__name__)


class NewsFetcher:
    """Wraps the Alpaca News API to retrieve headlines for a given ticker."""

    _BASE_URL = "https://data.alpaca.markets/v1beta1/news"

    def __init__(self) -> None:
        self._api_key = os.getenv("ALPACA_API_KEY")
        self._secret_key = os.getenv("ALPACA_SECRET_KEY")

        if not self._api_key or not self._secret_key:
            raise EnvironmentError(
                "ALPACA_API_KEY and ALPACA_SECRET_KEY must be set in your .env file."
            )

        self._headers = {
            "APCA-API-KEY-ID": self._api_key,
            "APCA-API-SECRET-KEY": self._secret_key,
            "Accept": "application/json",
        }

    def fetch(
        self,
        ticker: str,
        lookback_hours: int = config.NEWS_LOOKBACK_HOURS,
        max_articles: int = config.NEWS_MAX_ARTICLES,
    ) -> list[dict]:
        """
        Fetch recent news articles for a single ticker.

        Returns a list of dicts with keys:
            - ticker (str)
            - headline (str)
            - summary (str)
            - published_at (str ISO 8601)
        """
        now_utc = datetime.now(timezone.utc)
        start_time = now_utc - timedelta(hours=lookback_hours)

        params = {
            "symbols": ticker,
            "start": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end": now_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "limit": max_articles,
            "sort": "desc",
            "include_content": "false",
        }

        try:
            response = requests.get(
                self._BASE_URL,
                headers=self._headers,
                params=params,
                timeout=15,
            )
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            logger.error("[NewsFetcher] HTTP error for %s: %s", ticker, e)
            return []
        except requests.exceptions.RequestException as e:
            logger.error("[NewsFetcher] Request failed for %s: %s", ticker, e)
            return []

        data = response.json()
        articles = data.get("news", [])

        results = []
        for article in articles:
            headline = article.get("headline", "").strip()
            summary = article.get("summary", "").strip()
            published_at = article.get("created_at", "")

            if not headline:
                continue

            results.append(
                {
                    "ticker": ticker,
                    "headline": headline,
                    "summary": summary,
                    "published_at": published_at,
                }
            )

        logger.info(
            "[NewsFetcher] %s: fetched %d articles (last %dh)",
            ticker, len(results), lookback_hours,
        )
        return results


def fetch_all_news(
    tickers: list[str] = config.TICKERS,
    lookback_hours: int = config.NEWS_LOOKBACK_HOURS,
) -> dict[str, list[dict]]:
    """
    Fetch news for all configured tickers.

    Returns:
        dict mapping ticker → list of article dicts.
    """
    fetcher = NewsFetcher()
    all_news: dict[str, list[dict]] = {}

    for ticker in tickers:
        articles = fetcher.fetch(ticker, lookback_hours=lookback_hours)
        all_news[ticker] = articles

    return all_news
