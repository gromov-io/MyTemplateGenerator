[🇬🇧 English](#english) | [🇷🇺 Русский](#russian)

> [!WARNING]
> **This is a mirror!** Main repository: [https://gromlab.ru/gromov/MyTemplateGenerator](https://gromlab.ru/gromov/MyTemplateGenerator)
> 
> GitHub has lost its status as a reliable platform for open-source, applying political repository blocks instead of maintaining neutrality. The blocks have affected developers from Russia (Donetsk, Luhansk, Crimea, Kherson Oblast, Zaporizhzhia Oblast), Iran, Syria, Cuba, and North Korea.
> 
> - ⚠️ Create pull requests and issues only in the main repository
> - 🔄 Mirror is updated automatically
> - 🚫 Changes here will be overwritten

<div id="english">🇬🇧 English</div> 

# MyTemplateGenerator — template and component generator for React, Vue, Next.js, Angular, and more

myTemplateGenerator is a powerful VSCode extension for generating templates, components, and project structures for all popular frameworks: React, Vue, Next.js, Angular, Svelte, Nuxt, NestJS, Express, Gatsby, Remix, SolidJS, Preact. Instantly scaffold files, folders, and boilerplate code for any modern JavaScript or TypeScript project.

## Features
- Syntax highlighting and autocomplete for template variables in template files (`{{name}}`, `{{name.camelCase}}`, etc.)
- Generate project structure, files, and folders for popular frameworks: **React**, **Vue**, **Next.js**, **Angular**, **Svelte**, **Nuxt**, **NestJS**, **Express**, **Gatsby**, **Remix**, **SolidJS**, **Preact**
- Quickly create components: create React components, Vue components, Next.js components, Angular components, and more
- Visual configurator and localization support (Russian/English)
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

**Keywords:**  
template, templates, template generator, component generator, scaffold, scaffolding, boilerplate, starter template, project structure, file generator, folder generator, structure generator, react component generator, vue component generator, nextjs component generator, angular component generator, svelte component generator, nuxt component generator, nestjs generator, express generator, gatsby generator, remix generator, solidjs generator, preact generator, react templates, vue templates, nextjs templates, angular templates, svelte templates, nuxt templates, nestjs templates, express templates, gatsby templates, remix templates, solidjs templates, preact templates, project templates, framework templates, file templates, folder templates, create react component, create vue component, create nextjs component, create angular component, create svelte component, create nuxt component, create nestjs module, create express route, create gatsby page, create remix route, create solidjs component, create preact component, generate files, generate folders, generate structure

<div id="russian">🇷🇺 Русский</div>


> [!WARNING]
> **Это зеркало!** Основной репозиторий: [https://gromlab.ru/gromov/MyTemplateGenerator](https://gromlab.ru/gromov/MyTemplateGenerator)
> 
> GitHub утратил статус надежной площадки для open-source, применяя политические блокировки репозиториев вместо сохранения нейтралитета. Блокировки коснулись разработчиков из России (Донецк, Луганск, Крым, Херсонская обл., Запорожская обл.), Ирана, Сирии, Кубы и Северной Кореи.
> 
> - ⚠️ Pull requests и issues создавайте только в основном репозитории
> - 🔄 Зеркало обновляется автоматически
> - 🚫 Изменения здесь будут перезаписаны

# MyTemplateGenerator — генерация шаблонов и компонентов для React, Vue, Next.js, Angular и других

myTemplateGenerator — это расширение для VSCode, предназначенное для генерации шаблонов, компонентов и структуры проектов для всех популярных фреймворков: React, Vue, Next.js, Angular, Svelte, Nuxt, NestJS, Express, Gatsby, Remix, SolidJS, Preact. Мгновенно создавайте файлы, папки и boilerplate-код для любых современных проектов на JavaScript и TypeScript.

## Возможности
- Подсветка и автокомплит переменных в шаблонных файлах (`{{name}}`, `{{name.camelCase}}` и др.)
- Генерация структуры проекта, файлов и папок для популярных фреймворков: **React**, **Vue**, **Next.js**, **Angular**, **Svelte**, **Nuxt**, **NestJS**, **Express**, **Gatsby**, **Remix**, **SolidJS**, **Preact**
- Быстрое создание компонентов: создание React компонентов, Vue компонентов, Next.js компонентов, Angular компонентов и других
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

**Ключевые слова:**  
создание шаблонов, генерация шаблонов, шаблоны компонентов, создание react компонентов, создание vue компонентов, создание nextjs компонентов, создание angular компонентов, создание svelte компонентов, создание nuxt компонентов, создание nestjs модулей, создание express роутов, создание gatsby страниц, создание remix роутов, создание solidjs компонентов, создание preact компонентов, генератор компонентов, генератор react компонентов, генератор vue компонентов, генератор nextjs компонентов, генератор angular компонентов, генератор svelte компонентов, генератор nuxt компонентов, генератор nestjs модулей, генератор express роутов, генератор gatsby страниц, генератор remix роутов, генератор solidjs компонентов, генератор preact компонентов, react шаблоны, vue шаблоны, nextjs шаблоны, angular шаблоны, svelte шаблоны, nuxt шаблоны, nestjs шаблоны, express шаблоны, gatsby шаблоны, remix шаблоны, solidjs шаблоны, preact шаблоны, шаблоны для проектов, шаблоны для фреймворков, структура проекта, структура папок, генерация файлов, генерация папок, файловый генератор, генератор папок, стартер шаблон