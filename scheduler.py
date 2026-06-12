"""
scheduler.py
------------
Runs the trading bot on a recurring schedule using APScheduler.

Usage:
    python scheduler.py             # Run every 30 min (market hours only)
    python scheduler.py --dry-run   # Same, but no real orders placed

The scheduler checks US market hours before each run.
Outside market hours (9:30 AM – 4:00 PM ET, Mon–Fri), cycles are skipped.

Press Ctrl+C to stop gracefully.
"""

import argparse
import logging
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

import config
from bot import run_cycle

# ── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
log = logging.getLogger("scheduler")

ET = ZoneInfo("America/New_York")


def _is_within_market_hours() -> bool:
    """
    Return True if the current ET time is within US equity market hours.
    Simple time-based check (does not account for holidays).
    The bot's trader.is_market_open() provides a more authoritative check
    inside run_cycle() itself.
    """
    now_et = datetime.now(ET)
    # Skip weekends
    if now_et.weekday() >= 5:  # 5=Saturday, 6=Sunday
        return False

    open_minutes = config.MARKET_OPEN_HOUR * 60 + config.MARKET_OPEN_MINUTE
    close_minutes = config.MARKET_CLOSE_HOUR * 60 + config.MARKET_CLOSE_MINUTE
    current_minutes = now_et.hour * 60 + now_et.minute

    return open_minutes <= current_minutes < close_minutes


def scheduled_job(dry_run: bool = False) -> None:
    """Wrapper called by APScheduler on each tick."""
    if not _is_within_market_hours():
        log.info("Outside market hours — cycle skipped.")
        return

    log.info("Scheduler trigger fired — starting bot cycle.")
    try:
        run_cycle(dry_run=dry_run)
    except Exception as exc:
        # Catch-all so APScheduler doesn't stop on an unexpected error
        log.error("Unhandled error in bot cycle: %s", exc, exc_info=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="AI Trading Bot Scheduler")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Log decisions without placing real orders.",
    )
    args = parser.parse_args()

    scheduler = BlockingScheduler(timezone=str(ET))
    scheduler.add_job(
        func=scheduled_job,
        trigger=IntervalTrigger(minutes=config.CYCLE_INTERVAL_MINUTES),
        id="trading_cycle",
        name="AI Trading Bot Cycle",
        kwargs={"dry_run": args.dry_run},
        # Fire immediately on start, then every N minutes
        next_run_time=datetime.now(ET),
    )

    log.info(
        "Scheduler started — running every %d minutes | dry_run=%s",
        config.CYCLE_INTERVAL_MINUTES,
        args.dry_run,
    )
    log.info("Market hours: %02d:%02d – %02d:%02d ET (Mon–Fri)",
             config.MARKET_OPEN_HOUR, config.MARKET_OPEN_MINUTE,
             config.MARKET_CLOSE_HOUR, config.MARKET_CLOSE_MINUTE)
    log.info("Press Ctrl+C to stop.")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log.info("Scheduler stopped by user.")
        scheduler.shutdown(wait=False)


if __name__ == "__main__":
    main()
