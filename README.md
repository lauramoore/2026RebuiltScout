# walton scouting app

This app builds and deploys the walton scouting app:
* firebase project hosted on google cloud
* vue3 for UI


## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Setting up UI build 
The UI requires standard firebase configurations during build so they will be injected into the 
firebase.js file.   These are made available to the build using .env files which are by convention
not stored in git create one from the settings provided in firebase console for your target deployment

VITE_FIREBASE_API_KEY="your-firebase-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
VITE_FIREBASE_APP_ID="your-firebase-app-id"
VITE_FIREBASE_APP_MEASURE_ID="your-firebase-app-measureid"
VITE_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"

The Firebase project needs to have the appropriate options enabled
* Google Analytics
* App Check -> follow instructions to setup Recaptcha and get the recaptcha site key

_Pro Tip: make sure there is no space between the = and your value in the config file_

See [Vite Configuration Reference](https://vite.dev/config/).

For local develoment and running with local emulators,  you can copy either prod or staging as .env.local
_(or if all you want is local just fill in dummy values)_

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```
### Compile and Minify for deployment
First clean the last build out
```sh
rm -rf dist
```

```sh
npm run prod
```
or 

```sh
npm run staging
```
_Pro Tip: you can check to make sure environment variables were included in build_
```sh
grep projectId dist/assets/*
```
### Deploy to firebase
Requires you install the [Firebase CLI](https://firebase.google.com/docs/cli)

```sh
firebase deploy --project prod
```

```sh
firebase deploy --project staging
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
