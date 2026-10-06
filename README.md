# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Backend (Firebase)

The app talks to Firebase Auth for sign-in and to its own HTTP API (`functions/`, Cloud Functions) for market data. The app never calls brapi.dev directly, so the data source can change without republishing the app.

```
screens → hooks (src/hooks, src/contexts) → services (src/services) → Cloud Function `api` → brapi.dev
```

Setup:

1. Copy `.env.example` to `.env` and fill it with the web app config from the Firebase console.
2. Deploy the backend (requires the Blaze plan):

   ```bash
   npx firebase-tools login
   npx firebase-tools use <project-id>
   npx firebase-tools functions:secrets:set BRAPI_TOKEN
   npm --prefix functions install
   npx firebase-tools deploy --only functions,hosting
   ```

Google sign-in opens `firebase-hosting/google-sign-in.html` (served from the project's auth domain) in a browser session, which returns a Google ID token to the app. This works in Expo Go without native modules.

API routes (all require `Authorization: Bearer <Firebase ID token>`):

- `GET /tickers?q=PET` → `{ tickers: [{ symbol, name }] }`
- `GET /quotes?symbols=PETR4,VALE3` → `{ quotes: [{ symbol, name, logoUrl, price, changePercent, previousClose, open, dayLow, dayHigh, volume, marketCap, fiftyTwoWeekLow, fiftyTwoWeekHigh, updatedAt }], failed: [] }`
- `GET /watchlist` → `{ tickers: [{ symbol, name }] }`
- `POST /watchlist` with `{ tickers: [{ symbol, name }] }` → `{ tickers }`
- `DELETE /watchlist/:symbol` → `{ tickers }`

### Known issue: Google/GitHub login doesn't work in Expo Go on Android

Testing the Google/GitHub sign-in on **Expo Go on Android** fails with `Failed to download remote update` after authorizing and returning from the browser. This is a confirmed, unresolved limitation of Expo Go itself — it doesn't reliably deep-link back into the running session on Android (see [expo/expo#22572](https://github.com/expo/expo/issues/22572), [#27500](https://github.com/expo/expo/issues/27500), [#34187](https://github.com/expo/expo/issues/34187)). It's not something fixable from this app's code, and confirmed same-Wi-Fi and `--tunnel` don't change the outcome.

OAuth works fine on iOS Expo Go. To test it on Android, build a development client instead (no local Android SDK/Android Studio needed — it builds in Expo's cloud):

```bash
npx eas build --profile development --platform android
```

Install the resulting APK on the device, then run the dev server with `npx expo start --dev-client` instead of plain `expo start`.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
