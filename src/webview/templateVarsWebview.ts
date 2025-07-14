// Webview для выбора шаблона и переменных
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getAllTemplateVariables } from '../core/templateUtils';
import { I18N_DICTIONARIES } from '../core/i18n';
import { writeConfig, readConfig } from '../core/config';

export async function showTemplateAndVarsWebview(
    context: vscode.ExtensionContext,
    templatesDir: string,
    targetPath: string,
    initialLanguage: string
): Promise<{ template: string, vars: Record<string, string> } | undefined> {
    let language = initialLanguage;
    function getDict() {
        return I18N_DICTIONARIES[language] || I18N_DICTIONARIES['ru'];
    }
    const templates = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());
    const stylePath = vscode.Uri.joinPath(context.extensionUri, 'src', 'webview', 'styles.css');
    return new Promise((resolve) => {
        const panel = vscode.window.createWebviewPanel(
            'templateVars',
            getDict().create,
            vscode.ViewColumn.Active,
            { enableScripts: true }
        );
        const styleUri = panel.webview.asWebviewUri(stylePath);
        let currentVars: string[] = [];
        let currentTemplate = templates[0] || '';
        let disposed = false;
        function getVarsHtml(vars: string[], values: Record<string, string> = {}) {
            const dict = getDict();
            if (!vars.length) return '';
            return `<h3>${dict.enterVariables}</h3>
            <div class="var-hint">${dict.varInputHint}</div>
            <form id="varsForm">
            ${vars.map(v => `
                <label><input name="${v}" placeholder="{{${v}}}" value="${values[v] || ''}" required /></label><br/><br/>
            `).join('')}
            <button type="submit" class="btn">${dict.create}</button>
            </form>`;
        }
        function getTemplatesRadioHtml(templates: string[], selected: string) {
            const dict = getDict();
            return `<form id="templateForm">
                <h3>${dict.chooseTemplate}:</h3>
                <div class="template-list">
                ${templates.map(t => `
                    <label><input type="radio" name="templateRadio" value="${t}" ${selected === t ? 'checked' : ''}/> ${t}</label>
                `).join('')}
                </div>
            </form>`;
        }
        function getLanguageSelectorHtml(selected: string) {
            return `<label class="lang-select">
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
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${panel.webview.cspSource}; script-src 'unsafe-inline';">
                    <title>${dict.create}</title>
                    <link rel="stylesheet" href="${styleUri}">
                </head>
                <body>
                  <div class="create-container">
				  <div class="head-wrap">
					<h2>${dict.create}</h2>
					${getLanguageSelectorHtml(language)}
				  </div>
                    <div id="templatesBlock">
                        ${templatesHtml}
                    </div>
                    <div id="varsBlock">
                        ${varsHtml}
                    </div>
                  </div>
                  <script>
                    (function() {
                      const vscode = acquireVsCodeApi();
                      function initHandlers() {
                        // Template radio
                        const templateRadios = document.querySelectorAll('input[name="templateRadio"]');
                        templateRadios.forEach(radio => {
                          radio.addEventListener('change', (e) => {
                            vscode.postMessage({ type: 'selectTemplate', template: e.target.value, language: document.getElementById('languageSelect').value });
                          });
                        });
                        // Vars form
                        const varsForm = document.getElementById('varsForm');
                        if (varsForm) {
                          varsForm.addEventListener('submit', (e) => {
                            e.preventDefault();
                            const data = {};
                            Array.from(varsForm.elements).forEach(el => {
                              if (el.name) data[el.name] = el.value;
                            });
                            vscode.postMessage({ type: 'submit', template: document.querySelector('input[name="templateRadio"]:checked')?.value || '', data, language: document.getElementById('languageSelect').value });
                          });
                        }
                        // Language select
                        const langSel = document.getElementById('languageSelect');
                        if (langSel) {
                          langSel.addEventListener('change', (e) => {
                            vscode.postMessage({ type: 'setLanguage', language: e.target.value, template: document.querySelector('input[name="templateRadio"]:checked')?.value || '' });
                          });
                        }
                      }
                      window.initHandlers = initHandlers;
                      document.addEventListener('DOMContentLoaded', initHandlers);
                    })();
                  </script>
                </body>
                </html>
            `;
            // После перерисовки HTML вызываем initHandlers
            setTimeout(() => {
              panel.webview.postMessage({ type: 'callInitHandlers' });
            }, 0);
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
                } else if (message.type === 'setLanguage') {
                    if (message.language) language = message.language;
                    // Сохраняем язык в конфиг
                    const oldConfig = readConfig();
                    writeConfig({ ...oldConfig, language });
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
                } else if (message.type === 'changeLanguage') {
                    // legacy, не нужен
                } else if (message.type === 'submit') {
                    if (message.language) language = message.language;
                    if (!disposed) {
                        disposed = true;
                        panel.dispose();
                        resolve({ template: message.template, vars: message.data });
                    }
                } else if (message.type === 'callInitHandlers') {
                  // Ничего не делаем, скрипт внутри webview вызовет window.initHandlers
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