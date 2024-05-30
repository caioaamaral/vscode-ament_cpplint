'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as an from './runner';
import { Lint, analysisResult } from './lint';

let outputChannel: vscode.OutputChannel;
export let debugChannel: vscode.OutputChannel;
let timer: NodeJS.Timeout;

let diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('ament-cpplint');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Ament-CppLint');
    debugChannel = vscode.window.createOutputChannel('DEBUG');
    outputChannel.show(true);
    debugChannel.show();
    
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ament-cpplint" is now active!');

    loadConfigure();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json

    let single = vscode.commands.registerCommand('ament-cpplint.runAnalysis', runAnalysis);
    context.subscriptions.push(single);

    let whole = vscode.commands.registerCommand('ament-cpplint.runWholeAnalysis', runWholeAnalysis);
    context.subscriptions.push(whole);

    vscode.workspace.onDidChangeConfiguration((()=>loadConfigure()).bind(this));
}

async function runAnalysis(): Promise<void> {
    var edit = vscode.window.activeTextEditor;
    if (edit == undefined) {
        return Promise.reject("no edit opened");
    }
    
    let start = 'Ament-CppLint started: ' + new Date().toString();
    outputChannel.appendLine(start);
    
    let cpplintOutput = await an.runOnFile();
    console.log(`[ament-cpplint] linter output: ${cpplintOutput}`)
    
    debugChannel.appendLine(`[ament-cpplint] analysisResult start:`)
    analysisResult(diagnosticCollection, cpplintOutput)
    debugChannel.appendLine(`[ament-cpplint] analysisResult end:`)

    outputChannel.appendLine(cpplintOutput);

    let end = 'Ament-CppLint ended: ' + new Date().toString();
    outputChannel.appendLine(end);

    return Promise.resolve()
}

async function runWholeAnalysis(): Promise<void> {
    outputChannel.show();
    outputChannel.clear();

    let start = 'Ament-CppLint started: ' + new Date().toString();
    outputChannel.appendLine(start);

    let result = await an.runOnWorkspace();
    outputChannel.appendLine(result);

    let end = 'Ament-CppLint ended: ' + new Date().toString();
    outputChannel.appendLine(end);

    // vscode.window.showInformationMessage(edit.document.uri.fsPath)
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

function startLint2() {
    timer = global.setTimeout(doLint, 500);
}

function loadConfigure() {
    startLint2();
    vscode.window.onDidChangeActiveTextEditor((() => startLint2()).bind(this));
    vscode.workspace.onDidSaveTextDocument((() => startLint2()).bind(this));
}
