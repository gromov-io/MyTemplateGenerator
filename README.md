# myTemplateGenerator

[English](#english) | [Русский](#русский)

---

# English

## myTemplateGenerator — Template-based structure generation for VSCode

**Features:**
- Syntax highlighting and autocomplete for template variables in templates
- Generate files and folders from templates with variable substitution
- Flexible configuration via `mytemplategenerator.json` or visual configurator
- Full localization (English/Russian) for all UI, messages, and menus
- Choose variable input mode: Webview (form) or inputBox (one by one)
- Overwrite control: allow or forbid overwriting existing files/folders
- Smart conflict handling: clear notifications if structure already exists
- **No Handlebars dependency**: variable substitution is handled by the extension itself

### Quick Start
1. Create a `templates` folder in your project root.
2. Add subfolders for different templates (e.g., `components`, `store`).
3. Use variables like `{{name}}` or `{{name.pascalCase}}` in file/folder names and file contents.
4. Right-click a folder in VSCode and select **Create from template...**
5. Choose a template, fill in variables, and click "Create".

### Example template structure
```
templates/
  components/
    {{name}}/
      index.js
      style.module.css
  store/
    {{name}}Store.js
```

### Supported variables and modifiers

You can use variables with modifiers via dot notation:

- `{{name}}` — as entered by user
- `{{name.pascalCase}}` — PascalCase
- `{{name.camelCase}}` — camelCase
- `{{name.snakeCase}}` — snake_case
- `{{name.kebabCase}}` — kebab-case
- `{{name.screamingSnakeCase}}` — SCREAMING_SNAKE_CASE
- `{{name.upperCase}}` — First letter uppercase
- `{{name.lowerCase}}` — all lowercase
- `{{name.upperCaseAll}}` — ALLUPPERCASE (no separators)
- `{{name.lowerCaseAll}}` — alllowercase (no separators)

> When searching for variables for the form, only the name before the dot is considered. For example, `{{name}}` and `{{name.pascalCase}}` are the same variable.

### Example usage in template
```
components/
  {{name.pascalCase}}/
    index.js
    {{name.camelCase}}.service.js
    {{name.snakeCase}}.test.js
```
And in file contents:
```
export class {{name.pascalCase}} {}
const name = '{{name}}';
```

### Configuration
Use `mytemplategenerator.json` in your project root or the visual configurator (**Configure myTemplateGenerator...**):
```json
{
  "templatesPath": "templates",
  "overwriteFiles": false,
  "inputMode": "webview", // or "inputBox"
  "language": "en" // or "ru"
}
```
- **templatesPath** — path to templates folder
- **overwriteFiles** — allow or forbid overwriting existing files/folders
- **inputMode** — variable input mode: "webview" (form) or "inputBox" (one by one)
- **language** — plugin UI language (en/ru)

### Localization
- All UI, messages, errors, and menus are localized.
- Webview and messages use the language from config.
- Menu/command language depends on VSCode interface language.

### Key commands
- **Create from template...** — generate structure (context menu)
- **Configure myTemplateGenerator...** — open visual configurator (command palette)

### Error handling & overwrite
- If structure or file exists and overwrite is forbidden, generation is cancelled and a clear notification is shown.
- Any file creation error stops generation and shows the reason.

---

# Русский

## myTemplateGenerator — Генерация структуры из шаблонов для VSCode

**Возможности:**
- Подсветка синтаксиса и автокомплит переменных в шаблонах
- Генерация файлов и папок по шаблонам с подстановкой переменных
- Гибкая настройка через `mytemplategenerator.json` или визуальный конфигуратор
- Полная локализация (русский/английский) для всего интерфейса, сообщений и меню
- Выбор способа ввода переменных: Webview (форма) или inputBox (по одной)
- Контроль перезаписи: можно запретить или разрешить перезапись существующих файлов/папок
- Умная обработка конфликтов: понятные уведомления, если структура уже существует
- **Без зависимости от Handlebars**: подстановка переменных реализована внутри расширения

### Быстрый старт
1. В корне проекта создайте папку `templates`.
2. Внутри неё создайте подпапки для разных шаблонов (например, `components`, `store`).
3. Внутри шаблонов используйте переменные вида `{{name}}` или `{{name.pascalCase}}` в именах файлов/папок и в содержимом файлов.
4. Кликните правой кнопкой мыши на нужной папке в VSCode и выберите пункт **Создать из шаблона...**
5. В появившемся окне выберите шаблон, заполните переменные и нажмите "Создать".

### Пример структуры шаблонов
```
templates/
  components/
    {{name}}/
      index.js
      style.module.css
  store/
    {{name}}Store.js
```

### Переменные и модификаторы

В шаблонах можно использовать переменные с модификаторами через точку:

- `{{name}}` — как ввёл пользователь
- `{{name.pascalCase}}` — PascalCase
- `{{name.camelCase}}` — camelCase
- `{{name.snakeCase}}` — snake_case
- `{{name.kebabCase}}` — kebab-case
- `{{name.screamingSnakeCase}}` — SCREAMING_SNAKE_CASE
- `{{name.upperCase}}` — Первая буква большая
- `{{name.lowerCase}}` — все буквы маленькие
- `{{name.upperCaseAll}}` — ВСЕ БУКВЫ БОЛЬШИЕ (без разделителей)
- `{{name.lowerCaseAll}}` — все буквы маленькие (без разделителей)

> При поиске переменных для формы учитывается только имя до точки. Например, `{{name}}` и `{{name.pascalCase}}` — это одна переменная.

### Пример использования в шаблоне
```
components/
  {{name.pascalCase}}/
    index.js
    {{name.camelCase}}.service.js
    {{name.snakeCase}}.test.js
```
Внутри файлов также можно использовать эти переменные:
```
export class {{name.pascalCase}} {}
const name = '{{name}}';
```

### Конфигурация
Для гибкой настройки используйте файл `mytemplategenerator.json` в корне проекта или визуальный конфигуратор (команда **Настроить myTemplateGenerator...**):
```json
{
  "templatesPath": "templates",
  "overwriteFiles": false,
  "inputMode": "webview", // или "inputBox"
  "language": "ru" // или "en"
}
```
- **templatesPath** — путь к папке с шаблонами
- **overwriteFiles** — разрешать ли перезапись существующих файлов/папок
- **inputMode** — способ ввода переменных: "webview" (форма) или "inputBox" (по одной)
- **language** — язык интерфейса плагина (ru/en)

### Локализация
- Все сообщения, Webview, ошибки и пункты меню локализованы.
- Язык Webview и сообщений выбирается в конфигураторе.
- Язык пунктов меню и команд зависит от языка интерфейса VSCode.

### Важные команды
- **Создать из шаблона...** — генерация структуры (контекстное меню)
- **Настроить myTemplateGenerator...** — открыть визуальный конфигуратор (палитра команд)

### Обработка ошибок и перезаписи
- Если структура или файл уже существуют и перезапись запрещена, генерация не выполняется и выводится понятное уведомление.
- Если при создании любого файла возникает ошибка — генерация полностью прекращается, и пользователь видит причину.

---
