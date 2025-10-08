from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        # 1. Navigate to the app. Assuming the base URL is the Nextcloud instance.
        # The app is at /apps/bookmarksmanager.
        # Since the dev server is running, the URL will be http://localhost:5173
        page.goto("http://localhost:5173/", timeout=60000)

        # Wait for the main content to be visible
        expect(page.locator("#content")).to_be_visible()

        # 2. Open the "Add Bookmark" dialog.
        add_button = page.get_by_role("button", name="Add Bookmark")
        expect(add_button).to_be_visible()
        add_button.click()

        # 3. Enter a URL and wait for metadata to load.
        url_input = page.get_by_label("URL")
        expect(url_input).to_be_visible()
        url_input.fill("https://www.theverge.com/2023/9/25/23888363/microsoft-surface-event-2023-biggest-announcements-copilot-laptops")

        # Trigger the onBlur event
        page.get_by_label("Title").click()

        # Wait for the screenshot to appear and the skeleton to disappear
        expect(page.get_by_alt_text("Screenshot preview")).to_be_visible(timeout=30000)
        expect(page.locator(".animate-pulse")).not_to_be_visible()

        # 4. Enter a new tag.
        tag_input = page.get_by_placeholder("Select tags...")
        expect(tag_input).to_be_visible()
        tag_input.click()
        tag_input.type("New Test Tag")
        page.keyboard.press("Enter")

        # 5. Save the bookmark.
        save_button = page.get_by_role("button", name="Save bookmark")
        expect(save_button).to_be_enabled()
        save_button.click()

        # The dialog should close. Wait for it to be hidden.
        expect(page.get_by_role("dialog")).to_be_hidden()

        # Give the router time to invalidate and refetch
        page.wait_for_timeout(2000)

        # 6. Take a screenshot to verify the new bookmark and tag.
        expect(page.get_by_text("The biggest announcements from Microsoft’s 2023 Surface and AI event")).to_be_visible()
        expect(page.get_by_text("# New Test Tag")).to_be_visible()

        page.screenshot(path="jules-scratch/verification/verification.png")

    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)