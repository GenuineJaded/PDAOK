# PDA.OK Android build and installation

## Current checkpoint — November 17, 2026

The app uses Expo SDK 54, React Native 0.81.5, and a native Android home-screen
widget. Expo Go cannot load that custom widget module. An EAS preview build
creates an installable APK that runs without a development server.

The package versions and lockfile have been aligned with SDK 54. GitHub Actions
checks package compatibility, TypeScript, lint, Android native configuration,
and the Android JavaScript bundle on pushes and pull requests. Native compilation and phone testing are separate
checks; passing a JavaScript bundle does not prove an APK works on a phone.

Verified locally during the repair: Expo Doctor passed 18/18 checks, TypeScript
passed, lint had zero errors (129 existing warnings), the Android Hermes bundle
exported, and Android prebuild completed in a temporary copy. Native Gradle
compilation and installed-APK phone tests are still pending.

The earlier closing note in FINAL.md predates the AI Connection settings and
latest widget persistence changes. AI settings now support OpenRouter and OpenAI
with a key entered inside the app; no developer API key needs to be bundled.

## Existing app identity

Keep these values when building an update for existing installations:

- Android package: `com.michaelmistree.pdataskapp`
- Expo project: `8ee41b0c-cac2-4fd3-a68b-dac31cbe0c53`
- Deep-link scheme: `pdaok`
- App version: `1.0.0`; Android version code: `1`

Use the existing Android signing key too. A different signing key cannot update
an existing installation. Journal data lives in device AsyncStorage; there is
currently no in-app export/import feature. Keep the existing installation while
checking the update path. An APK has its own storage, separate from Expo Go.

## Before building

Use Node.js 22 LTS and the committed npm lockfile:

```bash
npm ci
npx expo install --check
npx expo-doctor
npm run typecheck
npm run lint
npx expo prebuild --platform android --no-install
npx expo export --platform android --output-dir dist
```

The first repair review found the computer logged into an Expo account without
access to the linked project, and no `EXPO_TOKEN` secret in this GitHub repository.
Access to that existing project must be restored before a cloud APK can be built.
Do not replace its project ID to work around an account error.

Check the active account and project:

```bash
npx eas-cli@27.10.0 whoami
npx eas-cli@27.10.0 project:info
```

If access is denied, use `npx eas-cli@27.10.0 login` to sign into the account that
owns the original project, or have that owner grant the current account access.
Passwords and tokens must never be put into source files. Login details were
removed from the old GitHub workflow during this repair; the exposed password
still needs rotating because removing it does not erase Git history.

## Make a standalone APK

Once the existing project and signing credentials are accessible:

```bash
npx eas-cli@27.10.0 build --platform android --profile preview
```

The `preview` profile in eas.json requests an internally distributed APK. Download
it from the completed Expo build page and install it on an Android phone. It does
not need Expo Go, a QR development session, or the computer to remain running.

## Build through GitHub

The workflow is `.github/workflows/build-android.yml`.

1. Generate an Expo access token for an account authorized on the existing project.
2. Add it as the repository Actions secret `EXPO_TOKEN`. For example, run
   `gh secret set EXPO_TOKEN --repo GenuineJaded/PDAOK` and enter the token privately.
3. Ensure the original Android signing credentials are configured in that Expo
   project. A non-interactive CI run cannot answer first-time credential prompts.
4. In GitHub Actions, open **Android checks and APK**, then select **Run workflow**
   on `main`. Command-line equivalent:

   ```bash
   gh workflow run build-android.yml --repo GenuineJaded/PDAOK --ref main
   ```

5. After validation and the EAS build succeed, download the **PDA.OK-android-apk**
   artifact from that run. It contains **PDA.OK.apk**.

Ordinary pushes run validation only. Manual runs build with the `preview` profile
and download the result of that specific build, rather than whichever unrelated
build happens to be newest in the account.

## Phone checks before calling the APK ready

- Open the app with no computer or Metro server running.
- Check both a fresh installation and the update path with existing journal data.
- Log a substance, nourishment, and movement; close and reopen the app and verify
  that each entry remains.
- Add the Quip widget. Test all three buttons with the app closed and already open.
  Check save, cancel, repeated taps, and returning to the launcher without losing
  a saved entry.
- Open journal entry details from the Substances screen. A historical tap issue
  remains recorded in todo.md and needs device verification.
- Start a short timer, grant notifications if requested, background the app, and
  verify the notification arrives.
- Confirm logging works with no AI key. If using AI, save a provider/key/model in
  AI Connection and use its Test button. This sends a request to that provider.

## Play Store builds

The `production` profile produces an AAB for Google Play, rather than a directly
installable APK:

```bash
npx eas-cli@27.10.0 build --platform android --profile production
```

A Play Store release is a separate step: verify the existing listing and signing
configuration, increment the Android version code beyond the last published
release, and complete the current store requirements. No store submission is
part of this build repair.
