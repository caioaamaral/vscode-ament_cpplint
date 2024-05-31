/**
 * LINTER.TS
 * ---------
 * Parses cpplint output and adds linting hints to files.
 */

import * as vscode from 'vscode';
import { runOnDocument } from './runner';
import { debug } from './logger';


function cpplintSeverityToDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
        case 'error':
            return vscode.DiagnosticSeverity.Error;
        case 'warning':
            return vscode.DiagnosticSeverity.Warning;
        default:
            return vscode.DiagnosticSeverity.Information;
    }
}

export function analysisResult(diagnosticCollection: vscode.DiagnosticCollection, result: string) {
    debug(`[ament-cpplint] analysing:\n ${result}`);
    diagnosticCollection.clear();
    const lines = result.split('\n');
    
    let fileData: { [key: string]: RegExpExecArray[] } = {};
    lines.forEach(line => {
        // 1 = path, 2 = line, 3 = error message, 4 = number?
        const regex = /^(.*):([0-9]+):(.*\s+\[.*\])\s+\[([0-9]+)\]/gm;
        const matches = regex.exec(line);
        if (matches) {
            debug(`[ament-cpplint] GOT MATCH!`)
            const fileName = matches[1]
            if (!(fileName in fileData)) fileData[fileName] = [];

            fileData[fileName].push(matches)
        }
    });

    for (let fileName in fileData) {
        vscode.workspace.openTextDocument(fileName).then((doc: vscode.TextDocument) => {
            let diagnostics: vscode.Diagnostic[] = [];
            for (let index = 0; index < fileData[fileName].length; index++) {
                let array = fileData[fileName][index];
                let line = Number(array[2]) -1; // vscode is weird
                let message = array[3];

                let l = doc.lineAt(line);
                let r = new vscode.Range(line, 0, line, l.text.length);
                let d = new vscode.Diagnostic(r, `${message}`, vscode.DiagnosticSeverity.Error);
                d.source = 'ament-cpplint';
                diagnostics.push(d);
            }
            diagnosticCollection.set(doc.uri, diagnostics);
        });
    }
}

export async function Lint(diagnosticCollection: vscode.DiagnosticCollection) {
    // const cpplintOutput = await runOnDocument();
    // analysisResult(diagnosticCollection, cpplintOutput)
}
