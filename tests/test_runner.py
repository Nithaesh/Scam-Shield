"""Test runner and evaluation harness for Scam Shield multi-agent accuracy."""

from __future__ import annotations

import argparse
import json
import logging
import os
import sys
import time
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from orchestrator import analyse

logger = logging.getLogger("scam_shield.test_runner")
logging.basicConfig(level=logging.INFO, format="%(message)s")
DATA_DIR = PROJECT_ROOT / "data"
RESULTS_JSON_PATH = PROJECT_ROOT / "tests" / "results.json"
RESULTS_MD_PATH = PROJECT_ROOT / "tests" / "RESULTS.md"


def load_dataset(dataset_name: str) -> list[dict[str, Any]]:
    """Load test cases from specified dataset files."""
    cases: list[dict[str, Any]] = []

    files = {
        "scams": DATA_DIR / "scams.json",
        "genuine": DATA_DIR / "genuine.json",
        "edge": DATA_DIR / "edge_cases.json",
    }

    selected = files.keys() if dataset_name == "all" else [dataset_name]

    for key in selected:
        path = files.get(key)
        if path and path.exists():
            data = json.loads(path.read_text(encoding="utf-8"))
            cases.extend(data)
        else:
            logger.warning("Dataset file %s not found.", path)

    return cases


def run_evaluation(
    dataset: str = "all",
    category: str | None = None,
    limit: int | None = None,
    no_cache: bool = False,
    sleep_sec: float = 0.5,
) -> dict[str, Any]:
    """Execute end-to-end evaluation against benchmark cases."""
    if no_cache:
        os.environ["USE_CACHE"] = "0"

    all_cases = load_dataset(dataset)

    if category:
        all_cases = [c for c in all_cases if c.get("category") == category]

    if limit and limit > 0:
        all_cases = all_cases[:limit]

    print(f"\n=======================================================")
    print(f"  SCAM SHIELD AGENT LAYER BENCHMARK EVALUATION")
    print(f"  Total Cases: {len(all_cases)} | Sleep Between Calls: {sleep_sec}s")
    print(f"=======================================================\n")

    results_table: list[dict[str, Any]] = []
    tp = 0
    fn = 0
    fp = 0
    tn = 0
    genuine_total = 0
    genuine_fp = 0
    passed_total = 0

    header = f"{'ID':<12} | {'EXPECTED':<10} | {'PREDICTED':<10} | {'CONF':<5} | {'RESULT':<6} | {'LATENCY':<9} | {'CATEGORY'}"
    print(header)
    print("-" * len(header))

    for idx, case in enumerate(all_cases):
        case_id = case["id"]
        input_type = case.get("input_type", "text")
        input_content = case["input_text"]
        expected = case["expected_verdict"].lower()
        case_cat = case.get("category", "general")

        # Handle image placeholder missing
        if input_type == "image":
            image_path = PROJECT_ROOT / input_content
            if not image_path.exists():
                print(f"{case_id:<12} | {expected:<10} | {'SKIPPED':<10} | {'--':<5} | {'SKIP':<6} | {'--':<9} | {case_cat} (Placeholder)")
                continue
            input_content = image_path

        start_time = time.perf_counter()
        try:
            analysis = analyse(input_content, language="auto")
            predicted = analysis.verdict.verdict.lower()
            confidence = analysis.verdict.confidence
            latency = analysis.timings_ms.get("total", (time.perf_counter() - start_time) * 1000)
        except Exception as e:
            predicted = "could_not_check"
            confidence = 0
            latency = (time.perf_counter() - start_time) * 1000

        is_pass = (predicted == expected)
        if is_pass:
            passed_total += 1

        # Metrics for Scam class
        if expected == "scam":
            if predicted == "scam":
                tp += 1
            else:
                fn += 1
        else:
            if predicted == "scam":
                fp += 1
            else:
                tn += 1

        # False positive rate on genuine
        if expected == "safe":
            genuine_total += 1
            if predicted == "scam":
                genuine_fp += 1

        status_str = "PASS" if is_pass else "FAIL"
        print(f"{case_id:<12} | {expected:<10} | {predicted:<10} | {confidence:<5} | {status_str:<6} | {latency:<7.1f}ms | {case_cat}")

        results_table.append({
            "id": case_id,
            "category": case_cat,
            "expected": expected,
            "predicted": predicted,
            "confidence": confidence,
            "passed": is_pass,
            "latency_ms": round(latency, 2),
            "notes": case.get("notes", ""),
        })

        if sleep_sec > 0 and idx < len(all_cases) - 1:
            time.sleep(sleep_sec)

    total_evaluated = len(results_table)
    accuracy = (passed_total / total_evaluated * 100) if total_evaluated > 0 else 0.0
    scam_recall = (tp / (tp + fn) * 100) if (tp + fn) > 0 else 0.0
    scam_precision = (tp / (tp + fp) * 100) if (tp + fp) > 0 else 0.0
    f1_score = (2 * scam_precision * scam_recall / (scam_precision + scam_recall)) if (scam_precision + scam_recall) > 0 else 0.0
    genuine_fpr = (genuine_fp / genuine_total * 100) if genuine_total > 0 else 0.0

    summary = {
        "total_evaluated": total_evaluated,
        "passed": passed_total,
        "failed": total_evaluated - passed_total,
        "accuracy_pct": round(accuracy, 2),
        "scam_recall_pct": round(scam_recall, 2),
        "scam_precision_pct": round(scam_precision, 2),
        "scam_f1": round(f1_score, 2),
        "genuine_cases": genuine_total,
        "genuine_false_positive_rate_pct": round(genuine_fpr, 2),
        "results": results_table,
    }

    print("\n=======================================================")
    print("  EVALUATION SUMMARY")
    print(f"  Total Cases Evaluated:       {total_evaluated}")
    print(f"  Accuracy:                    {accuracy:.2f}%")
    print(f"  Scam Recall (Sensitivity):   {scam_recall:.2f}%")
    print(f"  Scam Precision:              {scam_precision:.2f}%")
    print(f"  Scam F1 Score:               {f1_score:.2f}")
    print(f"  Genuine False Positive Rate: {genuine_fpr:.2f}%")
    print("=======================================================\n")

    # Save to tests/results.json
    RESULTS_JSON_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"[+] Saved structured results to {RESULTS_JSON_PATH}")

    # Write Markdown Table to tests/RESULTS.md
    md_content = generate_markdown_report(summary)
    RESULTS_MD_PATH.write_text(md_content, encoding="utf-8")
    print(f"[+] Saved markdown evaluation report to {RESULTS_MD_PATH}")

    return summary


