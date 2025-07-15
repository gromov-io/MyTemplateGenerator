// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { getAllTemplateVariables, copyTemplateWithVars } from './core/templateUtils';
import { buildVarsObject, collectUserVars } from './core/vars';
import { readConfig, writeConfig } from './core/config';
import { showConfigWebview } from './webview/configWebview';
import { showTemplateAndVarsWebview } from './webview/templateVarsWebview';
import { registerTemplateCompletionAndHighlight } from './vscode/completion';
import { registerTemplateSemanticHighlight } from './vscode/semanticHighlight';
import { registerTemplateDecorations, clearDiagnosticsForTemplates } from './vscode/decorations';
import { I18N_DICTIONARIES, pickTemplate } from './core/i18n';

// Регистрируем кастомный helper для Handlebars
Handlebars.registerHelper('getVar', function(this: Record<string, any>, varName: string, modifier?: string, options?: any) {
    if (!varName) return '';
    const vars = this;
    if (modifier && typeof modifier === 'string') {
        if (vars[`${varName}.${modifier}`]) return vars[`${varName}.${modifier}`];
        if (vars[varName] && typeof vars[varName] === 'object' && vars[varName][modifier]) {
            return vars[varName][modifier];
        }
        return '';
    }
    if (vars[varName]) {
        if (typeof vars[varName] === 'object' && vars[varName].value) return vars[varName].value;
        return vars[varName];
    }
    return '';
});

// === Декораторы для шаблонных переменных ===


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('mytemplategenerator.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from myTemplateGenerator!');
	});

	const createFromTemplate = vscode.commands.registerCommand('mytemplategenerator.createFromTemplate', async (uri: vscode.Uri) => {
		const config = readConfig();
		const dict = I18N_DICTIONARIES[config.language || 'ru'] || I18N_DICTIONARIES['ru'];
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage(dict.noFolders);
			return;
		}
		const templatesDir = path.join(workspaceFolders[0].uri.fsPath, config.templatesPath);
		if (!fs.existsSync(templatesDir) || !fs.statSync(templatesDir).isDirectory()) {
			vscode.window.showErrorMessage(`${dict.templatesNotFound} ${templatesDir}`);
			return;
		}
		let template: string | undefined;
		let userVars: Record<string, string> | undefined;
		if (config.inputMode === 'webview') {
			vscode.window.showInformationMessage('[DEBUG] Вызов webview создания шаблона...');
			const result: { template: string, vars: Record<string, string> } | undefined = await showTemplateAndVarsWebview(context, templatesDir, uri.fsPath, config.language || 'ru');
			if (!result) {
				vscode.window.showInformationMessage('[DEBUG] Webview был закрыт или не вернул результат');
				return;
			}
			template = result.template;
			userVars = result.vars;
		} else {
			vscode.window.showInformationMessage('[DEBUG] Вызов выбора шаблона через quickPick...');
			template = await pickTemplate(templatesDir);
			if (!template) {
				vscode.window.showInformationMessage('[DEBUG] Шаблон не выбран');
				return;
			}
			const templateDir = path.join(templatesDir, template);
			const allVars = getAllTemplateVariables(templateDir);
			const baseVars = Array.from(allVars);
			userVars = await collectUserVars(new Set(baseVars));
		}
		if (!template || !userVars) {
			vscode.window.showInformationMessage('[DEBUG] Не выбраны шаблон или переменные');
			return;
		}
		const templateDir = path.join(templatesDir, template);
		try {
			const vars = buildVarsObject(userVars);
			vscode.window.showInformationMessage('[DEBUG] Копирование шаблона...');
			copyTemplateWithVars(templateDir, uri.fsPath, vars, config.overwriteFiles, dict, template);
		} catch (e: any) {
			vscode.window.showErrorMessage(`${dict.createError}: ${e.message}`);
		}
	});

	context.subscriptions.push(
		disposable,
		createFromTemplate,
		vscode.commands.registerCommand('mytemplategenerator.configure', async () => {
			await showConfigWebview(context);
		})
	);
	registerTemplateCompletionAndHighlight(context);
	let semanticHighlightDisposable: vscode.Disposable | undefined = registerTemplateSemanticHighlight(context);
	registerTemplateDecorations(context); // <--- Добавить регистрацию декораторов
	clearDiagnosticsForTemplates(context); // <--- Очищаем diagnostics для шаблонов

	// === Отслеживание изменений конфига ===
	// (Удалено: теперь все настройки глобальные через VSCode settings)
}

// This method is called when your extension is deactivated
export function deactivate() {}
