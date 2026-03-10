# AGENTS.md - Coding Agent Instructions for object-diagram-js

## Project Overview

Object diagram toolkit and modeler built on [diagram-js](https://github.com/bpmn-io/diagram-js) (bpmn.io ecosystem).
Pure JavaScript (ES modules), no TypeScript. Uses prototypal inheritance with a
dependency injection (didi) container. The library ships raw ES module sources with
no build step. Sub-projects (`starter/`, `debugger/`) use Vite.

## Build / Lint / Test Commands

```bash
# Run everything (lint + prettier check + tests) -- this is what CI runs
npm run all

# Lint only
npm run lint

# Prettier check / auto-fix
npm run pCheck
npm run pWrite

# Run all tests (Vitest in browser mode via Playwright/Chromium)
npm test

# Run tests in watch mode
npm run dev

# Run a single test file
npx vitest run test/spec/ModelerSpec.js

# Run tests matching a pattern (by test name)
npx vitest run -t "should import simple board"

# Install Playwright browsers (required before first test run)
npx playwright install chromium
```

### Starter sub-project (in `starter/`)

```bash
cd starter && npm i
npm run all          # lint + prettier + build
npm run dev          # dev server on localhost:3000
npx playwright test  # E2E tests (requires build first)
```

### CI

GitHub Actions on push/PR, 3-OS matrix (macOS, Ubuntu, Windows), Node 22.
Two jobs: `build` (lint + prettier + unit tests) and `e2e` (Playwright E2E for starter).

## Code Style Guidelines

### Formatting (Prettier enforced, default config)

- **2-space indentation**, no tabs
- **Double quotes** for all strings
- **Semicolons** always
- **Trailing commas** in multi-line constructs
- Line width ~80 characters (Prettier default)
- Run `npm run pWrite` to auto-format before committing

### Imports

- **ES modules** (`import`/`export`) everywhere. No CommonJS in lib or tests.
- **Order**: third-party imports first, then local imports, separated by a blank line.
- Import aliasing is common for `min-dom` and `tiny-svg`:
  ```js
  import { query as domQuery, remove as domRemove } from "min-dom";
  import { append as svgAppend, attr as svgAttr } from "tiny-svg";
  ```

### Naming Conventions

| What            | Convention        | Example                                  |
| --------------- | ----------------- | ---------------------------------------- |
| Files (classes) | PascalCase        | `ODRenderer.js`, `BaseViewer.js`         |
| Files (barrels) | `index.js`        | `lib/draw/index.js`                      |
| Directories     | kebab-case        | `label-editing/`, `grid-snapping/`       |
| Constructors    | PascalCase        | `function Modeler(options) {}`           |
| Functions       | camelCase         | `importXML`, `getBusinessObject`         |
| Variables       | camelCase         | `elementRegistry`, `businessObject`      |
| Constants       | UPPER_SNAKE_CASE  | `DEFAULT_FONT_SIZE`, `LINE_HEIGHT_RATIO` |
| Private members | underscore prefix | `this._moddle`, `this._emit()`           |

### Module / Class Patterns

- **Prototypal inheritance**, NOT ES6 classes. Constructors use `inherits`:

  ```js
  import inherits from "inherits-browser";

  export default function Modeling(eventBus, elementFactory, commandStack) {
    BaseModeling.call(this, eventBus, elementFactory, commandStack);
  }
  inherits(Modeling, BaseModeling);

  Modeling.prototype.someMethod = function () { ... };
  Modeling.$inject = ["eventBus", "elementFactory", "commandStack"];
  ```

- Every injectable service declares dependencies via a static `$inject` array.
- DI module barrels (`index.js`) export plain objects:
  ```js
  export default {
    __init__: ["odRenderer"],
    odRenderer: ["type", ODRenderer],
    textRenderer: ["type", TextRenderer],
  };
  ```

### Export Patterns

- **Default exports** for constructor functions / classes.
- **Named exports** for utility functions and constants.
- Files may mix both (default export for the class, named exports for helpers).

### Variable Declarations

- Older code uses `var` extensively; newer code uses `const`/`let`.
- When modifying existing files, match the surrounding style.
- The `var self = this` pattern is used in callback-heavy Promise code.

### Error Handling

- **Promise `.catch()`** for async operations (most common pattern).
- **`throw new Error("message")`** for precondition violations.
- **try/catch** wrapping synchronous code that may fail.
- **Event-based** error/warning collection during import (`error` and `warning` callbacks).
- Errors are sometimes enriched: `err.warnings = warningsArray`.

### JSDoc

- JSDoc is used for documentation on constructors, public methods, and utilities.
- Use `@param`, `@returns`, `@typedef` annotations. No TypeScript types.

### File Organization

- `lib/` - Core library source code
- `lib/features/` - Feature modules (13 modules: auto-place, modeling, rules, etc.)
- `lib/draw/` - Rendering (ODRenderer, TextRenderer)
- `lib/import/` - XML import/parsing
- `lib/util/` - Shared utilities (ModelUtil, LabelUtil, etc.)
- `test/spec/` - Test specs (`*Spec.js`)
- `test/fixtures/` - XML test fixtures
- `test/helper/` - Test utilities (bootstrapModeler, inject, etc.)
- `starter/` - Example starter application (Vite)
- `debugger/` - IntelliJ debugger UI sub-project (Vite)
- `assets/` - CSS and font assets

### Helper Comment Sections

Files commonly end with a `// helpers //////` divider followed by private
(non-exported) helper functions. Follow this pattern when adding helpers.

## Testing

- **Framework**: Vitest v4 with browser mode (Playwright/Chromium)
- **Assertions**: Chai `expect` (BDD style), exposed as globals via `test/setup.js`
- **Mocking**: sinon + sinon-chai
- **Test file naming**: `*Spec.js` in `test/spec/`
- **Fixtures**: XML files in `test/fixtures/`
- **Test helpers**: `test/helper/index.js` provides `bootstrapModeler`, `inject`, `insertCSS`

Test structure uses Mocha-style `describe`/`it`/`beforeEach` imported from vitest:

```js
import { describe, it, beforeEach } from "vitest";

describe("FeatureName", function () {
  var container;

  beforeEach(function () {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should do something", function () {
    return createModeler(simpleXML).then(function (result) {
      expect(result.error).not.to.exist;
    });
  });
});
```

## Key Dependencies

- `diagram-js` - Core diagram toolkit (canvas, modeling, rendering infrastructure)
- `object-diagram-moddle` - Object diagram meta-model (XML parsing/serialization)
- `inherits-browser` / `inherits` - Prototypal inheritance helper
- `min-dash` - Lodash-like utilities (assign, forEach, isObject, etc.)
- `min-dom` - Minimal DOM utilities (domify, query, remove, etc.)
- `tiny-svg` - SVG manipulation (append, attr, create, etc.)
