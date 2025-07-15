// Работа с конфигом расширения
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

export interface MyTemplateGeneratorConfig {
    templatesPath: string;
    overwriteFiles: boolean;
    inputMode: 'webview' | 'inputBox';
    language?: string;
}

export function readConfig(): MyTemplateGeneratorConfig {
    const config = vscode.workspace.getConfiguration('myTemplateGenerator');
    return {
        templatesPath: config.get<string>('templatesPath', '.templates'),
        overwriteFiles: config.get<boolean>('overwriteFiles', false),
        inputMode: config.get<'webview' | 'inputBox'>('inputMode', 'webview'),
        language: config.get<string>('language', 'en'),
    };
}

export async function writeConfig(newConfig: Partial<MyTemplateGeneratorConfig>) {
    const config = vscode.workspace.getConfiguration('myTemplateGenerator');
    if (newConfig.templatesPath !== undefined) {
        await config.update('templatesPath', newConfig.templatesPath, vscode.ConfigurationTarget.Global);
    }
    if (newConfig.overwriteFiles !== undefined) {
        await config.update('overwriteFiles', newConfig.overwriteFiles, vscode.ConfigurationTarget.Global);
    }
    if (newConfig.inputMode !== undefined) {
        await config.update('inputMode', newConfig.inputMode, vscode.ConfigurationTarget.Global);
    }
    if (newConfig.language !== undefined) {
        await config.update('language', newConfig.language, vscode.ConfigurationTarget.Global);
    }
} 