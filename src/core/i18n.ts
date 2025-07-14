// Словари локализации и утилиты для i18n
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export const I18N_DICTIONARIES: Record<string, Record<string, string>> = {
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

export const SETTINGS_I18N: Record<string, Record<string, string>> = {
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

export async function pickTemplate(templatesDir: string): Promise<string | undefined> {
    const templates = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());
    if (templates.length === 0) {
        vscode.window.showWarningMessage('В папке templates нет шаблонов.');
        return undefined;
    }
    return vscode.window.showQuickPick(templates, { placeHolder: 'Выберите шаблон' });
} 