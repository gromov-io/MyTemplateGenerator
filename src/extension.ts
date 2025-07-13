// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

async function getTemplatesDir(workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined): Promise<string | undefined> {
	if (!workspaceFolders) return undefined;
	for (const folder of workspaceFolders) {
		const candidate = path.join(folder.uri.fsPath, 'templates');
		if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
			return candidate;
		}
	}
	return undefined;
}

async function pickTemplate(templatesDir: string): Promise<string | undefined> {
	const templates = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());
	if (templates.length === 0) {
		vscode.window.showWarningMessage('В папке templates нет шаблонов.');
		return undefined;
	}
	return vscode.window.showQuickPick(templates, { placeHolder: 'Выберите шаблон' });
}

function readDirRecursive(src: string): string[] {
	let results: string[] = [];
	const list = fs.readdirSync(src);
	list.forEach(function(file) {
		const filePath = path.join(src, file);
		const stat = fs.statSync(filePath);
		if (stat && stat.isDirectory()) {
			results = results.concat(readDirRecursive(filePath));
		} else {
			results.push(filePath);
		}
	});
	return results;
}

function toUpperCaseFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPascalCase(str: string): string {
    return str
        .replace(/[-_ ]+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function toCamelCase(str: string): string {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
}

function toKebabCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[_\s]+/g, '-')
        .toLowerCase();
}

function toScreamingSnakeCase(str: string): string {
    return toSnakeCase(str).toUpperCase();
}

function toUpperCaseAll(str: string): string {
    return str.replace(/[-_\s]+/g, '').toUpperCase();
}

function toLowerCaseAll(str: string): string {
    return str.replace(/[-_\s]+/g, '').toLowerCase();
}

function copyTemplate(templateDir: string, targetDir: string, name: string) {
    const vars = {
        name, // как ввёл пользователь
        nameUpperCase: toUpperCaseFirst(name),
        nameLowerCase: name.toLowerCase(),
        namePascalCase: toPascalCase(name),
        nameCamelCase: toCamelCase(name),
        nameSnakeCase: toSnakeCase(name),
        nameKebabCase: toKebabCase(name),
        nameScreamingSnakeCase: toScreamingSnakeCase(name),
        nameUpperCaseAll: toUpperCaseAll(name),
        nameLowerCaseAll: toLowerCaseAll(name)
    };
    const files = readDirRecursive(templateDir);
    for (const file of files) {
        const relPath = path.relative(templateDir, file);
        const relPathTmpl = Handlebars.compile(relPath);
        const targetRelPath = relPathTmpl(vars);
        const targetPath = path.join(targetDir, targetRelPath);
        const content = fs.readFileSync(file, 'utf8');
        const contentTmpl = Handlebars.compile(content);
        const rendered = contentTmpl(vars);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, rendered, { flag: 'wx' });
    }
}

// Новый способ поиска переменных в шаблоне
function getAllTemplateVariables(templateDir: string): Set<string> {
    const files = readDirRecursive(templateDir);
    // Ищем {{ variable }} и {{ variable.suffix }}
    const varRegex = /{{\s*([\w]+)(?:\.[\w]+)?\s*}}/g;
    const vars = new Set<string>();
    for (const file of files) {
        // Пути
        let relPath = path.relative(templateDir, file);
        let match;
        while ((match = varRegex.exec(relPath)) !== null) {
            vars.add(match[1]); // только базовое имя
        }
        // Содержимое
        const content = fs.readFileSync(file, 'utf8');
        while ((match = varRegex.exec(content)) !== null) {
            vars.add(match[1]);
        }
    }
    return vars;
}

// Мапа модификаторов и функций
const CASE_MODIFIERS: Record<string, (str: string) => string> = {
    'pascalCase': toPascalCase,
    'camelCase': toCamelCase,
    'snakeCase': toSnakeCase,
    'kebabCase': toKebabCase,
    'screamingSnakeCase': toScreamingSnakeCase,
    'upperCase': toUpperCaseFirst,
    'lowerCase': (s: string) => s.toLowerCase(),
    'upperCaseAll': toUpperCaseAll,
    'lowerCaseAll': toLowerCaseAll,
};

