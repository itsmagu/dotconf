"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const child_process_1 = require("child_process");
const run_in_terminal_1 = require("run-in-terminal");
const path_1 = require("path");
const fs_1 = require("fs");
const glob = require('glob');
const path = require('path');
const fs = require('fs');
let outputChannel;
let terminal = null;
const runningProcesses = new Map();
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    registerCommands(context);
    outputChannel = vscode.window.createOutputChannel('tauri');
    context.subscriptions.push(outputChannel);
    vscode.window.onDidCloseTerminal(closedTerminal => {
        if (terminal === closedTerminal) {
            terminal = null;
        }
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (terminal) {
        terminal.dispose();
    }
}
exports.deactivate = deactivate;
function registerCommands(context) {
    context.subscriptions.push(vscode.commands.registerCommand('tauri.init', runTauriInit), vscode.commands.registerCommand('tauri.deps-install', runTauriDepsInstall), vscode.commands.registerCommand('tauri.deps-update', runTauriDepsUpdate), vscode.commands.registerCommand('tauri.dev', runTauriDev), vscode.commands.registerCommand('tauri.build', runTauriBuild), vscode.commands.registerCommand('tauri.build-debug', runTauriBuildDebug));
}
function runTauriInit() {
    __pickProjectAndRunTauriScript(projectPath => {
        let installCommand;
        let onInstall = () => { };
        if (__isVueCliApp(projectPath)) {
            installCommand = 'vue add tauri';
        }
        else {
            installCommand = __usePnpm(projectPath)
                ? 'pnpm add -D @tauri-apps/cli'
                : __useYarn(projectPath)
                    ? 'yarn add @tauri-apps/cli --dev'
                    : `${__getNpmBin()} install @tauri-apps/cli --save-dev`;
            onInstall = () => {
                const packageJson = JSON.parse(fs.readFileSync(`${projectPath}/package.json`));
                if (!packageJson.scripts) {
                    packageJson.scripts = {};
                }
                if (!packageJson.scripts['tauri']) {
                    packageJson.scripts['tauri'] = 'tauri';
                    fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(packageJson, null, 4));
                }
                __runTauriScript(['init'], { cwd: projectPath, noOutputWindow: true });
            };
        }
        const [command, ...args] = (installCommand).split(' ');
        __runScript(command, args, { cwd: projectPath, noOutputWindow: command === 'vue' }).then(onInstall);
    }, () => {
        const paths = __getNpmProjectsPaths();
        return paths.filter(p => {
            return !fs.existsSync(path.join(p, 'src-tauri'));
        });
    });
}
function runTauriDepsInstall() {
    const projectPaths = __getTauriProjectsPaths();
    if (projectPaths.length === 0) {
        vscode.window.showErrorMessage('Tauri project not found');
        return;
    }
    __runTauriScript(['deps', 'install'], { cwd: projectPaths[0] });
}
function runTauriDepsUpdate() {
    const projectPaths = __getTauriProjectsPaths();
    if (projectPaths.length === 0) {
        vscode.window.showErrorMessage('Tauri project not found');
        return;
    }
    __runTauriScript(['deps', 'update'], { cwd: projectPaths[0] });
}
function runTauriDev() {
    __pickProjectAndRunTauriScript(projectPath => __runTauriScript(['dev'], { cwd: projectPath }));
}
function runTauriBuild() {
    __pickProjectAndRunTauriScript(projectPath => __runTauriScript(['build'], { cwd: projectPath }));
}
function runTauriBuildDebug() {
    __pickProjectAndRunTauriScript(projectPath => __runTauriScript(['build', '--debug'], { cwd: projectPath }));
}
function __isVueCliApp(cwd) {
    var _a;
    const packageJson = __getPackageJson(cwd);
    return '@vue/cli-service' in ((_a = packageJson === null || packageJson === void 0 ? void 0 : packageJson.devDependencies) !== null && _a !== void 0 ? _a : {});
}
function __getPackageJson(cwd) {
    const packagePath = (0, path_1.join)(cwd, 'package.json');
    if ((0, fs_1.existsSync)(packagePath)) {
        const packageStr = (0, fs_1.readFileSync)(packagePath).toString();
        return JSON.parse(packageStr);
    }
    else {
        return null;
    }
}
function __getNpmProjectsPaths() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
        return [];
    }
    const paths = [];
    for (const folder of folders) {
        const npmProjectRoots = glob.sync(folder.uri.fsPath + '/**/package.json')
            .map((p) => path.dirname(p));
        paths.push(...npmProjectRoots.filter(p => !p.includes('node_modules')));
    }
    if (paths.length === 0) {
        return folders.map(f => f.uri.fsPath);
    }
    return paths;
}
function __getTauriProjectsPaths() {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders) {
        return [];
    }
    const paths = [];
    for (const folder of folders) {
        const tauriProjectRoots = glob.sync(folder.uri.fsPath + '/**/src-tauri')
            .map((p) => path.dirname(p));
        paths.push(...tauriProjectRoots.filter(p => !p.includes('node_modules')));
    }
    return paths;
}
function __isMultiRoot() {
    if (vscode.workspace.workspaceFolders) {
        return vscode.workspace.workspaceFolders.length > 1;
    }
    return false;
}
function __runCommandInTerminal(command, args, cwd) {
    return (0, run_in_terminal_1.runInTerminal)(command, args, { cwd, env: process.env }).then(process => {
        return new Promise((resolve, reject) => {
            process.on('exit', code => {
                if (code) {
                    reject();
                }
                else {
                    resolve();
                }
            });
        });
    });
}
function __runCommandInIntegratedTerminal(command, args, cwd) {
    if (!terminal) {
        terminal = vscode.window.createTerminal('tauri');
    }
    terminal.show();
    if (cwd) {
        // Replace single backslash with double backslash.
        const textCwd = cwd.replace(/\\/g, '\\\\');
        terminal.sendText(['cd', `"${textCwd}"`].join(' '));
    }
    terminal.sendText(command + ' ' + args.join(' '));
    return Promise.resolve();
}
function __runCommandInOutputWindow(command, args, cwd) {
    return new Promise((resolve, reject) => {
        var _a, _b;
        const cmd = command + ' ' + args.join(' ');
        const p = (0, child_process_1.exec)(cmd, { cwd, env: process.env });
        runningProcesses.set(p.pid, { process: p, cmd: cmd });
        (_a = p.stderr) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
            outputChannel.append(data);
        });
        (_b = p.stdout) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            outputChannel.append(data);
        });
        p.on('exit', (_code, signal) => {
            runningProcesses.delete(p.pid);
            if (signal === 'SIGTERM') {
                outputChannel.appendLine('Successfully killed process');
                outputChannel.appendLine('-----------------------');
                outputChannel.appendLine('');
                reject();
            }
            else {
                outputChannel.appendLine('-----------------------');
                outputChannel.appendLine('');
                resolve();
            }
        });
        outputChannel.show(true);
    });
}
function __useTerminal() {
    return vscode.workspace.getConfiguration('npm')['runInTerminal'];
}
function __usePnpm(projectPath) {
    return fs.existsSync(path.join(projectPath, 'pnpm-lock.yaml'));
}
function __useYarn(projectPath) {
    return fs.existsSync(path.join(projectPath, 'yarn.lock'));
}
function __getNpmBin() {
    return vscode.workspace.getConfiguration('npm')['bin'] || 'npm';
}
function __getPackageManagerBin(projectPath) {
    return __usePnpm(projectPath) ? 'pnpm' : __useYarn(projectPath) ? 'yarn' : __getNpmBin();
}
function __runScript(command, args, options) {
    vscode.window.showInformationMessage(`Running \`${command} ${args.join(' ')}\` in ${options.cwd}`);
    return vscode.workspace.saveAll().then(() => {
        if (__useTerminal() || options.noOutputWindow) {
            if (typeof vscode.window.createTerminal === 'function') {
                return __runCommandInIntegratedTerminal(command, args, options.cwd);
            }
            else {
                return __runCommandInTerminal(command, args, options.cwd);
            }
        }
        else {
            outputChannel.clear();
            return __runCommandInOutputWindow(command, args, options.cwd);
        }
    });
}
function __runTauriScript(args, options) {
    if (__isVueCliApp(options.cwd)) {
        const [cmd, ...cmgArgs] = args;
        __runScript(__getPackageManagerBin(options.cwd), ['run', `tauri:${cmd === 'dev' ? 'serve' : cmd}`, ...cmgArgs], options);
    }
    else {
        __runScript(__getPackageManagerBin(options.cwd), ['run', 'tauri', ...args], options);
    }
}
function __pickProjectAndRunTauriScript(runner, getProjectPathsFn = __getTauriProjectsPaths) {
    const tauriProjectsPaths = getProjectPathsFn();
    const projectList = [];
    for (const p of tauriProjectsPaths) {
        let label = path.basename(p);
        if (__isMultiRoot()) {
            const root = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(p));
            if (root && root.name !== label) {
                label = `${root.name}: ${label}`;
            }
        }
        projectList.push({
            label,
            projectPath: p
        });
    }
    if (projectList.length === 0) {
        vscode.window.showErrorMessage('Tauri project not found');
        return;
    }
    if (projectList.length === 1) {
        runner(projectList[0].projectPath);
    }
    else {
        vscode.window.showQuickPick(projectList).then(project => {
            if (project) {
                runner(project.projectPath);
            }
        });
    }
}
//# sourceMappingURL=extension.js.map