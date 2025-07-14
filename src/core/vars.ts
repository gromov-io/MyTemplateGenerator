// Работа с переменными шаблонов
import { CASE_MODIFIERS } from './templateUtils';

export function buildVarsObject(userVars: Record<string, string>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [base, value] of Object.entries(userVars)) {
        result[base] = value;
        for (const [mod, fn] of Object.entries(CASE_MODIFIERS)) {
            result[`${base}.${mod}`] = fn(value);
        }
    }
    return result;
}

import * as vscode from 'vscode';

export async function collectUserVars(baseVars: Set<string>): Promise<Record<string, string>> {
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