// Генерируем объект переменных для шаблона
function buildVarsObject(userVars: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [base, value] of Object.entries(userVars)) {
        result[base] = value;
        for (const [mod, fn] of Object.entries(CASE_MODIFIERS)) {
            result[`${base}.${mod}`] = fn(value);
        }
    }
    return result;
}

async function collectUserVars(baseVars: Set<string>): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const v of baseVars) {
        const input = await vscode.window.showInputBox({ 
            prompt: `Введите значение для ${v}`,
            placeHolder: `{{${v}}}`
        });
        if (!input) throw new Error(`Значение для ${v} не введено`);
        result[v] = input;
    }
    return result;
}

// --- Собственная обработка шаблонов ---
function applyTemplate(str: string, vars: Record<string, string>, modifiers: Record<string, (s: string) => string>): string {
    return str.replace(/{{\s*([a-zA-Z0-9_]+)(?:\.([a-zA-Z0-9_]+))?\s*}}/g, (_, varName, mod) => {
        let value = vars[varName];
        if (value === undefined) return '';
        if (mod && modifiers[mod]) {
            return modifiers[mod](value);
        }
        return value;
    });
}

function copyTemplateWithVars(templateDir: string, targetDir: string, vars: Record<string, string>, overwriteFiles: boolean = false, dict?: Record<string, string>, templateName?: string): boolean {
    const files = readDirRecursive(templateDir);
    // Собираем все папки, которые будут созданы на первом уровне
    const firstLevelDirs = new Set<string>();
    for (const file of files) {
        const relPath = path.relative(templateDir, file);
        const targetRelPath = applyTemplate(relPath, vars, CASE_MODIFIERS);
        const firstLevel = targetRelPath.split(path.sep)[0];
        firstLevelDirs.add(firstLevel);
    }
    // Проверяем существование этих папок/файлов
    if (!overwriteFiles && dict) {
        for (const dir of firstLevelDirs) {
            const checkPath = path.join(targetDir, dir);
            if (fs.existsSync(checkPath)) {
                vscode.window.showErrorMessage(`${dict.fileExistsNoOverwrite}: ${checkPath}`);
                return false;
            }
        }
    }
    let createdCount = 0;
    for (const file of files) {
        const relPath = path.relative(templateDir, file);
        const targetRelPath = applyTemplate(relPath, vars, CASE_MODIFIERS);
        const targetPath = path.join(targetDir, targetRelPath);
        try {
            if (!overwriteFiles && fs.existsSync(targetPath) && dict) {
                const errMsg = `${dict.fileExistsNoOverwrite}: ${targetPath}`;
                vscode.window.showErrorMessage(errMsg);
                break;
            }
            const content = fs.readFileSync(file, 'utf8');
            const rendered = applyTemplate(content, vars, CASE_MODIFIERS);
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            fs.writeFileSync(targetPath, rendered, { flag: overwriteFiles ? 'w' : 'wx' });
            createdCount++;
        } catch (err: any) {
            if (err && err.code === 'EEXIST' && dict) {
                vscode.window.showErrorMessage(`${dict.fileExists}: ${targetPath}`);
            } else if (dict) {
                vscode.window.showErrorMessage(`${dict.createError}: ${err?.message || err}`);
            }
            break;
        }
    }
    if (createdCount > 0 && dict && templateName) {
        vscode.window.showInformationMessage(dict.createSuccess.replace('{{template}}', templateName));
    }
    return createdCount > 0;
}

