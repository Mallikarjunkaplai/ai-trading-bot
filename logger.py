"""
logger.py
---------
Pushes structured trade decision records directly to Supabase.
"""

import logging
import os
from dotenv import load_dotenv
from supabase import create_client, Client

module_logger = logging.getLogger(__name__)

# Point directly to the .env file inside your frontend folder
dotenv_path = os.path.join(os.getcwd(), 'frontend', '.env')
load_dotenv(dotenv_path)

# Grab the keys from the frontend .env file
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")

# Initialize the Supabase bridge
if not SUPABASE_URL or not SUPABASE_KEY:
    module_logger.error("[Logger] Supabase credentials missing! Check frontend/.env file.")
    supabase = None
else:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def log_decision(
    ticker: str,
    sentiment_score: float,
    action: str,                # "BUY" | "SELL" | "HOLD" | "SKIP"
    order_id: str = "",
    status: str = "",
    error: str = "",
    filepath: str = "",         # Kept so we don't break bot.py's config, but ignored
) -> None:
    """
    Push a single trade decision row directly to the Supabase database.
    """
    if not supabase:
        module_logger.error("[Logger] Supabase client not initialized. Skipping log.")
        return

    # We don't need 'timestamp' here because Supabase automatically 
    # creates the timestamp in the 'created_at' column.
    row = {
        "ticker": ticker,
        "sentiment_score": round(sentiment_score, 6),
        "action": action,
        "order_id": order_id,
        "status": status,
        "error": error,
    }

    try:
        # Insert the data directly into the 'trading_cycles' table in the cloud
        response = supabase.table("trading_cycles").insert(row).execute()
        module_logger.info("[Logger] Supabase Insert Success: %s | %s | score=%.4f", ticker, action, sentiment_score)
    except Exception as exc:
        module_logger.error("[Logger] Failed to write to Supabase: %s", exc)