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

export function getConfigPath(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return undefined;
    return path.join(folders[0].uri.fsPath, 'mycodegenerate.json');
}

export function readConfig(): MyTemplateGeneratorConfig {
    const configPath = getConfigPath();
    if (configPath && fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(raw);
    }
    // Значения по умолчанию
    return {
        templatesPath: 'templates',
        overwriteFiles: false,
        inputMode: 'inputBox',
        language: 'en',
    };
}

export function writeConfig(config: MyTemplateGeneratorConfig) {
    const configPath = getConfigPath();
    if (!configPath) return;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
} 