def generate_markdown_report(summary: dict[str, Any]) -> str:
    """Generate GitHub-flavored markdown report with summary metrics and results table."""
    md = [
        "# Scam Shield Evaluation Results",
        "",
        f"**Date**: 2026-10-30",
        "",
        "## Performance Metrics Summary",
        "",
        "| Metric | Value | Target Threshold | Status |",
        "| :--- | :--- | :--- | :--- |",
        f"| **Overall Accuracy** | `{summary['accuracy_pct']}%` | ≥ 85% | {'✅ Met' if summary['accuracy_pct'] >= 85 else '⚠️ Under review'} |",
        f"| **Scam Recall (Detection Rate)** | `{summary['scam_recall_pct']}%` | ≥ 90% | {'✅ Met' if summary['scam_recall_pct'] >= 90 else '⚠️ Tuning needed'} |",
        f"| **Scam Precision** | `{summary['scam_precision_pct']}%` | ≥ 85% | {'✅ Met' if summary['scam_precision_pct'] >= 85 else '⚠️ Under review'} |",
        f"| **Genuine False Positive Rate** | `{summary['genuine_false_positive_rate_pct']}%` | ≤ 10% | {'✅ Met' if summary['genuine_false_positive_rate_pct'] <= 10 else '⚠️ Over-flagging'} |",
        f"| **Scam F1 Score** | `{summary['scam_f1']}` | ≥ 85.0 | {'✅ Met' if summary['scam_f1'] >= 85 else '⚠️ Under review'} |",
        "",
        "## Detailed Evaluation Table",
        "",
        "| ID | Category | Expected | Predicted | Confidence | Result | Latency (ms) | Notes |",
        "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |",
    ]

    for r in summary["results"]:
        status_badge = "✅ PASS" if r["passed"] else "❌ FAIL"
        md.append(f"| `{r['id']}` | {r['category']} | `{r['expected']}` | `{r['predicted']}` | {r['confidence']}% | {status_badge} | {r['latency_ms']}ms | {r['notes']} |")

    return "\n".join(md) + "\n"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scam Shield Benchmark Test Runner")
    parser.add_argument("--dataset", choices=["all", "scams", "genuine", "edge"], default="all")
    parser.add_argument("--category", type=str, default=None)
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--no-cache", action="store_true")
    parser.add_argument("--sleep", type=float, default=0.5)

    args = parser.parse_args()
    run_evaluation(
        dataset=args.dataset,
        category=args.category,
        limit=args.limit,
        no_cache=args.no_cache,
        sleep_sec=args.sleep,
    )
