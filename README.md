[🇬🇧 English](#mytemplategenerator) | [🇷🇺 Русский](#mytemplategenerator-русский)

# MyTemplateGenerator

**Generate files and folders from templates with variable substitution right from the VS Code context menu.**

- Syntax highlighting and autocomplete for template variables in template files (`{{name}}`, `{{name.camelCase}}`, etc.)
- Instantly create project structure from templates with variables in file/folder names and content
- Visual configurator and full localization (English/Russian)
- Flexible settings: templates folder path, variable input mode, overwrite protection

![Logo](https://raw.githubusercontent.com/gormov1122/MyTemplateGenerator/main/src/images/1.png)
![Logo](https://raw.githubusercontent.com/gormov1122/MyTemplateGenerator/main/src/images/3.png)

**How to use:**
1. Create a folder with templates (default: `.templates`).
2. Use variables in templates: `{{name}}`, `{{name.pascalCase}}`, etc.
3. Right-click any folder in your project → **Create from template...**
4. Select a template, fill in variables — the structure is generated automatically.

**Example template:**
```
.templates/
  component/
    {{name}}/
      index.tsx
      {{name.camelCase}}.module.css
```

**Available modifiers:**

| Modifier              | Example (`name = myComponent`) |
|-----------------------|-------------------------------|
| `{{name}}`            | myComponent                   |
| `{{name.pascalCase}}` | MyComponent                   |
| `{{name.camelCase}}`  | myComponent                   |
| `{{name.snakeCase}}`  | my_component                  |
| `{{name.kebabCase}}`  | my-component                  |
| `{{name.screamingSnakeCase}}` | MY_COMPONENT           |
| `{{name.upperCase}}`  | Mycomponent                   |
| `{{name.lowerCase}}`  | mycomponent                   |
| `{{name.upperCaseAll}}` | MYCOMPONENT                  |
| `{{name.lowerCaseAll}}` | mycomponent                  |

**Supported modifiers:** pascalCase, camelCase, snakeCase, kebabCase, upperCase, lowerCase, and more.

**Framework compatibility:**

This extension works with **any framework** — you define your own templates for any structure you need!

| Framework     | Components | Store/State | Pages/Routes | Services | Utils |
|--------------|:----------:|:-----------:|:------------:|:--------:|:-----:|
| React        | ✅         | ✅          | ✅           | ✅       | ✅    |
| Vue          | ✅         | ✅          | ✅           | ✅       | ✅    |
| Angular      | ✅         | ✅          | ✅           | ✅       | ✅    |
| Svelte       | ✅         | ✅          | ✅           | ✅       | ✅    |
| Next.js      | ✅         | ✅          | ✅           | ✅       | ✅    |
| Nuxt         | ✅         | ✅          | ✅           | ✅       | ✅    |
| Solid        | ✅         | ✅          | ✅           | ✅       | ✅    |
| Vanilla JS/TS| ✅         | ✅          | ✅           | ✅       | ✅    |

Just create a template for your favorite stack — and generate any structure you want! 🎉

**Configuration:**
All settings are managed via the standard VSCode user settings (or the visual configurator).

To open the settings menu, press <kbd>Ctrl</kbd>+<kbd>P</kbd>, type `Configure myTemplateGenerator...` and select the menu item.

You can also find all options in VSCode settings under `myTemplateGenerator`.


# MyTemplateGenerator (русский)

**Генерация файлов и папок по шаблонам с автозаменой переменных прямо из контекстного меню VS Code.**

- Подсветка и автокомплит переменных в шаблонных файлах (`{{name}}`, `{{name.camelCase}}` и др.)
- Быстрое создание структуры проекта по шаблонам с подстановкой переменных в имена файлов, папок и содержимое
- Визуальный конфигуратор и поддержка локализации (русский/английский)
- Гибкая настройка: путь к шаблонам, режим ввода переменных, запрет/разрешение перезаписи файлов

![Logo](https://raw.githubusercontent.com/gormov1122/MyTemplateGenerator/main/src/images/1.png)
![Logo](https://raw.githubusercontent.com/gormov1122/MyTemplateGenerator/main/src/images/3.png)

**Как использовать:**
1. Создайте папку с шаблонами (по умолчанию `.templates`).
2. Используйте переменные в шаблонах: `{{name}}`, `{{name.pascalCase}}` и т.д.
3. Кликните правой кнопкой по папке в проекте → **Создать из шаблона...**
4. Выберите шаблон, заполните переменные — структура будет создана автоматически.

**Пример шаблона:**
```
.templates/
  component/
    {{name}}/
      index.tsx
      {{name.camelCase}}.module.css
```

**Доступные модификаторы:**

| Модификатор           | Пример (`name = myComponent`)  |
|----------------------|-------------------------------|
| `{{name}}`           | myComponent                   |
| `{{name.pascalCase}}`| MyComponent                   |
| `{{name.camelCase}}` | myComponent                   |
| `{{name.snakeCase}}` | my_component                  |
| `{{name.kebabCase}}` | my-component                  |
| `{{name.screamingSnakeCase}}` | MY_COMPONENT           |
| `{{name.upperCase}}` | Mycomponent                   |
| `{{name.lowerCase}}` | mycomponent                   |
| `{{name.upperCaseAll}}` | MYCOMPONENT                  |
| `{{name.lowerCaseAll}}` | mycomponent                  |

**Поддерживаемые модификаторы:** pascalCase, camelCase, snakeCase, kebabCase, upperCase, lowerCase и др.

**Совместимость с фреймворками:**

Плагин подходит для **любых фреймворков** — вы сами задаёте шаблоны для любой структуры!

| Фреймворк    | Компоненты | Store/State | Страницы/Роуты | Сервисы | Утилиты |
|--------------|:----------:|:-----------:|:--------------:|:-------:|:-------:|
| React        | ✅         | ✅          | ✅             | ✅      | ✅      |
| Vue          | ✅         | ✅          | ✅             | ✅      | ✅      |
| Angular      | ✅         | ✅          | ✅             | ✅      | ✅      |
| Svelte       | ✅         | ✅          | ✅             | ✅      | ✅      |
| Next.js      | ✅         | ✅          | ✅             | ✅      | ✅      |
| Nuxt         | ✅         | ✅          | ✅             | ✅      | ✅      |
| Solid        | ✅         | ✅          | ✅             | ✅      | ✅      |
| Vanilla JS/TS| ✅         | ✅          | ✅             | ✅      | ✅      |

Создайте шаблон под свой стек — и генерируйте любые структуры! 🎉

**Настройка:**
Все параметры задаются через стандартные пользовательские настройки VSCode (или визуальный конфигуратор).

Чтобы открыть меню настроек, нажмите <kbd>Ctrl</kbd>+<kbd>P</kbd>, введите `Настроить myTemplateGenerator...` (или `Configure myTemplateGenerator...` для английского интерфейса) и выберите соответствующий пункт.

Также вы можете найти все параметры в настройках VSCode по ключу `myTemplateGenerator`.
