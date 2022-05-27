"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCrateVersions = void 0;
const indicators_1 = require("../ui/indicators");
const local_registry_1 = require("../api/local_registry");
const github_1 = require("../api/github");
const compareVersions_1 = require("../semver/compareVersions");
function fetchCrateVersions(dependencies, shouldListPreRels, githubToken, isLocalRegistry) {
    indicators_1.statusBarItem.setText("👀 Fetching crates.io");
    const responses = dependencies.map((item) => {
        // Check settings and if local registry enabled control cargo home. Fallback is the github index.
        const isLocalRegistryAvailable = isLocalRegistry && local_registry_1.checkCargoRegistry();
        const versions = isLocalRegistryAvailable ? local_registry_1.versions : github_1.versions;
        return versions(item.key, githubToken)
            .then((json) => {
            return {
                item,
                versions: json.versions
                    .reduce((result, item) => {
                    const isPreRelease = !shouldListPreRels && item.num.indexOf("-") !== -1;
                    if (!item.yanked && !isPreRelease) {
                        result.push(item.num);
                    }
                    return result;
                }, [])
                    .sort(compareVersions_1.default)
                    .reverse(),
            };
        })
            .catch((error) => {
            console.error(error);
            return {
                item,
                error: item.key + ": " + error
            };
        });
    });
    return Promise.all(responses);
}
exports.fetchCrateVersions = fetchCrateVersions;
//# sourceMappingURL=fetcher.js.map