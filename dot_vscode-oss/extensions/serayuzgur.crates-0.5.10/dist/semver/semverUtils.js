"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVersion = void 0;
const semver_1 = require("semver");
function checkVersion(version = "0.0.0", versions) {
    const max = versions[0];
    return [semver_1.satisfies(max, version), semver_1.maxSatisfying(versions, version)];
}
exports.checkVersion = checkVersion;
//# sourceMappingURL=semverUtils.js.map