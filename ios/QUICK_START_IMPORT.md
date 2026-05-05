# Quick Start: Import Your Recordings to iOS

## 🚀 One-Time Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd ios
npm install @supabase/supabase-js dotenv
```

### Step 2: Run the Enhanced Download Script
```bash
node download-recordings-enhanced.js
```

This will:
- ✅ Connect to your Supabase (read-only, 100% safe)
- ✅ Download all your recordings with full metadata
- ✅ Create a `resonance-import-package` folder
- ✅ Generate `resonance-import.json` with all your data

**Your original Supabase data is completely safe** - this only downloads copies!

---

## 📱 Transfer to iPhone/iPad

### Method A: iTunes File Sharing (Recommended)

1. **Connect your device** to Mac via cable

2. **Open Finder** (macOS Catalina+) or iTunes (older)

3. **Select your device** in the sidebar

4. Click **"Files"** tab

5. Scroll to **File Sharing** section

6. Click **"Resonance"** app

7. **Drag these files** into the Resonance Documents area:
   - `resonance-import.json` (the manifest)
   - All `.m4a` files from the `audio/` folder

   💡 Tip: Select all audio files at once and drag together

---

## 📲 Import in the App

1. **Open Resonance** on your device

2. Go to **Profile** tab (bottom right)

3. Tap **"Import Recordings"**

4. Select **"Import JSON"** tab

5. Tap **"Import from JSON Package"**

6. Wait for import to complete (usually under 30 seconds)

7. **Done!** ✨

---

## ✅ What Gets Restored

Everything from your web app:

- ✅ Recording titles
- ✅ Affirmation text
- ✅ Categories (confidence, calm, etc.)
- ✅ Creation dates
- ✅ Favorite status
- ✅ Listen counts
- ✅ Affirmation groupings (multiple takes)
- ✅ Best take designations
- ✅ Tags (if you had them)

---

## 🔧 Troubleshooting

**"resonance-import.json not found"**
- Make sure you copied the JSON file via iTunes File Sharing
- Check it's in the main Resonance Documents folder (not a subfolder)

**"Missing audio: [filename]"**
- Also copy the audio files from the `audio/` folder
- Make sure to copy all .m4a files, not just the JSON

**"Could not parse JSON file"**
- Re-run the download script
- Make sure the file wasn't corrupted during transfer

**Files not showing in Finder?**
- Make sure the app is installed on your device
- Try unplugging and reconnecting the device
- Check iOS Settings > General > iPhone Storage > Resonance

---

## 🎯 Alternative: Audio Files Only

If you just want the audio without metadata:

1. Copy only the `.m4a` files (skip the JSON)
2. In app: Profile > Import Recordings > "Scan Files" tab
3. Tap "Scan for New Recordings"

You'll need to manually add titles and text afterward.

---

## 🔄 Re-importing

Want to re-import? No problem:

1. Delete the old import: In app, delete recordings you want to replace
2. Run the download script again (always safe)
3. Transfer and import again

---

## 📊 Verification

After import, check:
- Profile > My Affirmations (see grouped recordings)
- Library (see all recordings with proper titles)
- Recording detail (tap any recording to see full metadata)

---

## 🆘 Need Help?

If you run into issues:

1. Check the import log in the app (shows what succeeded/failed)
2. Verify files are in the correct location (use Files app on iOS)
3. Try the "Scan Files" method as a fallback
4. Re-run the download script (always safe to do)

Your Supabase data is never touched - you can always try again!

---

**Estimated Time:** 10 minutes total
- 2 min: Run script
- 5 min: Transfer files
- 2 min: Import in app
- 1 min: Verify

Enjoy your recordings in the native iOS app! 🎉
