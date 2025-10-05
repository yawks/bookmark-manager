import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.add_init_script("() => { const meta = document.createElement('meta'); meta.name = 'requesttoken'; meta.content = 'test-token'; document.head.appendChild(meta); }")

    def handle_routes(route):
        url = route.request.url
        method = route.request.method

        if "/api/v1/" not in url:
            return route.continue_()

        if "page-info" in url:
            return route.fulfill(status=200, json={
                "title": "Mocked Title", "description": "Mocked Description",
                "image": "https://github.githubassets.com/assets/campaign-social-03-45f3c053154e.png"
            })

        if "/api/v1/bookmarks" in url and method == 'POST':
            return route.fulfill(status=200, json={"id": 1})

        if method == 'GET':
            return route.fulfill(status=200, json=[])

        return route.continue_()

    page.route("**/*", handle_routes)
    page.goto("http://localhost:5173/")

    # 1. Verify Empty State
    expect(page.get_by_text("Welcome to your Bookmark Manager")).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/01_empty_state.png")

    # 2. Open Add Bookmark dialog
    page.get_by_role("button", name="Add Bookmark").click()
    dialog_title = page.get_by_role("heading", name="Add a new bookmark")
    expect(dialog_title).to_be_visible()

    # 3. Fill URL, see autofill
    page.get_by_label("URL").fill("https://example.com")
    page.get_by_label("URL").press("Tab")
    expect(page.get_by_label("Title")).to_have_value("Mocked Title", timeout=10000)
    expect(page.get_by_alt_text("Preview")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/02_autofilled_form.png")

    # 4. Save the bookmark
    page.get_by_role("button", name="Save bookmark").click()

    # 5. Verify dialog closes
    expect(dialog_title).not_to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/03_dialog_closed.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)