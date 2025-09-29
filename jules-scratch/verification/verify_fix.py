import pytest
from playwright.sync_api import Page, expect

def test_bookmarks_manager_loads_without_errors(page: Page):
    console_logs = []
    page.on("console", lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))

    try:
        page.goto("http://localhost:5173/")
        # Wait for the main content to be visible
        expect(page.locator("h1")).to_have_text("All Bookmarks", timeout=10000)
    finally:
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("--- CONSOLE LOGS ---")
        for log in console_logs:
            print(log)
        print("--------------------")