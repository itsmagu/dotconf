"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.latestVersion = void 0;
/**
 * Helps to manage decorations for the TOML files.
 */
const vscode_1 = require("vscode");
const semverUtils_1 = require("../semver/semverUtils");
const commands_1 = require("../toml/commands");
const semver_1 = require("semver");
exports.latestVersion = (text) => vscode_1.window.createTextEditorDecorationType({
    after: {
        margin: "2em",
    },
});
/**
 * Create a decoration for the given crate.
 * @param editor
 * @param crate
 * @param version
 * @param versions
 */
function decoration(editor, item, versions, compatibleDecorator, incompatibleDecorator, errorDecorator, error) {
    // Also handle json valued dependencies
    const start = item.start;
    const endofline = editor.document.lineAt(editor.document.positionAt(item.end)).range.end;
    const decoPosition = editor.document.offsetAt(endofline);
    const end = item.end;
    const [satisfies, maxSatisfying] = semverUtils_1.checkVersion(item.value, versions);
    const hoverMessage = error ? new vscode_1.MarkdownString(`**${error}**`) : new vscode_1.MarkdownString(`#### Versions`);
    hoverMessage.appendMarkdown(` _( [Check Reviews](https://web.crev.dev/rust-reviews/crate/${item.key.replace(/"/g, "")}) )_`);
    hoverMessage.isTrusted = true;
    if (versions.length > 0) {
        commands_1.status.replaceItems.push({
            item: `"${versions[0]}"`,
            start,
            end,
        });
    }
    for (let i = 0; i < versions.length; i++) {
        const version = versions[i];
        const replaceData = {
            item: `"${version}"`,
            start,
            end,
        };
        const isCurrent = version === maxSatisfying;
        const encoded = encodeURI(JSON.stringify(replaceData));
        const docs = (i === 0 || isCurrent) ? `[(docs)](https://docs.rs/crate/${item.key}/${version})` : "";
        const command = `${isCurrent ? "**" : ""}[${version}](command:crates.replaceVersion?${encoded})${docs}${isCurrent ? "**" : ""}`;
        hoverMessage.appendMarkdown("\n * ");
        hoverMessage.appendMarkdown(command);
    }
    let latestText = compatibleDecorator.replace("${version}", "");
    if (!semver_1.validRange(item.value))
        latestText = errorDecorator.replace("${version}", versions[0]);
    else if (versions[0] !== maxSatisfying)
        if (satisfies) {
            latestText = compatibleDecorator.replace("${version}", versions[0]);
        }
        else {
            latestText = incompatibleDecorator.replace("${version}", versions[0]);
        }
    const contentText = error ? errorDecorator : latestText;
    const deco = {
        range: new vscode_1.Range(editor.document.positionAt(start), editor.document.positionAt(decoPosition)),
        hoverMessage,
        renderOptions: {
            after: {},
        },
    };
    if (contentText.length > 0) {
        deco.renderOptions.after = { contentText };
    }
    return deco;
}
exports.default = decoration;
//# sourceMappingURL=decoration.js.map