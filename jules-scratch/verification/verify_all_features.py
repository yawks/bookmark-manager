from playwright.sync_api import sync_playwright, Page, expect
import time
import re

def run_verification(page: Page):
    """
    This script verifies the new features and fixes in the Bookmarks Manager app.
    It assumes the Nextcloud instance is running and the user is logged in.
    """
    app_url = "http://localhost/index.php/apps/bookmarksmanager/"

    print(f"Navigating to {app_url}...")
    try:
        # Increased timeout for initial navigation
        page.goto(app_url, wait_until="networkidle", timeout=30000)
        print("Navigation successful.")
    except Exception as e:
        print(f"ERROR: Could not navigate to {app_url}. The application may not be running or a login is required.")
        print(f"Details: {e}")
        # Take a screenshot to show what page we landed on (e.g., login page)
        page.screenshot(path="jules-scratch/verification/navigation_error.png")
        # Re-raise the exception to stop the script, as further steps will fail.
        raise

    # 1. Verify the default view is loaded correctly.
    print("Verifying default view...")
    try:
        # Check for the main content area, which should contain the bookmark list.
        main_content = page.locator("main")
        expect(main_content).to_be_visible(timeout=15000)
        # Check for the "Bookmarks" title in the header.
        header_title = page.get_by_role("heading", name="Bookmarks")
        expect(header_title).to_be_visible()
        print("Default view loaded successfully.")
    except Exception as e:
        print("ERROR: The default view did not load correctly.")
        page.screenshot(path="jules-scratch/verification/verification_error.png")
        raise

    # 2. Verify "Add Bookmark" button is in the header and open the modal.
    print("Verifying 'Add Bookmark' button...")
    add_bookmark_button = page.get_by_role("button", name="Add bookmark")
    expect(add_bookmark_button).to_be_visible()
    add_bookmark_button.click()
    dialog = page.get_by_role("dialog", name="Add a new bookmark")
    expect(dialog).to_be_visible()
    print("'Add Bookmark' modal opened.")

    # 3. Verify description is a textarea.
    print("Verifying description field...")
    description_input = dialog.locator("#description")
    expect(description_input).to_have_tag("textarea")
    print("Description field is a textarea.")

    # 4. Enter URL and check for pre-fill.
    print("Verifying metadata pre-fill...")
    url_input = dialog.locator("#url")
    url_to_test = "https://nextcloud.com/"
    url_input.fill(url_to_test)
    url_input.press("Tab")

    # Wait for the API call to complete.
    expect(dialog.get_by_placeholder("Fetching title...")).not_to_be_visible(timeout=25000)

    title_input = dialog.locator("#title")
    expect(title_input).not_to_have_value("", timeout=15000)
    expect(description_input).not_to_have_value("", timeout=15000)
    print("Metadata pre-fill successful.")

    # 5. Create a new tag.
    print("Verifying tag creation...")
    tags_input = dialog.locator('input[placeholder*="Select tags"]')
    new_tag = "a new tag"
    tags_input.fill(new_tag)
    creatable_option = dialog.get_by_role("option", name=f'Create "{new_tag}"')
    expect(creatable_option).to_be_visible()
    creatable_option.click()

    new_tag_badge = dialog.get_by_text(new_tag, exact=True)
    expect(new_tag_badge).to_be_visible()
    expect(new_tag_badge).to_have_class(re.compile(r"bg-primary"))
    print("Tag creation and styling verified.")

    # 6. Take a screenshot for visual verification.
    print("Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot saved to jules-scratch/verification/verification.png")

    # 7. Test save button and ensure the dialog closes.
    print("Verifying save functionality...")
    save_button = dialog.get_by_role("button", name="Save bookmark")
    save_button.click()
    expect(dialog).not_to_be_visible(timeout=10000)
    print("Save functionality verified, dialog closed.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            run_verification(page)
            print("\nVerification script completed successfully!")
        except Exception as e:
            print(f"\nVerification script failed: {e}")
        finally:
            page.close()
            context.close()
            browser.close()

if __name__ == "__main__":
    main()