'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as an from './runner';
import { Lint, analysisResult } from './lint';
import * as helpers from './helpers'
import { debug } from './logger'

let outputChannel: vscode.OutputChannel;
let timer: NodeJS.Timeout;

let diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('ament-cpplint');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Ament-CppLint');
    outputChannel.show(true);
    
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ament-cpplint" is now active!');

    loadConfigure();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    let single = vscode.commands.registerCommand('ament-cpplint.check-file', checkActiveFile);
    context.subscriptions.push(single);

    let whole = vscode.commands.registerCommand('ament-cpplint.check-workspace', checkActiveWorkspace);
    context.subscriptions.push(whole);

    context.subscriptions.push(this);
    // vscode.workspace.onDidChangeConfiguration((()=>loadConfigure()).bind(this));
    vscode.workspace.onDidChangeConfiguration(this.loadConfigure, this);
}

async function checkActiveFile(): Promise<void> {
    var edit = vscode.window.activeTextEditor;
    if (edit == undefined) {
        return Promise.reject("no edit opened");
    }
    
    const activeDoc = vscode.window.activeTextEditor.document;
    
    if (!helpers.isSupportedLanguage(activeDoc)) {
        debug(`${activeDoc.fileName} type, which is ${activeDoc.languageId}, is not supported`)
        return;
    }

    let start = 'Ament-CppLint started: ' + new Date().toString();
    outputChannel.appendLine(start);
    
    let cpplintOutput = await an.runOnDocument(activeDoc);
    console.log(`[ament-cpplint] linter output: ${cpplintOutput}`)
    
    debug(`[ament-cpplint] analysisResult start:`)
    analysisResult(diagnosticCollection, cpplintOutput)
    debug(`[ament-cpplint] analysisResult end:`)

    let end = 'Ament-CppLint ended: ' + new Date().toString();
    outputChannel.appendLine(end);

    return Promise.resolve()
}

async function checkActiveWorkspace(): Promise<void> {
    const start = 'Ament-CppLint[checkActiveWorkspace] started: ' + new Date().toString();
    outputChannel.appendLine(start);

    const results = await an.runOnWorkspace();
    debug(`.[checkActiveWorkspace]: Got ${results.length} results`)

    results.forEach(async (p_result: Promise<string>) => {
        const result = await p_result;
        analysisResult(diagnosticCollection, result)
        outputChannel.appendLine(result);
    });

    let end = 'Ament-CppLint ended: ' + new Date().toString();
    outputChannel.appendLine(end);

    return Promise.resolve()
}

// this method is called when your extension is deactivated
export function deactivate() {
    clearTimeout(timer)
    vscode.window.showInformationMessage("Cpplint deactivated")
}

function doLint() {
    if (vscode.window.activeTextEditor) {
        let language = vscode.window.activeTextEditor.document.languageId
        if (language in ["c", "cpp"]) {
            Lint(diagnosticCollection);
        }
    }
    clearTimeout(timer)
}

function loadConfigure() {    
    vscode.workspace.onDidSaveTextDocument((() => {
        timer = global.setTimeout(doLint, 500);
    }).bind(this));
}