const I18N_DICTIONARIES: Record<string, Record<string, string>> = {
    ru: {
        destinationPath: 'Путь назначения',
        chooseTemplate: 'Выберите шаблон',
        enterVariables: 'Введите значения переменных',
        varInputHint: 'без скобок {{ }}',
        create: 'Создать',
        selectTemplate: 'Шаблон',
        fileExistsNoOverwrite: 'Файл или папка уже существует и перезапись запрещена',
        fileExists: 'Файл или папка уже существует',
        createSuccess: 'Структура {{template}} успешно создана.',
        createError: 'Ошибка при создании структуры',
        noTemplates: 'В папке шаблонов нет шаблонов.',
        templatesNotFound: 'Папка шаблонов не найдена:',
        noFolders: 'Нет открытых папок рабочего пространства.',
        inputName: 'Введите имя для шаблона',
    },
    en: {
        destinationPath: 'Destination path',
        chooseTemplate: 'Choose template',
        enterVariables: 'Enter variables',
        varInputHint: 'without curly braces {{ }}',
        create: 'Create',
        selectTemplate: 'Template',
        fileExistsNoOverwrite: 'File or folder already exists and overwrite is disabled',
        fileExists: 'File or folder already exists',
        createSuccess: 'Structure {{template}} created successfully.',
        createError: 'Error creating structure',
        noTemplates: 'No templates found in templates folder.',
        templatesNotFound: 'Templates folder not found:',
        noFolders: 'No workspace folders open.',
        inputName: 'Enter name for template',
    }
};

const SETTINGS_I18N: Record<string, Record<string, string>> = {
    ru: {
        title: 'Настройки myTemplateGenerator',
        templatesPath: 'Путь к шаблонам:',
        overwriteFiles: 'Перезаписывать существующие файлы',
        inputMode: 'Способ ввода переменных:',
        inputModeWebview: 'Webview (форма)',
        inputModeInputBox: 'InputBox (по одной)',
        language: 'Язык интерфейса:',
        save: 'Сохранить'
    },
    en: {
        title: 'myTemplateGenerator Settings',
        templatesPath: 'Templates path:',
        overwriteFiles: 'Overwrite existing files',
        inputMode: 'Variable input method:',
        inputModeWebview: 'Webview (form)',
        inputModeInputBox: 'InputBox (one by one)',
        language: 'Interface language:',
        save: 'Save'
    }
};

interface MyTemplateGeneratorConfig {
    templatesPath: string;
    overwriteFiles: boolean;
    inputMode: 'webview' | 'inputBox';
    language?: string;
}

const DEFAULT_CONFIG: MyTemplateGeneratorConfig = {
    templatesPath: 'templates',
    overwriteFiles: false,
    inputMode: 'webview',
    language: 'en',
};

function getConfigPath(): string | undefined {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return undefined;
    return path.join(folders[0].uri.fsPath, 'mytemplategenerator.json');
}

function readConfig(): MyTemplateGeneratorConfig {
    const configPath = getConfigPath();
    if (configPath && fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, 'utf8');
            return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
        } catch (e) {
            vscode.window.showErrorMessage('Ошибка чтения mytemplategenerator.json, используются значения по умолчанию');
        }
    }
    // Можно добавить чтение из settings.json, если нужно
    return DEFAULT_CONFIG;
}

