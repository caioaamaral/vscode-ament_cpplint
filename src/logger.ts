'use strict';
import vscode from 'vscode';

export const debugChannel = vscode.window.createOutputChannel('DEBUG');
debugChannel.show();

const _info_ = "INFO";
const _debug_ = "DEBUG";
const _error_ = "ERROR";
const prefix = (level: string) => `[ament-cpplint.${level}]`

export function debug(line): void {
    debugChannel.appendLine(prefix(_debug_) + line);
}

