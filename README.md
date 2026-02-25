<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1c_7krZeJkPbSEZR_SLGUoO3m1tcAsfww

## Run Locally

**Prerequisites:**  Node.js

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build Android APK with GitHub Actions

This repo now includes a workflow at `.github/workflows/android-apk.yml` that packages the Vite app as an Android APK using Capacitor.

### How to use

1. Push your code to `main` (or trigger the workflow manually from **Actions → Build Android APK → Run workflow**).
2. Wait for the workflow to complete.
3. Download the `app-debug-apk` artifact from the workflow run.
4. Install the downloaded `app-debug.apk` on your Android device.

### Notes

- The generated file is a **debug** APK, suitable for testing and side-loading.
- If Android blocks installation, enable installs from unknown sources for the app you're using to open the APK.
