# Import Recordings to Resonance iOS App

This guide will help you import your existing recordings from the web app into the iOS app.

## Method 1: Via iTunes File Sharing (Easiest)

### Step 1: Download Your Recordings from Supabase

1. **Get your audio files from Supabase Storage:**
   - Go to your Supabase project dashboard
   - Navigate to Storage > `recordings` bucket
   - Download all your .m4a files to a folder on your Mac

### Step 2: Connect Device and Transfer Files

1. **Connect your iPhone/iPad to your Mac** via cable
2. **Open Finder** (macOS Catalina+) or **iTunes** (older versions)
3. Select your device in the sidebar
4. Click on **"Files"** tab
5. Scroll down to **"File Sharing"** section
6. Select **"Resonance"** from the app list
7. **Drag and drop** your .m4a files into the "Resonance Documents" area
8. The files will be copied to the app's Documents folder

### Step 3: Import in the App

1. Open **Resonance** app on your device
2. Go to **Profile** tab
3. Tap **"Import Recordings"**
4. Tap **"Scan for New Recordings"**
5. The app will find and import all audio files

## Method 2: Via AirDrop

### Step 1: Prepare Files
- Make sure your .m4a files are on your Mac
- Rename files if needed (filename becomes the recording title)

### Step 2: AirDrop to Device
1. **Enable AirDrop** on both Mac and iOS device
2. Select your .m4a files on Mac
3. Right-click > Share > **AirDrop** > Select your device
4. On iOS device, select **"Save to Files"**
5. Choose **Resonance** app folder or **On My iPhone/iPad**

### Step 3: Move to App Directory (Advanced)
This requires using the Files app and may be limited by iOS sandboxing. **iTunes File Sharing method is recommended** instead.

## Method 3: Using Helper Script (For Many Recordings)

If you have many recordings, I can create a Node.js script that will:
1. Connect to your Supabase project
2. Download all recordings with metadata
3. Package them for import
4. Create a JSON manifest with titles, categories, etc.

Let me know if you need this!

## Supported Audio Formats

- **.m4a** (recommended - native iOS format)
- **.mp3**
- **.wav**

## File Naming

- Files are identified by their filename (without extension)
- Underscores are replaced with spaces for the title
- Example: `my_affirmation_2024.m4a` → Title: "my affirmation 2024"

## Import Behavior

- **Duplicate Detection**: Files already imported will be skipped
- **Metadata**: Initially imports with generic metadata
- **Audio Quality**: Original quality preserved
- **Affirmation Text**: You can edit titles and add text after import

## After Import

Once imported, you can:
1. Edit recording titles (tap the recording → pencil icon)
2. Add affirmation text
3. Categorize recordings
4. Mark as favorite
5. Run tone analysis
6. Add to playlists

## Troubleshooting

**"No files found"**
- Make sure files are in the correct format (.m4a, .mp3, .wav)
- Check that files are actually transferred via iTunes File Sharing
- Files should appear in Finder > Device > Files > Resonance

**"Invalid audio"**
- File may be corrupted
- Try playing the file on your Mac first to verify it works
- Re-export or re-download the file

**"Already imported"**
- The app detected this file was previously imported
- Check your Library to see existing recordings

## Getting Recording Metadata

If you want to preserve your original metadata (titles, categories, affirmation text), you'll need to export from Supabase:

```sql
-- Run this in Supabase SQL Editor to export your recordings
SELECT
  id,
  title,
  text,
  category,
  duration_seconds,
  created_at,
  audio_file_path
FROM recordings
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

Export as JSON, then we can create an import script that matches filenames to metadata.

---

Need help? Let me know and I can assist with any of these methods!
