// Семантическая подсветка шаблонов
import * as vscode from 'vscode';
import * as path from 'path';
import { getAllTemplateVariables } from '../core/templateUtils';
import { readConfig } from '../core/config';

function isInTemplatesDir(filePath: string, templatesDir: string): boolean {
    const rel = path.relative(templatesDir, filePath);
    return !rel.startsWith('..') && !path.isAbsolute(rel);
}

export function registerTemplateSemanticHighlight(context: vscode.ExtensionContext) {
    const legend = new vscode.SemanticTokensLegend(['bracket', 'variable', 'modifier']);
    const disposable = vscode.languages.registerDocumentSemanticTokensProvider(
        { pattern: '**' }, // теперь на все файлы
        {
            provideDocumentSemanticTokens(document: any) {
                const config = readConfig();
                const templatesPath = config.templatesPath || 'templates';
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (!workspaceFolders || workspaceFolders.length === 0) return;
                const templatesDir = path.join(workspaceFolders[0].uri.fsPath, templatesPath);
                // Проверяем, что файл в папке шаблонов
                if (!isInTemplatesDir(document.uri.fsPath, templatesDir)) {
                    return;
                }
                const tokens: number[] = [];
                for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
                    const line = document.lineAt(lineNum).text;
                    // Ищем все {{variable.modifier}} или {{variable}} или {{variable.}}
                    const reg = /({{)|(}})|{{\s*([a-zA-Z0-9_]+)(?:\.(\w*))?\s*}}/g;
                    let match;
                    while ((match = reg.exec(line)) !== null) {
                        if (match[1]) {
                            // {{
                            tokens.push(lineNum, match.index, 2, 0, 0); // bracket
                        } else if (match[2]) {
                            // }}
                            tokens.push(lineNum, match.index, 2, 0, 0); // bracket
                        } else if (match[3]) {
                            // variable (имя)
                            const varStart = match.index + 2 + line.slice(match.index + 2).search(/\S/); // после {{
                            tokens.push(lineNum, varStart, match[3].length, 1, 0); // variable
                            if (typeof match[4] === 'string') {
                                // Если есть точка, но модификатор не введён ({{name.}})
                                if (match[4] === '') {
                                    // Подсвечиваем только точку как variable
                                    const dotStart = varStart + match[3].length;
                                    tokens.push(lineNum, dotStart, 1, 1, 0); // variable (точка)
                                } else if (match[4]) {
                                    // .modifier
                                    const modStart = varStart + match[3].length + 1; // +1 за точку
                                    tokens.push(lineNum, modStart, match[4].length, 2, 0); // modifier
                                }
                            }
                        }
                    }
                }
                return new vscode.SemanticTokens(new Uint32Array(tokens));
            }
        },
        legend
    );
    context.subscriptions.push(disposable);
    return disposable;
} 