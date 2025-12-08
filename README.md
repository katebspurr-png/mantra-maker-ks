# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/55ec4cc3-10d3-491c-aa9b-48db253d017b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/55ec4cc3-10d3-491c-aa9b-48db253d017b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- vite-plugin-pwa (Progressive Web App support)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/55ec4cc3-10d3-491c-aa9b-48db253d017b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## PWA Testing Guide

### Testing PWA Installation

1. **Chrome DevTools (Desktop)**
   - Open Chrome DevTools (F12)
   - Go to the **Application** tab
   - Check the **Manifest** section to verify the web app manifest is loaded correctly
   - Check the **Service Workers** section to verify the service worker is registered
   - Use the "Install" button in the address bar or the Application tab to test installation

2. **Lighthouse Audit**
   - Open Chrome DevTools (F12)
   - Go to the **Lighthouse** tab
   - Select "Progressive Web App" category
   - Click "Analyze page load" to run the PWA audit
   - Review the results for any failed criteria

3. **Mobile Testing (Android)**
   - Open the app in Chrome on Android
   - Look for the "Add to Home Screen" banner or use Chrome menu → "Install app"
   - The app should appear on your home screen with the Loop Voice Mantra icon
   - Launch it and verify it opens in standalone mode (no browser URL bar)

4. **Mobile Testing (iOS)**
   - Open the app in Safari on iOS
   - Tap the Share button → "Add to Home Screen"
   - The app icon should appear on the home screen
   - Launch it to verify standalone mode

### Testing Offline Mode

1. **DevTools Network Tab**
   - Open Chrome DevTools → Network tab
   - Check the "Offline" checkbox to simulate offline mode
   - Refresh the page - the app shell should still load from cache
   - Note: API calls to the database will fail offline, but cached static assets will work

2. **Service Worker Cache**
   - Go to Application → Cache Storage in DevTools
   - You should see cached assets including HTML, CSS, JS, and icons

### Notes

- The service worker only registers in production builds
- Audio recording and playback require an active internet connection for saving to the database
- Cached audio files from previous sessions may be available offline depending on browser caching
