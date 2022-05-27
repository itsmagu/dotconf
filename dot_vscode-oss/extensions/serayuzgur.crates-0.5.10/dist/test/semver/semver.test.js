"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const assert = require("assert");
const semverUtils_1 = require("../../semver/semverUtils");
// suite("semver symbol tests", function () {
//   test("caret", function () {
//     //TODO: handle major, minor, patch, asterix
//     /*For caret ranges, only major version must match. Any minor or patch version greater than or equal to the minimum is valid.
//       For example, a range of ~1.2.3 will only permit versions up to, but not including 1.3.0. However, the caret version, ^1.2.3 permits versions from 1.2.3 all the way up to, but not including, the next major version, 2.0.0.*/
//     assert.strictEqual("a", "1/a");
//   });
//   test("tilda", function () {
//     /*For tilde ranges, major and minor versions must match those specified, but any patch version greater than or equal to the one specified is valid.
//       For example, ~1.2.3 permits versions from 1.2.3 up to, but not including, the next minor, 1.3.0.*/
//     assert.strictEqual("a", "1/a");
//   });
//   test("eq", function () {
//     assert.strictEqual("a", "1/a");
//   });
//   test("gt", function () {
//     assert.strictEqual("a", "1/a");
//   });
//   test("lt", function () {
//     assert.strictEqual("a", "1/a");
//   });
//   test("gte", function () {
//     assert.strictEqual("a", "1/a");
//   });
//   test("lte", function () {
//     assert.strictEqual("a", "1/a");
//   });
//   test("and", function () {
//     assert.strictEqual("a", "1/a");
//   });
//   test("or", function () {
//     assert.strictEqual("a", "1/a");
//   });
// });
mocha_1.suite("semver convert2Range tests", function () {
    mocha_1.test("Ranges tilda", function () {
        assert.deepStrictEqual(semverUtils_1.convert2Range("~1.2.3"), [">=1.2.3", "<1.3.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("~1.2"), [">=1.2.0", "<1.3.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("~1"), [">=1.0.0", "<2.0.0"]);
    });
    mocha_1.test("Ranges caret", function () {
        assert.deepStrictEqual(semverUtils_1.convert2Range("^1.2.3"), [">=1.2.3", "<2.0.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("^1.2"), [">=1.2.0", "<2.0.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("^1"), [">=1.0.0", "<2.0.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("^0.2.3"), [">=0.2.3", "<0.3.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("^0.0.3"), [">=0.0.3", "<0.0.4"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("^0.0"), [">=0.0.0", "<0.1.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("^0"), [">=0.0.0", "<1.0.0"]);
    });
    mocha_1.test("Simple ranges", function () {
        assert.deepStrictEqual(semverUtils_1.convert2Range("1.2.3"), [">=1.2.3", "<1.3.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("=1.2.3"), [">=1.2.3", "<1.3.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range(">1.2.3"), [">=1.2.3", "<1.3.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range("<1.2.3"), [">=1.2.3", "<1.3.0"]);
        assert.deepStrictEqual(semverUtils_1.convert2Range(">=1.2.3"), [">=1.2.3", "<1.3.0"]);
    });
    // test("Hyphenated ranges", function () {
    //   assert.deepStrictEqual(convert2Range("1.2.3 - 2.3.4"), [">=1.2.3", "<=2.3.4"]);
    //   assert.deepStrictEqual(convert2Range("1.2.3 - 2.3"), [">=1.2.0", "<2.4.0"]);
    //   assert.deepStrictEqual(convert2Range("1.2.3 - 2"), [">=1.0.0", "<3.0.0"]);
    //   assert.deepStrictEqual(convert2Range("1.2 - 2.3.0"), ["1.2.0", "2.3.0"]);
    // });
});
//# sourceMappingURL=semver.test.js.map