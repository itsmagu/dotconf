"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Listener for TOML files.
 * Filters active editor files according to the extension.
 */
const vscode_1 = require("vscode");
const parser_1 = require("../toml/parser");
const indicators_1 = require("../ui/indicators");
const commands_1 = require("../toml/commands");
const decorator_1 = require("../ui/decorator");
const fetcher_1 = require("./fetcher");
function parseToml(text) {
    console.log("Parsing...");
    const toml = parser_1.parse(text);
    const tomlDependencies = parser_1.filterCrates(toml.values);
    console.log("Parsed");
    indicators_1.statusBarItem.setText("Cargo.toml parsed");
    return tomlDependencies;
}
function parseAndDecorate(editor) {
    const text = editor.document.getText();
    const config = vscode_1.workspace.getConfiguration("", editor.document.uri);
    const shouldListPreRels = config.get("crates.listPreReleases");
    const basicAuth = config.get("crates.githubAuthBasic");
    const isLocalRegistery = config.get("crates.useLocalCargoIndex");
    const githubToken = basicAuth ? `Basic ${Buffer.from(basicAuth).toString("base64")}` : undefined;
    // Handle Promise's catch and normal try/catch the same way with an async closure.
    (() => __awaiter(this, void 0, void 0, function* () {
        try {
            // Parse
            const dependencies = parseToml(text);
            const fetchedDeps = yield fetcher_1.fetchCrateVersions(dependencies, !!shouldListPreRels, githubToken, isLocalRegistery);
            decorator_1.default(editor, fetchedDeps);
        }
        catch (e) {
            console.error(e);
            indicators_1.statusBarItem.setText("Cargo.toml is not valid!");
            if (decorator_1.decorationHandle) {
                decorator_1.decorationHandle.dispose();
            }
        }
    }))();
}
function listener(editor) {
    if (editor) {
        const { fileName } = editor.document;
        if (fileName.toLocaleLowerCase().endsWith("cargo.toml")) {
            commands_1.status.inProgress = true;
            commands_1.status.replaceItems = [];
            indicators_1.statusBarItem.show();
            parseAndDecorate(editor);
        }
        else {
            indicators_1.statusBarItem.hide();
        }
        commands_1.status.inProgress = false;
    }
    else {
        console.log("No active editor found.");
    }
}
exports.default = listener;
//# sourceMappingURL=listener.js.map