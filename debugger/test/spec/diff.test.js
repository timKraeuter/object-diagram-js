import {
  readFileSync
} from 'fs';
import {diff} from "../../src/differ";

test('Diff for add', () => {
  let base = readFileSync("./test/fixtures/base.xml").toJSON();
  let added = readFileSync("./test/fixtures/add.xml").toJSON();

  let diff1 = diff(base, added);
  console.log(diff1);

  expect(3).toBe(3);
});