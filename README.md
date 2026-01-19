# defield-starter-app

This template should help get you started developing with Vue 3 in Vite integrated with firebase for authentication.
You will need a firebase emulator project to provide authentication backend running locally on your machine.

For details on installing and configuring firebase emulators (https://firebase.google.com/docs/emulator-suite/install_and_configure)
When you are contributing a defield UI  the defield-functions project provides all the specfic actions and tables used in the real app.

This is a Vue3 application when googling/chatGPT for guidance be sure to filter for Vue3 suggestions.


When setup correctly,  your initial home view will include the option to login and when emulators are setup correctly then you
will be able to login and the view will indicate your new login state.

Understand the nature of the firebase state interaction with callbacks on the view lifecycles

In HelloWorld.vue the onAuthenticationState change fires when login or logout is completed with the emulator.

Auth.vue wraps firebaseui as a vue component, the UI provides all the neccesary interactions with firebase to register and login new users.  Each application will allow for different login options.

Before deploying a live app, the credentials will be replaced with environment variables and served from .env files so that application Ids, auth tokens are never checked into source control.


## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

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
### Compile and Minify for Production

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
