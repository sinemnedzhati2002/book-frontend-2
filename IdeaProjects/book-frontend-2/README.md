








**__**Book Tracker - Webtechnologien Projekt**__** 

Dieses Projekt ist im Rahmen der Vorlesung Webtechnologien entstanden. Es handelt sich um eine Webanwendung zur Verwaltung von Büchern mit Frontend (Vue 3) und Backend (Spring Boot), die über eine REST-API miteinander kommunizieren.

Use Cases Die Anwendung unterstützt folgende Use Cases:

1. Alle Bücher anzeigen
2. Bücher filtern (nach Titel, Autor, Genre)
3. neue Buch anlegen
4. Buch bearbeiten
5. Buch löschen
6. To-Read-Liste (Bücher, die noch gelesen werden sollen)
7. Fertig gelesene Liste
8. Status ändern (To-Read <-> Fertig)
9. Datumseingaben
   - geplantes Lese-Datum
   - Fertigstellungsdatum (wird automatisch gesetzt)
   
Bereitstellungs-Backend: https://book-backend-2-ba5q.onrender.com 

Frontend: https://book-frontend-2-qbx4.onrender.com

Autorin: Sinem Nedzhati





















# book-frontend-2

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
