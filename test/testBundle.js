import * as chai from "chai";
import { use, expect, should, assert } from "chai";
import sinonChai from "sinon-chai";

// Setup chai
use(sinonChai);
window.chai = chai;
window.expect = expect;
window.should = should();
window.assert = assert;

var allTests = require.context(".", true, /(spec|integration).*Spec\.js$/);

allTests.keys().forEach(allTests);
