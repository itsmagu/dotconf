"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorationHandle = void 0;
const vscode_1 = require("vscode");
const indicators_1 = require("./indicators");
const decoration_1 = require("./decoration");
/**
 *
 * @param editor Takes crate info and editor. Decorates the editor.
 * @param dependencies
 */
function decorate(editor, dependencies) {
    if (exports.decorationHandle) {
        exports.decorationHandle.dispose();
    }
    const pref = loadPref(editor);
    const errors = [];
    const filtered = dependencies.filter((dep) => {
        if (dep && !dep.error && (dep.versions && dep.versions.length)) {
            return dep;
        }
        else if (!dep.error) {
            dep.error = dep.item.key + ": " + "No versions found";
        }
        errors.push(`${dep.error}`);
        return dep;
    });
    const options = [];
    for (let i = filtered.length - 1; i > -1; i--) {
        const dependency = filtered[i];
        try {
            const decor = decoration_1.default(editor, dependency.item, dependency.versions || [], pref.compatibleDecorator, pref.incompatibleDecorator, pref.errorDecorator, dependency.error);
            if (decor) {
                options.push(decor);
            }
        }
        catch (e) {
            console.error(e);
            errors.push(`Failed to build build decorator (${dependency.item.value})`);
        }
    }
    exports.decorationHandle = decoration_1.latestVersion("VERSION");
    editor.setDecorations(exports.decorationHandle, options);
    if (errors.length) {
        indicators_1.statusBarItem.setText("❗️ Completed with errors");
    }
    else {
        indicators_1.statusBarItem.setText("OK");
    }
}
exports.default = decorate;
function loadPref(editor) {
    var _a, _b;
    const config = vscode_1.workspace.getConfiguration("", editor.document.uri);
    const compatibleDecorator = (_a = config.get("crates.compatibleDecorator")) !== null && _a !== void 0 ? _a : "";
    const incompatibleDecorator = (_b = config.get("crates.incompatibleDecorator")) !== null && _b !== void 0 ? _b : "";
    const errorText = config.get("crates.errorDecorator");
    const errorDecorator = errorText ? errorText + "" : "";
    return {
        compatibleDecorator,
        incompatibleDecorator,
        errorDecorator,
    };
}
//# sourceMappingURL=decorator.js.map