"""
scheduler.py
------------
Runs the AI Trading Bot on a continuous, automated loop based on config settings.
"""

import time
import subprocess
import logging
from datetime import datetime
import pytz
import config

# Set up clean logging for the terminal
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s  %(levelname)-8s %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("Scheduler")

def run_bot():
    """Fires off a single run of bot.py using the exact terminal command."""
    logger.info("============================================================")
    logger.info("⏰ SCHEDULER WAKE UP: Triggering new AI trading cycle...")
    
    try:
        # This tells Python to run the bot exactly as if you typed it yourself
        subprocess.run(["python", "bot.py"], check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Bot cycle crashed or failed: {e}")
    except FileNotFoundError:
        logger.error("❌ Could not find bot.py! Make sure you are in the right folder.")

    logger.info(f"💤 CYCLE COMPLETE: Sleeping for {config.CYCLE_INTERVAL_MINUTES} minutes.")
    logger.info("============================================================")

if __name__ == "__main__":
    logger.info("🚀 SMART TRADER AUTO-SCHEDULER INITIALIZED")
    logger.info(f"⚙️ Target execution interval: Every {config.CYCLE_INTERVAL_MINUTES} minutes.")
    
    try:
        # Infinite loop that runs the bot, then sleeps
        while True:
            run_bot()
            # Convert minutes from config.py into seconds for the sleep timer
            time.sleep(config.CYCLE_INTERVAL_MINUTES * 60)
            
    except KeyboardInterrupt:
        logger.info("\n🛑 Auto-Scheduler stopped manually by user. Shutting down safely.")