function writeConfig(config: MyTemplateGeneratorConfig) {
    const configPath = getConfigPath();
    if (!configPath) {
        vscode.window.showErrorMessage('Не удалось определить путь к mytemplategenerator.json');
        return;
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
}

async function showConfigWebview(context: vscode.ExtensionContext) {
    const config = readConfig();
    let language = config.language || 'ru';
    return new Promise<void>((resolve) => {
        const panel = vscode.window.createWebviewPanel(
            'mytemplategeneratorConfig',
            SETTINGS_I18N[language]?.title || SETTINGS_I18N['ru'].title,
            vscode.ViewColumn.Active,
            { enableScripts: true }
        );
        function setHtml() {
            const dict = SETTINGS_I18N[language] || SETTINGS_I18N['ru'];
            panel.webview.html = `
                <!DOCTYPE html>
                <html lang="${language}">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline';">
                    <title>${dict.title}</title>
                    <style>
                        :root {
                          --bg: #f7f7fa;
                          --panel-bg: #fff;
                          --text: #222;
                          --label: #555;
                          --input-bg: #f0f0f3;
                          --input-border: #d0d0d7;
                          --input-focus: #1976d2;
                          --button-bg: #1976d2;
                          --button-text: #fff;
                          --button-hover: #1565c0;
                          --border-radius: 8px;
                          --shadow: 0 2px 12px rgba(0,0,0,0.07);
                        }
                        @media (prefers-color-scheme: dark) {
                          :root {
                            --bg: #181a1b;
                            --panel-bg: #23272e;
                            --text: #f3f3f3;
                            --label: #b0b0b0;
                            --input-bg: #23272e;
                            --input-border: #33363b;
                            --input-focus: #90caf9;
                            --button-bg: #1976d2;
                            --button-text: #fff;
                            --button-hover: #1565c0;
                            --border-radius: 8px;
                            --shadow: 0 2px 12px rgba(0,0,0,0.25);
                          }
                        }
                        body {
                          background: var(--bg);
                          color: var(--text);
                          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
                          margin: 0;
                          min-height: 100vh;
                        }
                        .config-container {
                          max-width: 420px;
                          margin: 48px auto;
                          background: var(--panel-bg);
                          border-radius: var(--border-radius);
                          box-shadow: var(--shadow);
                          padding: 32px 36px 28px 36px;
                          display: flex;
                          flex-direction: column;
                          gap: 18px;
                        }
                        .config-container h2 {
                          margin: 0 0 18px 0;
                          font-size: 1.5em;
                          font-weight: 600;
                          letter-spacing: 0.01em;
                        }
                        .form-group {
                          display: flex;
                          flex-direction: column;
                          gap: 10px;
                          margin-bottom: 10px;
                        }
                        label {
                          color: var(--label);
                          font-size: 1em;
                          font-weight: 500;
                          margin-bottom: 2px;
                        }
                        input[type="text"], select {
                          background: var(--input-bg);
                          color: var(--text);
                          border: 1.5px solid var(--input-border);
                          border-radius: var(--border-radius);
                          padding: 8px 10px;
                          font-size: 1em;
                          transition: border 0.2s, box-shadow 0.2s;
                          outline: none;
                        }
                        input[type="text"]:focus, select:focus {
                          border-color: var(--input-focus);
                          box-shadow: 0 0 0 2px var(--input-focus)33;
                        }
                        .checkbox-group {
                          display: flex;
                          align-items: center;
                          gap: 8px;
                          margin-bottom: 10px;
                        }
                        input[type="checkbox"] {
                          accent-color: var(--input-focus);
                          width: 18px;
                          height: 18px;
                        }
                        button {
                          margin-top: 10px;
                          background: var(--button-bg);
                          color: var(--button-text);
                          border: none;
                          border-radius: var(--border-radius);
                          padding: 10px 0;
                          font-size: 1.1em;
                          font-weight: 600;
                          cursor: pointer;
                          transition: background 0.2s, box-shadow 0.2s;
                          box-shadow: 0 1px 4px rgba(25, 118, 210, 0.08);
                        }
                        button:hover, button:focus {
                          background: var(--button-hover);
                        }
                      </style>
                    <script>
                        window.addEventListener('DOMContentLoaded', () => {
                            const vscode = acquireVsCodeApi();
                            document.getElementById('configForm').addEventListener('submit', (e) => {
                                e.preventDefault();
                                const templatesPath = document.getElementById('templatesPath').value;
                                const overwriteFiles = document.getElementById('overwriteFiles').checked;
                                const inputMode = document.getElementById('inputMode').value;
                                const language = document.getElementById('language').value;
                                vscode.postMessage({ type: 'save', data: { templatesPath, overwriteFiles, inputMode, language } });
                            });
                            document.getElementById('language').addEventListener('change', (e) => {
                                vscode.postMessage({ type: 'changeLanguage', language: e.target.value });
                            });
                        });
                    </script>
                </head>
                <body>
                  <div class="config-container">
                    <h2>${dict.title}</h2>
                    <form id="configForm">
                      <div class="form-group">
                        <label for="templatesPath">${dict.templatesPath}</label>
                        <input type="text" id="templatesPath" value="${config.templatesPath || ''}"/>
                      </div>
                      <div class="checkbox-group">
                        <input type="checkbox" id="overwriteFiles" ${config.overwriteFiles ? 'checked' : ''}/>
                        <label for="overwriteFiles">${dict.overwriteFiles}</label>
                      </div>
                      <div class="form-group">
                        <label for="inputMode">${dict.inputMode}</label>
                        <select id="inputMode">
                          <option value="webview" ${config.inputMode === 'webview' ? 'selected' : ''}>${dict.inputModeWebview}</option>
                          <option value="inputBox" ${config.inputMode === 'inputBox' ? 'selected' : ''}>${dict.inputModeInputBox}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label for="language">${dict.language}</label>
                        <select id="language">
                          <option value="ru" ${language === 'ru' ? 'selected' : ''}>Русский</option>
                          <option value="en" ${language === 'en' ? 'selected' : ''}>English</option>
                        </select>
                      </div>
                      <button type="submit" style="padding: 10px 15px">${dict.save}</button>
                    </form>
                  </div>
                </body>
                </html>
            `;
        }
        setHtml();
        panel.webview.onDidReceiveMessage(
            message => {
                if (message.type === 'save') {
                    writeConfig(message.data);
                    vscode.window.showInformationMessage('Настройки myTemplateGenerator сохранены!');
                    panel.dispose();
                    resolve();
                } else if (message.type === 'changeLanguage') {
                    language = message.language;
                    setHtml();
                }
            },
            undefined,
            context.subscriptions
        );
        panel.onDidDispose(() => resolve(), null, context.subscriptions);
    });
}

async function showTemplateAndVarsWebview(context: vscode.ExtensionContext, templatesDir: string, targetPath: string, initialLanguage: string): Promise<{template: string, vars: Record<string, string>} | undefined> {
    let language = initialLanguage;
    function getDict() {
        return I18N_DICTIONARIES[language] || I18N_DICTIONARIES['ru'];
    }
    const templates = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());
    return new Promise((resolve) => {
        const panel = vscode.window.createWebviewPanel(
            'templateVars',
            getDict().create,
            vscode.ViewColumn.Active,
            { enableScripts: true }
        );
        let currentVars: string[] = [];
        let currentTemplate = templates[0] || '';
        let disposed = false;
        function getVarsHtml(vars: string[], values: Record<string, string> = {}) {
            const dict = getDict();
            if (!vars.length) return '';
            return `<h3>${dict.enterVariables}</h3>
            <div style="color: #888; font-size: 13px; margin-bottom: 10px;">${dict.varInputHint}</div>
            <form id="varsForm">
            ${vars.map(v => `
                <label><input name="${v}" placeholder="{{${v}}}" value="${values[v] || ''}" required /></label><br/><br/>
            `).join('')}
            <button type="submit" style="padding: 10px 15px">${dict.create}</button>
            </form>`;
        }
        function getTemplatesRadioHtml(templates: string[], selected: string) {
            const dict = getDict();
            return `<form id="templateForm">
                <h3>${dict.chooseTemplate}:</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                ${templates.map(t => `
                    <label><input type="radio" name="templateRadio" value="${t}" ${selected === t ? 'checked' : ''}/> ${t}</label>
                `).join('')}
                </div>
            </form>`;
        }
        function getLanguageSelectorHtml(selected: string) {
            return `<label style="margin-bottom: 12px; display: block;">
                <select id="languageSelect">
                    <option value="ru" ${selected === 'ru' ? 'selected' : ''}>Русский</option>
                    <option value="en" ${selected === 'en' ? 'selected' : ''}>English</option>
                </select>
            </label>`;
        }
        function setHtml(templatesHtml: string, varsHtml: string) {
            const dict = getDict();
            panel.webview.html = `
                <!DOCTYPE html>
                <html lang="${language}">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline';">
                    <title>${dict.create}</title>
                    <style>
                        :root {
                          --bg: #f7f7fa;
                          --panel-bg: #fff;
                          --text: #222;
                          --label: #555;
                          --input-bg: #f0f0f3;
                          --input-border: #d0d0d7;
                          --input-focus: #1976d2;
                          --button-bg: #1976d2;
                          --button-text: #fff;
                          --button-hover: #1565c0;
                          --border-radius: 8px;
                          --shadow: 0 2px 12px rgba(0,0,0,0.07);
                        }
                        @media (prefers-color-scheme: dark) {
                          :root {
                            --bg: #181a1b;
                            --panel-bg: #23272e;
                            --text: #f3f3f3;
                            --label: #b0b0b0;
                            --input-bg: #23272e;
                            --input-border: #33363b;
                            --input-focus: #90caf9;
                            --button-bg: #1976d2;
                            --button-text: #fff;
                            --button-hover: #1565c0;
                            --border-radius: 8px;
                            --shadow: 0 2px 12px rgba(0,0,0,0.25);
                          }
                        }
                        body {
                          background: var(--bg);
                          color: var(--text);
                          font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;
                          margin: 0;
                          min-height: 100vh;
                        }
                        .create-container {
                          max-width: 420px;
                          margin: 48px auto;
                          background: var(--panel-bg);
                          border-radius: var(--border-radius);
                          box-shadow: var(--shadow);
                          padding: 32px 36px 28px 36px;
                          display: flex;
                          flex-direction: column;
                          gap: 18px;
                        }
						.head-wrap {
						  display: flex;
						  align-items: center;
						  justify-content: space-between;
						}
                        .create-container h2 {
                          margin: 0 ;
                          font-size: 1.5em;
                          font-weight: 600;
                          letter-spacing: 0.01em;
                        }
                        .form-group {
                          display: flex;
                          flex-direction: column;
                          gap: 6px;
                        }
                        label {
                          color: var(--label);
                          font-size: 1em;
                          font-weight: 500;
                        }
                        input, select {
                          background: var(--input-bg);
                          color: var(--text);
                          border: 1.5px solid var(--input-border);
                          border-radius: var(--border-radius);
                          padding: 8px 10px;
                          font-size: 1em;
                          transition: border 0.2s, box-shadow 0.2s;
                          outline: none;
                        }
                        input:focus, select:focus {
                          border-color: var(--input-focus);
                          box-shadow: 0 0 0 2px var(--input-focus)33;
                        }
                        button {
                          margin-top: 10px;
                          background: var(--button-bg);
                          color: var(--button-text);
                          border: none;
                          border-radius: var(--border-radius);
                          padding: 10px 0;
                          font-size: 1.1em;
                          font-weight: 600;
                          cursor: pointer;
                          transition: background 0.2s, box-shadow 0.2s;
                          box-shadow: 0 1px 4px rgba(25, 118, 210, 0.08);
                        }
                        button:hover, button:focus {
                          background: var(--button-hover);
                        }
                        .destination {
                          margin-bottom: 16px;
                          color: #888;
                          font-size: 13px;
                        }
                        .lang-select {
                          display: block;
                        }
                      </style>
                    <script>
                        window.addEventListener('DOMContentLoaded', () => {
                            const vscode = acquireVsCodeApi();
                            const templateRadios = document.querySelectorAll('input[name="templateRadio"]');
                            templateRadios.forEach(radio => {
                                radio.addEventListener('change', (e) => {
                                    vscode.postMessage({ type: 'selectTemplate', template: e.target.value, language: document.getElementById('languageSelect').value });
                                });
                            });
                            const varsForm = document.getElementById('varsForm');
                            if (varsForm) {
                                varsForm.addEventListener('submit', (e) => {
                                    e.preventDefault();
                                    const data = {};
                                    ${currentVars.map(v => `data['${v}'] = document.getElementsByName('${v}')[0].value;`).join('\n')}
                                    vscode.postMessage({ type: 'submit', template: '${currentTemplate}', data, language: document.getElementById('languageSelect').value });
                                });
                            }
                            const langSel = document.getElementById('languageSelect');
                            if (langSel) {
                                langSel.addEventListener('change', (e) => {
                                    vscode.postMessage({ type: 'changeLanguage', language: e.target.value, template: document.querySelector('input[name="templateRadio"]:checked')?.value || '' });
                                });
                            }
                        });
                    </script>
                </head>
                <body>
                  <div class="create-container">
				  	<div class="head-wrap">
					  <h2>${dict.create}</h2>
					  <div class="lang-select">${getLanguageSelectorHtml(language)}</div>
					</div>
                    <div id="templatesBlock">
                        ${templatesHtml}
                    </div>
                    <div id="varsBlock">
                        ${varsHtml}
                    </div>
                  </div>
                </body>
                </html>
            `;
        }
        // Инициализация: сразу выбран первый шаблон и форма переменных
        let initialVars: string[] = [];
        if (currentTemplate) {
            const templateDir = path.join(templatesDir, currentTemplate);
            const allVars = getAllTemplateVariables(templateDir);
            initialVars = Array.from(allVars);
            currentVars = initialVars;
        }
        setHtml(getTemplatesRadioHtml(templates, currentTemplate), getVarsHtml(initialVars));
        // Обработка сообщений
        panel.webview.onDidReceiveMessage(
            async message => {
                if (message.type === 'selectTemplate') {
                    currentTemplate = message.template;
                    if (message.language) language = message.language;
                    if (!currentTemplate) {
                        setHtml(getTemplatesRadioHtml(templates, ''), '');
                        return;
                    }
                    // Получаем переменные для выбранного шаблона
                    const templateDir = path.join(templatesDir, currentTemplate);
                    const allVars = getAllTemplateVariables(templateDir);
                    currentVars = Array.from(allVars);
                    setHtml(getTemplatesRadioHtml(templates, currentTemplate), getVarsHtml(currentVars));
                } else if (message.type === 'changeLanguage') {
                    if (message.language) language = message.language;
                    currentTemplate = message.template || templates[0] || '';
                    // Получаем переменные для выбранного шаблона
                    let baseVars: string[] = [];
                    if (currentTemplate) {
                        const templateDir = path.join(templatesDir, currentTemplate);
                        const allVars = getAllTemplateVariables(templateDir);
                        baseVars = Array.from(allVars);
                        currentVars = baseVars;
                    }
                    setHtml(getTemplatesRadioHtml(templates, currentTemplate), getVarsHtml(currentVars));
                } else if (message.type === 'submit') {
                    if (message.language) language = message.language;
                    if (!disposed) {
                        disposed = true;
                        panel.dispose();
                        resolve({ template: message.template, vars: message.data });
                    }
                }
            },
            undefined,
            context.subscriptions
        );
        panel.onDidDispose(() => {
            if (!disposed) {
                disposed = true;
                resolve(undefined);
            }
        }, null, context.subscriptions);
    });
}

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

