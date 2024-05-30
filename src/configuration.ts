'use strict';

import * as vscode from 'vscode';
import { platform } from 'os';
import { join } from 'path';
import { each, isNull } from 'lodash';
import { existsSync } from 'fs';

export class ConfigManager {

    private static _instance: ConfigManager = new ConfigManager();

    private config: { [key: string]: any } = {};

    constructor() {
        if (ConfigManager._instance) {
            throw new Error("Error: Instantiation failed: Use ConfigManager.getInstance() instead of new.");
        }
        ConfigManager._instance = this;
    }

    public static getInstance(): ConfigManager {
        return ConfigManager._instance;
    }

    public getConfig(): { [key: string]: any } {
        return this.config;
    }

    // private findCpplintPath(settings: vscode.WorkspaceConfiguration): string {
    //     let cpplintPath: string|null = settings.get('cpplintPath', null);

    //     if (isNull(cpplintPath)) {
    //         let p = platform();
    //         if (p === 'win32') {
    //             // TODO: add win32 and win64 cpplint path
    //         }
    //         else if (p === 'linux' || p === 'darwin') {
    //             let attempts = ['/usr/local/bin/cpplint'];
    //             for (let index = 0; index < attempts.length; index++) {
    //                 if (existsSync(attempts[index])) {
    //                     cpplintPath = attempts[index];
    //                     break;
    //                 }
    //             }
    //         }
    //     }

    //     return cpplintPath as string;
    // }

    public isSingleMode(): boolean {
        return true;
    }

    public isSupportLanguage(language: string): boolean {
        return true;
    }

    public initialize() {
        this.config = {};

        return this.config;
    }
}