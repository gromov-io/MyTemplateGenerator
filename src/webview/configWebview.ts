// Webview для конфигурации расширения
import * as vscode from 'vscode';
import { MyTemplateGeneratorConfig, readConfig, writeConfig } from '../core/config';

const LOCALIZATION: Record<'ru'|'en', {
    title: string;
    templatesPath: string;
    overwriteFiles: string;
    inputMode: string;
    inputBox: string;
    webview: string;
    language: string;
    save: string;
    russian: string;
    english: string;
}> = {
    ru: {
        title: 'Настройки генератора шаблонов',
        templatesPath: 'Путь к шаблонам:',
        overwriteFiles: 'Перезаписывать файлы',
        inputMode: 'Режим ввода:',
        inputBox: 'InputBox',
        webview: 'Webview',
        language: 'Язык:',
        save: 'Сохранить',
        russian: 'Русский',
        english: 'English',
    },
    en: {
        title: 'Template Generator Settings',
        templatesPath: 'Templates path:',
        overwriteFiles: 'Overwrite files',
        inputMode: 'Input mode:',
        inputBox: 'InputBox',
        webview: 'Webview',
        language: 'Language:',
        save: 'Save',
        russian: 'Russian',
        english: 'English',
    }
};

export async function showConfigWebview(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel(
        'myTemplateGeneratorConfig',
        'Настройки MyTemplateGenerator',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    let config = readConfig();
    // Стили теперь лежат в media/styles.css (папка для статики)
    const stylePath = vscode.Uri.joinPath(context.extensionUri, 'media', 'styles.css');
    const styleUri = panel.webview.asWebviewUri(stylePath);
    setHtml((config.language === 'en' ? 'en' : 'ru'));

    function setHtml(language: 'ru'|'en') {
        panel.webview.html = getHtml(language);
    }

    function getHtml(language: 'ru'|'en'): string {
        const dict = LOCALIZATION[language] || LOCALIZATION['ru'];
        return `
            <!DOCTYPE html>
            <html lang="${language}">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; script-src 'unsafe-inline';">
                <title>${dict.title}</title>
                <link rel="stylesheet" href="${styleUri}">
            </head>
            <body>
                <div class="config-container">
                    <h2>${dict.title}</h2>
                    <form id="configForm">
                        <div class="form-group">
                            <label>${dict.templatesPath}
                                <input name="templatesPath" value="${config.templatesPath}" />
                            </label>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" name="overwriteFiles" ${config.overwriteFiles ? 'checked' : ''}/>
                                ${dict.overwriteFiles}
                            </label>
                        </div>
                        <div class="form-group">
                            <label>${dict.inputMode}
                                <select name="inputMode">
                                    <option value="inputBox" ${config.inputMode === 'inputBox' ? 'selected' : ''}>${dict.inputBox}</option>
                                    <option value="webview" ${config.inputMode === 'webview' ? 'selected' : ''}>${dict.webview}</option>
                                </select>
                            </label>
                        </div>
                        <div class="form-group">
                            <label>${dict.language}
                                <select name="language" id="languageSelect">
                                    <option value="ru" ${language === 'ru' ? 'selected' : ''}>${dict.russian}</option>
                                    <option value="en" ${language === 'en' ? 'selected' : ''}>${dict.english}</option>
                                </select>
                            </label>
                        </div>
                        <button type="submit" class="btn">${dict.save}</button>
                    </form>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('configForm').onsubmit = function(e) {
                        e.preventDefault();
                        const data = Object.fromEntries(new FormData(this));
                        data.overwriteFiles = !!this.overwriteFiles.checked;
                        vscode.postMessage({ type: 'save', data });
                    };
                    document.getElementById('languageSelect').onchange = function(e) {
                        vscode.postMessage({ type: 'setLanguage', language: this.value });
                    };
                </script>
            </body>
            </html>
        `;
    }

    panel.webview.onDidReceiveMessage(
        async msg => {
            if (msg.type === 'save') {
                await writeConfig(msg.data);
                vscode.window.showInformationMessage('Настройки сохранены!');
                panel.dispose();
            }
            if (msg.type === 'setLanguage') {
                // Сохраняем язык в конфиг и перерисовываем webview
                config.language = msg.language;
                await writeConfig(config);
                setHtml(msg.language === 'en' ? 'en' : 'ru');
            }
        },
        undefined,
        context.subscriptions
    );
} 