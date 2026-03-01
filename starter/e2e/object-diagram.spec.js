// @ts-check
const { test, expect } = require("@playwright/test");
const path = require("path");

/** @typedef {import('@playwright/test').Page} Page */

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wait until the diagram has fully rendered (at least one shape on canvas).
 * @param {Page} page
 */
async function waitForDiagramLoaded(page) {
  await page.locator(".djs-shape").first().waitFor({ state: "visible" });
}

/**
 * Return the data-element-id values of all object shapes on the canvas.
 * @param {Page} page
 * @returns {Promise<string[]>}
 */
async function getObjectShapeIds(page) {
  return page
    .locator('.djs-shape[data-element-id^="Object_"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-element-id")));
}

/**
 * Return the data-element-id values of all connection elements on the canvas.
 * @param {Page} page
 * @returns {Promise<string[]>}
 */
async function getConnectionIds(page) {
  return page
    .locator('.djs-connection[data-element-id^="Link_"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-element-id")));
}

/**
 * Click a palette entry by its icon CSS class name.
 * @param {Page} page
 * @param {string} iconClass
 */
async function clickPaletteEntry(page, iconClass) {
  await page.locator(`.djs-palette .entry.${iconClass}`).click();
}

/**
 * Click on the canvas at the given relative position (relative to the #canvas
 * element's bounding box).
 * @param {Page} page
 * @param {number} relX
 * @param {number} relY
 */
async function clickOnCanvas(page, relX, relY) {
  const canvas = page.locator("#canvas");
  const box = await canvas.boundingBox();
  await page.mouse.click(box.x + relX, box.y + relY);
}

/**
 * Type text into the currently active direct-editing content.
 * Selects all existing text, deletes it, then types the new value so that
 * diagram-js's input event handlers fire correctly.
 * @param {Page} page
 * @param {string} text
 */
async function typeIntoDirectEdit(page, text) {
  const content = page.locator(
    ".djs-direct-editing-parent .djs-direct-editing-content",
  );
  await content.waitFor({ state: "visible" });
  await content.click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("Delete");
  await page.keyboard.type(text);
}

/**
 * Complete direct editing by clicking on an empty area of the canvas.
 * This triggers directEditing.complete() which saves the value.
 * @param {Page} page
 */
async function finishDirectEdit(page) {
  await clickOnCanvas(page, 50, 50);
  await page
    .locator(".djs-direct-editing-parent")
    .waitFor({ state: "hidden", timeout: 3000 });
}

/**
 * Dismiss the direct-edit overlay that auto-activates after creating a shape.
 * The overlay may or may not appear depending on timing, so this helper
 * tolerates its absence.
 * @param {Page} page
 */
async function dismissAutoDirectEdit(page) {
  const visible = await page
    .locator(".djs-direct-editing-parent .djs-direct-editing-content")
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true)
    .catch(() => false);

  if (visible) {
    await finishDirectEdit(page);
  }
}

/**
 * Wait for the export download links to reflect the current diagram state.
 * The app debounces export by 500 ms (see app.js), so we poll the XML
 * download link's href until it is a non-empty data URI rather than relying
 * on a fixed delay.
 * @param {Page} page
 */
async function waitForExportUpdate(page) {
  await expect(page.locator("#js-download-board")).toHaveAttribute(
    "href",
    /^data:application\/xml/,
    { timeout: 5000 },
  );
}

/**
 * Get the decoded content of a data-URI download link.
 * Works for both XML (`data:application/xml;charset=UTF-8,...`) and SVG links.
 * @param {Page} page
 * @param {string} selector
 * @returns {Promise<string>}
 */
async function getDownloadLinkContent(page, selector) {
  const href = await page.locator(selector).getAttribute("href");
  if (!href) return "";
  // Strip everything up to and including the first comma (the data-URI header)
  const encoded = href.substring(href.indexOf(",") + 1);
  return decodeURIComponent(encoded);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("Import / Export", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForDiagramLoaded(page);
  });

  test("sample board loads on startup", async ({ page }) => {
    const shapeIds = await getObjectShapeIds(page);

    // The sample board has 5 objects
    expect(shapeIds).toContain("Object_2669");
    expect(shapeIds).toContain("Object_2837");
    expect(shapeIds).toContain("Object_2838");
    expect(shapeIds).toContain("Object_2839");
    expect(shapeIds).toContain("Object_2840");
    expect(shapeIds).toHaveLength(5);

    // And 4 links
    const connectionIds = await getConnectionIds(page);
    expect(connectionIds).toHaveLength(4);
  });

  test("new diagram clears the board", async ({ page }) => {
    // Click "New diagram" button
    await page.locator("#js-open-new").click();

    // Wait for shapes to disappear — the empty board has no objects
    await expect(
      page.locator('.djs-shape[data-element-id^="Object_"]'),
    ).toHaveCount(0);
  });

  test("import XML file", async ({ page }) => {
    // Start with empty board
    await page.locator("#js-open-new").click();
    await expect(
      page.locator('.djs-shape[data-element-id^="Object_"]'),
    ).toHaveCount(0);

    // The app creates a hidden file input programmatically.
    // Trigger the import by setting files on that input.
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(
      path.join(__dirname, "fixtures", "sampleBoard.xml"),
    );

    // Wait for the diagram to render
    await waitForDiagramLoaded(page);

    const shapeIds = await getObjectShapeIds(page);
    expect(shapeIds).toHaveLength(5);
    expect(shapeIds).toContain("Object_2669");
  });

  test("export XML download link contains valid XML", async ({ page }) => {
    await waitForExportUpdate(page);

    const xml = await getDownloadLinkContent(page, "#js-download-board");
    expect(xml).toBeTruthy();

    // Verify the XML contains expected elements
    expect(xml).toContain("od:definitions");
    expect(xml).toContain("od:object");
    expect(xml).toContain('name="folding_wall_table:Product"');
    expect(xml).toContain("od:link");
  });

  test("export SVG download link contains valid SVG", async ({ page }) => {
    await waitForExportUpdate(page);

    const content = await getDownloadLinkContent(page, "#js-download-svg");
    expect(content).toBeTruthy();
    expect(content).toContain("<svg");
    expect(content).toContain("</svg>");
  });
});

