// Регистрация и обработка автодополнения шаблонов
import * as vscode from 'vscode';
import * as path from 'path';
import { getAllTemplateVariables, CASE_MODIFIERS } from '../core/templateUtils';
import { readConfig } from '../core/config';
import * as fs from 'fs';

function isInTemplatesDir(filePath: string, templatesDir: string): boolean {
    const rel = path.relative(templatesDir, filePath);
    return !rel.startsWith('..') && !path.isAbsolute(rel);
}

export function registerTemplateCompletionAndHighlight(context: vscode.ExtensionContext) {
    const completionProvider = {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
            const config = readConfig();
            const templatesPath = config.templatesPath || 'templates';
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) return;
            const templatesDir = path.join(workspaceFolders[0].uri.fsPath, templatesPath);
            if (!isInTemplatesDir(document.uri.fsPath, templatesDir)) {
                return undefined;
            }
            const line = document.lineAt(position).text;
            const textBefore = line.slice(0, position.character);
            const match = /{{\s*([\w]+)?(?:\.([\w]*))?[^}]*$/.exec(textBefore);
            if (!match) return undefined;
            const allVars = getAllTemplateVariables(templatesDir);
            const items = [];
            if (match[2] !== undefined) {
                for (const mod of Object.keys(CASE_MODIFIERS)) {
                    if (!match[2] || mod.startsWith(match[2])) {
                        const item = new vscode.CompletionItem(mod, vscode.CompletionItemKind.EnumMember);
                        item.insertText = mod;
                        items.push(item);
                    }
                }
            } else {
                for (const v of allVars) {
                    if (!match[1] || v.startsWith(match[1])) {
                        const item = new vscode.CompletionItem(v, vscode.CompletionItemKind.Variable);
                        item.insertText = v;
                        items.push(item);
                    }
                }
            }
            return items;
        }
    };
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            '*',
            completionProvider,
            '{', '.'
        )
    );
} 