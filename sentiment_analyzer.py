"""
sentiment_analyzer.py
---------------------
Runs FinBERT (or any compatible HuggingFace model) over a list of text
strings and returns a single aggregated sentiment score in [-1, +1].

Label → score mapping for FinBERT:
    "positive" →  +confidence score
    "negative" →  -confidence score
    "neutral"  →   0
"""

import logging
from functools import lru_cache

from transformers import pipeline

import config

logger = logging.getLogger(__name__)


class SentimentAnalyzer:
    """
    Singleton-style sentiment analyzer backed by a Hugging Face pipeline.

    Usage:
        analyzer = SentimentAnalyzer()
        score = analyzer.analyze(["Stocks soar after earnings beat."])
        # score ∈ [-1.0, +1.0]
    """

    _instance = None  # module-level singleton

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        logger.info(
            "[SentimentAnalyzer] Loading model '%s' (first run may download ~260 MB)…",
            config.MODEL_NAME,
        )
        self._pipe = pipeline(
            task="text-classification",
            model=config.MODEL_NAME,
            # top_k=None returns all labels with their scores
            top_k=None,
            truncation=True,
            max_length=512,
        )
        self._initialized = True
        logger.info("[SentimentAnalyzer] Model loaded successfully.")

    def _score_single(self, label_scores: list[dict]) -> float:
        """
        Convert FinBERT's list of {label, score} dicts into a
        single signed float in [-1, +1].

        For a general SST-2 model (labels: POSITIVE / NEGATIVE), the same
        logic applies naturally.
        """
        score_map: dict[str, float] = {
            item["label"].lower(): item["score"] for item in label_scores
        }

        positive = score_map.get("positive", score_map.get("label_1", 0.0))
        negative = score_map.get("negative", score_map.get("label_0", 0.0))
        # neutral contributes 0 net weight

        return float(positive - negative)

    def analyze(self, texts: list[str]) -> float:
        """
        Run sentiment analysis on a list of text strings.

        Args:
            texts: List of headline / summary strings.

        Returns:
            Averaged signed sentiment score in [-1.0, +1.0].
            Returns 0.0 if the input list is empty.
        """
        if not texts:
            logger.warning("[SentimentAnalyzer] Received empty text list.")
            return 0.0

        # Filter out blank strings
        clean_texts = [t.strip() for t in texts if t.strip()]
        if not clean_texts:
            return 0.0

        try:
            # Batch inference — returns list of lists of {label, score}
            results = self._pipe(clean_texts)
        except Exception as exc:
            logger.error("[SentimentAnalyzer] Inference error: %s", exc)
            return 0.0

        scores = [self._score_single(label_scores) for label_scores in results]
        avg_score = sum(scores) / len(scores)

        logger.debug(
            "[SentimentAnalyzer] %d texts → individual scores: %s → avg: %.4f",
            len(clean_texts),
            [round(s, 3) for s in scores],
            avg_score,
        )
        return avg_score


def get_sentiment_score(texts: list[str]) -> float:
    """
    Convenience function — creates/reuses the singleton and returns the score.
    """
    analyzer = SentimentAnalyzer()
    return analyzer.analyze(texts)
