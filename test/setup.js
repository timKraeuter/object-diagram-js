import * as chai from "chai";
import { use, expect, should, assert } from "chai";
import sinonChai from "sinon-chai";
import ChaiMatch from "chai-match";

// Setup chai plugins
use(sinonChai);
use(ChaiMatch);

// Expose globals for test files
window.chai = chai;
window.expect = expect;
window.should = should();
window.assert = assert;