// --- Автокомплит и подсветка для шаблонов ---
function registerTemplateCompletionAndHighlight(context: vscode.ExtensionContext) {
    const config = readConfig();
    const templatesPath = config.templatesPath || 'templates';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;
    const templatesDir = path.join(workspaceFolders[0].uri.fsPath, templatesPath);

    // --- Автокомплит ---
    const completionProvider: vscode.CompletionItemProvider = {
        provideCompletionItems(document, position, token, completionContext) {
            if (!isInTemplatesDir(document.uri.fsPath, templatesDir)) {
                return undefined;
            }
            const line = document.lineAt(position).text;
            const textBefore = line.slice(0, position.character);
            const match = /{{\s*([\w]+)?(?:\.([\w]*))?[^}]*$/.exec(textBefore);
            if (!match) return undefined;
            const allVars = getAllTemplateVariables(templatesDir);
            const items: vscode.CompletionItem[] = [];
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
    // --- Удалена старая подсветка через декоратор ---
}

function registerTemplateSemanticHighlight(context: vscode.ExtensionContext) {
    const config = readConfig();
    const templatesPath = config.templatesPath || 'templates';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;
    const templatesDir = path.join(workspaceFolders[0].uri.fsPath, templatesPath);

    const legend = new vscode.SemanticTokensLegend(['bracket', 'variable', 'modifier']);
    context.subscriptions.push(
        vscode.languages.registerDocumentSemanticTokensProvider(
            { pattern: templatesDir + '/**' },
            {
                provideDocumentSemanticTokens(document) {
                    const tokens: number[] = [];
                    for (let lineNum = 0; lineNum < document.lineCount; lineNum++) {
                        const line = document.lineAt(lineNum).text;
                        // Ищем все {{variable.modifier}} или {{variable}}
                        const reg = /({{)|(}})|{{\s*([a-zA-Z0-9_]+)(?:\.([a-zA-Z0-9_]+))?\s*}}/g;
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
                                if (match[4]) {
                                    // .modifier
                                    const modStart = varStart + match[3].length + 1; // +1 за точку
                                    tokens.push(lineNum, modStart, match[4].length, 2, 0); // modifier
                                }
                            }
                        }
                    }
                    return new vscode.SemanticTokens(new Uint32Array(tokens));
                }
            },
            legend
        )
    );
}

// === Декораторы для шаблонных переменных ===
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

function updateTemplateDecorations(editor: vscode.TextEditor, templatesDir: string) {
    if (!editor || !isInTemplatesDir(editor.document.uri.fsPath, templatesDir)) return;
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

function registerTemplateDecorations(context: vscode.ExtensionContext) {
    const config = readConfig();
    const templatesPath = config.templatesPath || 'templates';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;
    const templatesDir = path.join(workspaceFolders[0].uri.fsPath, templatesPath);

    function decorateActiveEditor() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            updateTemplateDecorations(editor, templatesDir);
        }
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) decorateActiveEditor();
        }),
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
            if (editor) updateTemplateDecorations(editor, templatesDir);
        })
    );
    // Инициализация при активации
    setTimeout(() => {
        vscode.window.visibleTextEditors.forEach(editor => updateTemplateDecorations(editor, templatesDir));
    }, 300);
}

