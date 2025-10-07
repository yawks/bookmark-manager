import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    # Listen for all console events and print them
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
    try:
        verify_changes(page)
    finally:
        browser.close()

def verify_changes(page: Page):
    # 1. Navigate to the application
    try:
        page.goto("http://localhost:5173/apps/bookmarksmanager/")
        # Wait for the main content to load
        expect(page.get_by_role("heading", name="Bookmarks")).to_be_visible(timeout=15000) # Increased timeout
    except Exception as e:
        print("Error during page load or initial verification:")
        page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        raise e

    # 2. Verify Sidebar Changes
    expect(page.get_by_role("heading", name="Collections")).to_be_visible()
    expect(page.get_by_role("heading", name="Tags")).to_be_visible()

    # 3. Verify "Create a Collection" feature
    page.get_by_role("heading", name="Collections").hover()
    create_collection_button = page.get_by_title("Create a collection")
    expect(create_collection_button).to_be_visible()
    create_collection_button.click()
    new_collection_input = page.get_by_placeholder("New collection name")
    expect(new_collection_input).to_be_visible()
    new_collection_input.fill("My New Collection")
    page.keyboard.press("Escape") # Close the input

    # 4. Verify Tag Selector in Add Bookmark Form
    page.get_by_role("button", name="Add Bookmark").click()
    expect(page.get_by_role("heading", name="Add a new bookmark")).to_be_visible()

    tag_input = page.get_by_placeholder("Add tags...")
    expect(tag_input).to_be_visible()

    # Create a new tag
    tag_input.fill("Awesome Tag 1")
    # Press enter to create the tag from the input value
    page.keyboard.press("Enter")
    # Verify the badge is there. The text is inside the badge.
    expect(page.get_by_text("Awesome Tag 1")).to_be_visible()

    # Create a second tag
    tag_input.fill("Cool Tag 2")
    page.keyboard.press("Enter")
    expect(page.get_by_text("Cool Tag 2")).to_be_visible()

    # Remove the first tag by clicking its remove button
    # The badge is a div, and the text and button are inside.
    # We locate the badge containing the text, then find the button inside it.
    first_tag_badge = page.get_by_text("Awesome Tag 1").locator("..")
    first_tag_badge.get_by_role("button").click()
    expect(page.get_by_text("Awesome Tag 1")).not_to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

with sync_playwright() as playwright:
    run(playwright)