test.describe("Editing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForDiagramLoaded(page);
    // Start with a clean canvas for editing tests
    await page.locator("#js-open-new").click();
    await expect(
      page.locator('.djs-shape[data-element-id^="Object_"]'),
    ).toHaveCount(0);
  });

  test("create an object via palette", async ({ page }) => {
    // Click the "Create object" palette entry
    await clickPaletteEntry(page, "od-icon-object");

    // Click on the canvas to place the object
    await clickOnCanvas(page, 400, 300);

    // Dismiss the auto-activated direct editing
    await dismissAutoDirectEdit(page);

    // Verify a new shape appeared
    const shapes = page.locator(".djs-shape[data-element-id]");
    const count = await shapes.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("edit object name", async ({ page }) => {
    // Create an object
    await clickPaletteEntry(page, "od-icon-object");
    await clickOnCanvas(page, 400, 300);

    // Direct editing auto-activates for the name after create
    await typeIntoDirectEdit(page, "myObj:MyClass");
    await finishDirectEdit(page);

    // Wait for export debounce to update the XML
    await waitForExportUpdate(page);

    // Verify the name is in the exported XML
    const xml = await getDownloadLinkContent(page, "#js-download-board");
    expect(xml).toContain("myObj:MyClass");
  });

  test("edit object attributes", async ({ page }) => {
    // Create an object
    await clickPaletteEntry(page, "od-icon-object");
    await clickOnCanvas(page, 400, 300);

    // Dismiss auto direct-edit (which is for the name)
    await dismissAutoDirectEdit(page);

    // Double-click on the lower part of the shape to edit attributes.
    // The object's default size is 150x90, title area is top 30px.
    // We need to double-click below the divider line (y offset > 30 from the
    // shape's top edge).
    const shape = page.locator(".djs-shape[data-element-id]").first();
    const box = await shape.boundingBox();

    // Double-click on the attribute area (below the divider at ~30px from top)
    await page.mouse.dblclick(box.x + box.width / 2, box.y + 50);

    await typeIntoDirectEdit(page, 'color="red"');
    await finishDirectEdit(page);

    // Verify the attribute is in the exported XML
    await waitForExportUpdate(page);
    const xml = await getDownloadLinkContent(page, "#js-download-board");
    expect(xml).toContain("color=");
  });

  test("create two objects and link them", async ({ page }) => {
    // Create first object
    await clickPaletteEntry(page, "od-icon-object");
    await clickOnCanvas(page, 300, 250);
    await dismissAutoDirectEdit(page);

    // Create second object
    await clickPaletteEntry(page, "od-icon-object");
    await clickOnCanvas(page, 600, 250);
    await dismissAutoDirectEdit(page);

    // Get the two shapes
    const shapes = page.locator(".djs-shape[data-element-id]");
    expect(await shapes.count()).toBe(2);

    const firstShape = shapes.first();

    // Click on the first shape to select it — the context pad opens on selection,
    // not on hover.
    await firstShape.click();

    // Click the "connect" entry in the context pad (link icon)
    const connectEntry = page.locator(
      ".djs-context-pad .entry.bpmn-icon-connection",
    );
    await connectEntry.waitFor({ state: "visible", timeout: 5000 });
    await connectEntry.click();

    // Click on the second shape to complete the connection
    const secondShape = shapes.nth(1);
    const secondBox = await secondShape.boundingBox();
    await page.mouse.click(
      secondBox.x + secondBox.width / 2,
      secondBox.y + secondBox.height / 2,
    );

    // Dismiss any direct editing that may activate for the link label
    await dismissAutoDirectEdit(page);

    // Verify a connection was created
    const connections = page.locator(".djs-connection[data-element-id]");
    expect(await connections.count()).toBeGreaterThanOrEqual(1);
  });
});
