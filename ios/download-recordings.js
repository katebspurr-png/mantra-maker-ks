#!/usr/bin/env node

/**
 * Download Recordings from Supabase
 *
 * This script downloads all your recordings from Supabase storage
 * and creates a metadata JSON file for easy import.
 *
 * Usage:
 *   1. Install dependencies: npm install @supabase/supabase-js dotenv
 *   2. Create .env file with SUPABASE_URL and SUPABASE_ANON_KEY
 *   3. Run: node download-recordings.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const OUTPUT_DIR = path.join(__dirname, 'imported-recordings');

async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('🎵 Resonance Recording Downloader\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('❌ Not authenticated. Please sign in to the web app first.');
    console.error('   Then copy your session from browser DevTools > Application > Local Storage');
    process.exit(1);
  }

  console.log(`👤 User: ${user.email}`);

  // Fetch all recordings
  console.log('\n📥 Fetching recordings...');
  const { data: recordings, error: recordingsError } = await supabase
    .from('recordings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (recordingsError) {
    console.error('❌ Error fetching recordings:', recordingsError);
    process.exit(1);
  }

  if (!recordings || recordings.length === 0) {
    console.log('ℹ️  No recordings found');
    process.exit(0);
  }

  console.log(`✅ Found ${recordings.length} recording(s)\n`);

  // Download each recording
  const metadata = [];
  let successCount = 0;

  for (let i = 0; i < recordings.length; i++) {
    const recording = recordings[i];
    const num = i + 1;

    console.log(`[${num}/${recordings.length}] ${recording.title}`);

    try {
      // Get public URL for the audio file
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(recording.audio_file_path);

      if (!urlData || !urlData.publicUrl) {
        console.error(`   ❌ Could not get URL`);
        continue;
      }

      // Download file
      const fileName = `${recording.id}.m4a`;
      const outputPath = path.join(OUTPUT_DIR, fileName);

      await downloadFile(urlData.publicUrl, outputPath);
      console.log(`   ✅ Downloaded`);

      // Store metadata
      metadata.push({
        id: recording.id,
        fileName: fileName,
        title: recording.title,
        text: recording.text,
        category: recording.category,
        duration: recording.duration_seconds,
        createdAt: recording.created_at,
        isFavorite: recording.is_favorite || false,
        listenCount: recording.listen_count || 0,
        affirmationId: recording.affirmation_id,
        isBestTake: recording.is_best_take || false,
      });

      successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Save metadata JSON
  const metadataPath = path.join(OUTPUT_DIR, 'recordings-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Create import instructions
  const instructionsPath = path.join(OUTPUT_DIR, 'IMPORT_INSTRUCTIONS.txt');
  fs.writeFileSync(instructionsPath, `
Resonance Recording Import Instructions
========================================

Successfully downloaded ${successCount} of ${recordings.length} recording(s).

HOW TO IMPORT TO iOS APP:
-------------------------

Method 1: iTunes File Sharing (Recommended)
1. Connect your iPhone/iPad to your Mac
2. Open Finder (or iTunes on older macOS)
3. Select your device
4. Go to Files tab > Resonance app
5. Drag all .m4a files from this folder into the Resonance Documents area
6. In the iOS app:
   - Open Profile tab
   - Tap "Import Recordings"
   - Tap "Scan for New Recordings"

Method 2: Enhanced Import with Metadata (Coming Soon)
We can create a more advanced import that preserves all metadata.
Let me know if you need this!

FILES IN THIS FOLDER:
--------------------
- *.m4a files: Your audio recordings
- recordings-metadata.json: Original metadata (titles, text, categories, etc.)
- IMPORT_INSTRUCTIONS.txt: This file

WHAT GETS IMPORTED:
------------------
✓ Audio files (.m4a format)
✓ File names (used as initial titles)

After import, you can manually:
- Edit titles to match original
- Add affirmation text
- Set categories
- Mark favorites

METADATA PRESERVED:
------------------
The recordings-metadata.json file contains all original metadata.
Reference this file when editing recordings after import to restore:
- Original titles
- Affirmation text
- Categories
- Creation dates
- Favorite status
`);

  console.log(`\n✨ Complete!`);
  console.log(`\n📁 Output folder: ${OUTPUT_DIR}`);
  console.log(`   - ${successCount} audio files`);
  console.log(`   - recordings-metadata.json`);
  console.log(`   - IMPORT_INSTRUCTIONS.txt`);
  console.log(`\n📖 See IMPORT_INSTRUCTIONS.txt for next steps`);
}

main().catch(console.error);
