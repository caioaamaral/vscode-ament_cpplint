'use strict';

import { spawnSync } from "child_process";
import * as vscode from 'vscode';
import which from "which"


const supported_languages = ["c", "c++", "h", "hpp"];

export async function runOnFile() {
    let activedoc = vscode.window.activeTextEditor.document;
    let filename = activedoc.fileName;

    let result = await runCppLint(filename, false);
    return result;
}

export function runOnWorkspace() {
    let workspaces: string[] = [];
    for (let folder of vscode.workspace.workspaceFolders) {
        workspaces = workspaces.concat(folder.uri.fsPath)
    }
    let result = runCppLint(null, true);
    return result;
}

export async function runCppLint(filename: string, enableworkspace: boolean) {
    const cpplint_path: string = await which("ament_cpplint");
    // console.log(`[ament-cpplint] Found it! cpplint_path is: ${cpplint_path}`);
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
