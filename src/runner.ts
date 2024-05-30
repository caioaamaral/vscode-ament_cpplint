import { spawnSync } from "child_process";
import * as vscode from 'vscode';
// import { ConfigManager } from "./configuration";
import * as path from 'path';
import * as which from "which"


const supported_languages = ["c", "c++"]

let cpplint_path
which("cpplint", (err, cmd_path) => {
    if (err) {
        console.log("You fucked, no cpplint")
        return;
    }

    cpplint_path = cmd_path

})

export function runOnFile() {
    if (vscode.window.activeTextEditor == undefined) {
        return  ""
    }
    let activedoc = vscode.window.activeTextEditor.document;
    let filename = activedoc.fileName;
    let workspacefolder = vscode.workspace.getWorkspaceFolder(activedoc.uri)
    let workspaces = null;
    if (workspacefolder != undefined) {
        workspaces = [workspacefolder.uri.fsPath]
    }

    if (activedoc.languageId in supported_languages) {
        let result = runCppLint(filename, workspaces, false);
        return result;
    } else {
        return "";
    }
}

export function runOnWorkspace() {
    let workspaces: string[] = [];
    for (let folder of vscode.workspace.workspaceFolders) {
        workspaces = workspaces.concat(folder.uri.fsPath)
    }
    let result = runCppLint(null, workspaces, true);
    return result;
}

export function runCppLint(filename: string, workspaces: string[], enableworkspace: boolean) {
    let cpplint = cpplint_path;
    let output = lint(cpplint, [filename]);
    // let end = 'Ament-CppLint ended: ' + new Date().toString();
    return output.join('\n');
}

function lint(exec: string, params: string[]) {
    let result = spawnSync(exec, params)
    let stdout = result.stdout;
    let stderr = result.stderr;
    let out = [result.stdout, result.stderr]
    return out;
}