function isInTemplatesDir(filePath: string, templatesDir: string): boolean {
    const rel = path.relative(templatesDir, filePath);
    return (
        !rel.startsWith('..') &&
        !path.isAbsolute(rel)
    );
}

function clearDiagnosticsForEditor(editor: vscode.TextEditor, templatesDir: string) {
    if (editor && isInTemplatesDir(editor.document.uri.fsPath, templatesDir)) {
        vscode.languages.getDiagnostics(editor.document.uri).forEach(() => {
            vscode.languages.createDiagnosticCollection().set(editor.document.uri, []);
        });
    }
}

function clearDiagnosticsForTemplates(context: vscode.ExtensionContext) {
    const config = readConfig();
    const templatesPath = config.templatesPath || 'templates';
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;
    const templatesDir = path.join(workspaceFolders[0].uri.fsPath, templatesPath);

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) clearDiagnosticsForEditor(editor, templatesDir);
        }),
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document === event.document);
            if (editor) clearDiagnosticsForEditor(editor, templatesDir);
        })
    );
    // Инициализация при активации
    setTimeout(() => {
        vscode.window.visibleTextEditors.forEach(editor => clearDiagnosticsForEditor(editor, templatesDir));
    }, 300);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "mytemplategenerator" is now active!');

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
			const result = await showTemplateAndVarsWebview(context, templatesDir, uri.fsPath, config.language || 'ru');
			if (!result) return;
			template = result.template;
			userVars = result.vars;
		} else {
			template = await pickTemplate(templatesDir);
			if (!template) return;
			const templateDir = path.join(templatesDir, template);
			const allVars = getAllTemplateVariables(templateDir);
			const baseVars = Array.from(allVars);
			userVars = await collectUserVars(new Set(baseVars));
		}
		if (!template || !userVars) return;
		const templateDir = path.join(templatesDir, template);
		try {
			const vars = buildVarsObject(userVars);
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
	registerTemplateSemanticHighlight(context);
	registerTemplateDecorations(context); // <--- Добавить регистрацию декораторов
	clearDiagnosticsForTemplates(context); // <--- Очищаем diagnostics для шаблонов
}

// This method is called when your extension is deactivated
export function deactivate() {}

export {
  toPascalCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toScreamingSnakeCase,
  toUpperCaseFirst,
  toUpperCaseAll,
  toLowerCaseAll,
  buildVarsObject,
  CASE_MODIFIERS
};
