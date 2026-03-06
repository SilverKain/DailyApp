# 📓 Ежедневник

Современное приложение-ежедневник (Task Manager / Planner) на React + TypeScript.

## Возможности

- 📋 **Дашборд** — обзор всех задач на одном экране
- 📅 **Календарь** — просмотр задач по датам
- 📁 **Проекты** — группировка задач по проектам с цветными метками
- 📥 **Входящие** — быстрое добавление задач без даты
- 📝 **Заметки** — встроенный редактор заметок
- 🌙 **Тёмная тема** — перключение светлой/тёмной темы
- 💾 **localStorage** — данные сохраняются в браузере без backend
- 📤 **Экспорт/Импорт JSON** — резервное копирование данных

## Технологии

- React 18
- TypeScript
- Vite
- React Router v6
- CSS Modules

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Деплой на GitHub Pages

```bash
npm run deploy
```

> Перед деплоем убедитесь, что в `package.json` поле `homepage` содержит адрес вашего GitHub Pages репозитория.  
> Например: `"homepage": "https://username.github.io/diary-app"`

## Структура проекта

```
src/
├── components/        # UI компоненты
│   ├── AddTaskInput/
│   ├── Calendar/
│   ├── Layout/
│   ├── ProjectList/
│   ├── TaskDetails/
│   ├── TaskItem/
│   └── TaskList/
├── context/           # React Context (глобальное состояние)
│   ├── NotesContext.tsx
│   ├── ProjectContext.tsx
│   ├── TaskContext.tsx
│   └── ThemeContext.tsx
├── hooks/             # Custom hooks
│   ├── useProjects.ts
│   └── useTasks.ts
├── pages/             # Страницы приложения
│   ├── Dashboard/
│   ├── NotesPage/
│   ├── ProjectsPage/
│   └── SettingsPage/
├── services/          # Сервисы хранилища
│   ├── localStorageProvider.ts
│   └── storageService.ts
├── styles/            # Глобальные стили
│   └── global.css
├── types/             # TypeScript типы
│   └── index.ts
└── utils/             # Вспомогательные функции
    ├── dateHelpers.ts
    ├── generateId.ts
    └── jsonHelpers.ts
```

## Подготовка к Firebase

Для подключения Firebase замените `localStorageProvider` на `firebaseProvider` в `src/services/storageService.ts` и реализуйте методы интерфейса `StorageProvider`.
