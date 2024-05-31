'use strict'
import * as vscode from "vscode"

import { debug } from './logger';

const supportedLanguages = ["c", "cpp"];

export function isSupportedLanguage(file: vscode.TextDocument): boolean {
    debug(`file.language.id: ${file.languageId} is cpp? ${file.languageId == supportedLanguages[1]}`)
    return supportedLanguages.includes(file.languageId);
}

export function getInfo(file: vscode.TextDocument) {
    debug(`language.id: ${file.languageId}`);
}

export async function getTargetedFilesFromWorkspace(workspace: typeof vscode.workspace) {
    // vscode.
    const targetFiles = await workspace.findFiles("**/*.{c,cpp,h,hpp}")
    return targetFiles.map(file => {
        return file.fsPath
    })
}