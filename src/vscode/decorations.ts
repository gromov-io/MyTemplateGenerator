// Декорации и диагностика шаблонов
import * as vscode from 'vscode';
import * as path from 'path';
import { getAllTemplateVariables } from '../core/templateUtils';
import { readConfig } from '../core/config';

const bracketDecoration = vscode.window.createTextEditorDecorationType({
    color: '#43A047', // зелёный для скобок
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    fontWeight: 'bold'
});
const variableDecoration = vscode.window.createTextEditorDecorationType({
    color: '#FF9800', // оранжевый для имени переменной
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    fontWeight: 'bold'
});
const modifierDecoration = vscode.window.createTextEditorDecorationType({
    color: '#00ACC1', // бирюзовый для модификатора
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    fontWeight: 'bold'
});

function isInTemplatesDir(filePath: string, templatesDir: string): boolean {
    const rel = path.relative(templatesDir, filePath);
    return !rel.startsWith('..') && !path.isAbsolute(rel);
}

function updateTemplateDecorations(editor: vscode.TextEditor) {
    if (!editor) return;
    const config = readConfig();
    const templatesPath = config.templatesPath || 'templates';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;
    const templatesDir = path.join(workspaceFolders[0].uri.fsPath, templatesPath);
    if (!isInTemplatesDir(editor.document.uri.fsPath, templatesDir)) return;
    const brackets: vscode.DecorationOptions[] = [];
    const variables: vscode.DecorationOptions[] = [];
    const modifiers: vscode.DecorationOptions[] = [];
    for (let lineNum = 0; lineNum < editor.document.lineCount; lineNum++) {
        const line = editor.document.lineAt(lineNum).text;
        // Ищем все {{variable.modifier}} или {{variable}}
        const reg = /{{\s*([a-zA-Z0-9_]+)(?:\.([a-zA-Z0-9_]+))?\s*}}/g;
        let match;
        while ((match = reg.exec(line)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            // Скобки {{ и }}
            brackets.push({
                range: new vscode.Range(lineNum, start, lineNum, start + 2)
            });
            brackets.push({
                range: new vscode.Range(lineNum, end - 2, lineNum, end)
            });
            // Имя переменной
            const varStart = start + 2 + line.slice(start + 2).search(/\S/); // после {{
            variables.push({
                range: new vscode.Range(lineNum, varStart, lineNum, varStart + match[1].length)
            });
            // Модификатор (если есть)
            if (match[2]) {
                const modStart = varStart + match[1].length + 1; // +1 за точку
                modifiers.push({
                    range: new vscode.Range(lineNum, modStart, lineNum, modStart + match[2].length)
                });
            }
        }
    }
    editor.setDecorations(bracketDecoration, brackets);
    editor.setDecorations(variableDecoration, variables);
    editor.setDecorations(modifierDecoration, modifiers);
}

export function registerTemplateDecorations(context: vscode.ExtensionContext) {
    function decorateActiveEditor() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            updateTemplateDecorations(editor);
        }
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) decorateActiveEditor();
        }),
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
            if (editor) updateTemplateDecorations(editor);
        })
    );
    // Инициализация при активации
    setTimeout(() => {
        vscode.window.visibleTextEditors.forEach(editor => updateTemplateDecorations(editor));
    }, 300);
}

export function decorateActiveEditor() {
    // Логика декорирования активного редактора
    // ...
}

export function clearDiagnosticsForEditor(editor: vscode.TextEditor, templatesDir: string) {
    // Очистка диагностик для редактора
    // ...
}

export function clearDiagnosticsForTemplates(context: vscode.ExtensionContext) {
    // Очистка диагностик для всех шаблонов
    // ...
} 