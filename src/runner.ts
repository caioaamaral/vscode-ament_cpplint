'use strict';

import { spawnSync } from "child_process";
import * as vscode from 'vscode';
import which from "which"

import * as helpers from "./helpers"
import { debug } from "./logger";


const supported_languages = ["c", "c++", "h", "hpp"];

export async function runOnDocument(document: vscode.TextDocument) {
    let filename = document.fileName;

    let result = await runCppLint(filename);
    return result;
}

export async function runOnWorkspace() {
    const allResults: Array<Promise<string>> = Array();
    const files = await helpers.getTargetedFilesFromWorkspace(vscode.workspace)

    // let allFiles = await vscode.workspace.findFiles("**/*.{c,cpp,h,hpp}").then(files => files.map(file => `\n-- ${file}`));
    // debug(`[runner.runOnWorkspace]: We have ${allFiles.length} files: ${allFiles}`);
    debug(`[runner.runOnWorkspace]: Got ${files.length} valid files`);

    files.forEach(async file => {
        const result = runCppLint(file);
        debug(`[runner.runOnWorkspace]: Got new result: ${result}`);
        debug(`[runner.runOnWorkspace]: We have now ${allResults.length} results`);
        allResults.push(result);
    });
    
    debug(`[runner.runOnWorkspace]: Got ${allResults.length} outputs from ament_cpplint`);
    return allResults;
}

export async function runCppLint(filename: string) {
    const cpplint_path: string = await which("ament_cpplint");
    // debug(`[runner.runCppLint]: Running ament_lint for ${filename}`);
    // console.log(`[ament-cpplint] Found it! cpplint_path is: ${cpplint_path}`);
    let cpplint = cpplint_path;
    let output = lint(cpplint, [filename]);
    // debug(`[runner.runCppLint]: Got output: \n--> ${output}`);
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
