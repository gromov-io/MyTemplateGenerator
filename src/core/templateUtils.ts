// Работа с шаблонами и преобразование кейсов
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
// @ts-expect-error: Нет типов для change-case-all, но пакет работает корректно
import { camelCase, pascalCase, snakeCase, kebabCase, constantCase, upperCase, lowerCase } from 'change-case-all';

export const CASE_MODIFIERS: Record<string, (str: string) => string> = {
    pascalCase,
    camelCase,
    snakeCase,
    kebabCase,
    screamingSnakeCase: constantCase,
    upperCase,
    lowerCase,
    upperCaseAll: (s: string) => s.replace(/[-_\s]+/g, '').toUpperCase(),
    lowerCaseAll: (s: string) => s.replace(/[-_\s]+/g, '').toLowerCase(),
};

export function readDirRecursive(src: string): string[] {
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

export function copyTemplate(templateDir: string, targetDir: string, name: string) {
    const vars = {
        name,
        nameUpperCase: CASE_MODIFIERS.upperCase(name),
        nameLowerCase: CASE_MODIFIERS.lowerCase(name),
        namePascalCase: CASE_MODIFIERS.pascalCase(name),
        nameCamelCase: CASE_MODIFIERS.camelCase(name),
        nameSnakeCase: CASE_MODIFIERS.snakeCase(name),
        nameKebabCase: CASE_MODIFIERS.kebabCase(name),
        nameScreamingSnakeCase: CASE_MODIFIERS.screamingSnakeCase(name),
        nameUpperCaseAll: CASE_MODIFIERS.upperCaseAll(name),
        nameLowerCaseAll: CASE_MODIFIERS.lowerCaseAll(name)
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

export function getAllTemplateVariables(templateDir: string): Set<string> {
    const files = readDirRecursive(templateDir);
    const varRegex = /{{\s*([\w]+)(?:\.[\w]+)?\s*}}/g;
    const vars = new Set<string>();
    for (const file of files) {
        let relPath = path.relative(templateDir, file);
        let match;
        while ((match = varRegex.exec(relPath)) !== null) {
            vars.add(match[1]);
        }
        const content = fs.readFileSync(file, 'utf8');
        while ((match = varRegex.exec(content)) !== null) {
            vars.add(match[1]);
        }
    }
    return vars;
}

export function applyTemplate(str: string, vars: Record<string, string>, modifiers: Record<string, (s: string) => string>): string {
    return str.replace(/{{\s*([a-zA-Z0-9_]+)(?:\.([a-zA-Z0-9_]+))?\s*}}/g, (_, varName, mod) => {
        let value = vars[varName];
        if (value === undefined) return '';
        if (mod && modifiers[mod]) {
            return modifiers[mod](value);
        }
        return value;
    });
}

export function copyTemplateWithVars(templateDir: string, targetDir: string, vars: Record<string, string>, overwriteFiles: boolean = false, dict?: Record<string, string>, templateName?: string): boolean {
    const files = readDirRecursive(templateDir);
    const firstLevelDirs = new Set<string>();
    for (const file of files) {
        const relPath = path.relative(templateDir, file);
        const targetRelPath = applyTemplate(relPath, vars, CASE_MODIFIERS);
        const firstLevel = targetRelPath.split(path.sep)[0];
        firstLevelDirs.add(firstLevel);
    }
    if (!overwriteFiles && dict) {
        for (const dir of firstLevelDirs) {
            const checkPath = path.join(targetDir, dir);
            if (fs.existsSync(checkPath)) {
                return false;
            }
        }
    }
    for (const file of files) {
        const relPath = path.relative(templateDir, file);
        const targetRelPath = applyTemplate(relPath, vars, CASE_MODIFIERS);
        const targetPath = path.join(targetDir, targetRelPath);
        const content = fs.readFileSync(file, 'utf8');
        const rendered = applyTemplate(content, vars, CASE_MODIFIERS);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, rendered, { flag: overwriteFiles ? 'w' : 'wx' });
    }
    return true;
} 