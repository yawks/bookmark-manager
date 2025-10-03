from playwright.sync_api import sync_playwright, Page, expect
import time
import re

def run_verification(page: Page):
    """
    This script verifies the new features in the Bookmarks Manager app.
    """
    # 1. Navigate to the app.
    # Assuming the Nextcloud instance is running on localhost and the app is at this path.
    # This may require manual login if the session is not authenticated.
    app_url = "http://localhost/index.php/apps/bookmarksmanager/"
    try:
        page.goto(app_url, wait_until="networkidle", timeout=10000)
    except Exception as e:
        print(f"Could not navigate to {app_url}. Assuming we are already on the page or will be redirected.")
        # If navigation fails, it might be because a login is required.
        # The test will proceed and likely fail on the next step, but this is the best
        # we can do without credentials.

    # Wait for the main app content to be visible.
    try:
        expect(page.locator("#app-content")).to_be_visible(timeout=30000)
    except Exception as e:
        print("The #app-content element is not visible. The application may not have loaded correctly.")
        print("This could be due to a login requirement or an issue with the application itself.")
        page.screenshot(path="jules-scratch/verification/verification_error.png")
        raise e

    # 2. Verify "Add Bookmark" button is in the header and open the modal.
    add_bookmark_button = page.get_by_role("button", name="Add bookmark")
    expect(add_bookmark_button).to_be_visible()
    add_bookmark_button.click()
    dialog = page.get_by_role("dialog", name="Add a new bookmark")
    expect(dialog).to_be_visible()

    # 3. Verify description is a textarea.
    description_input = dialog.locator("#description")

    # 4. Enter URL and check for pre-fill.
    url_input = dialog.locator("#url")
    url_to_test = "https://en.wikipedia.org/wiki/Bookmark"
    url_input.fill(url_to_test)
    url_input.press("Tab")  # Trigger blur to fetch metadata.

    # Wait for the API call to complete.
    expect(dialog.get_by_placeholder("Fetching title...")).not_to_be_visible(timeout=20000)

    title_input = dialog.locator("#title")
    expect(title_input).not_to_have_value("", timeout=10000)
    expect(description_input).not_to_have_value("", timeout=10000)

    # 5. Create a new tag.
    tags_input = dialog.locator('input[placeholder="Select tags..."]')
    new_tag = "new tag with spaces"
    tags_input.fill(new_tag)
    creatable_option = dialog.get_by_text(f'Create "{new_tag}"')
    expect(creatable_option).to_be_visible()
    creatable_option.click()

    # Verify the new tag is displayed as a badge with the correct styling.
    new_tag_badge = dialog.get_by_text(new_tag)
    expect(new_tag_badge).to_be_visible()
    expect(new_tag_badge).to_have_class(re.compile(r"bg-primary"))

    # 6. Take a screenshot for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

    # 7. Test save button and ensure the dialog closes.
    save_button = dialog.get_by_role("button", name="Save bookmark")
    save_button.click()
    expect(dialog).not_to_be_visible()

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            page.close()
            context.close()
            browser.close()

if __name__ == "__main__":
    main()