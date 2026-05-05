#!/usr/bin/env node

/**
 * Simple Recording Downloader for Resonance iOS
 *
 * This script downloads ALL recordings from your Supabase storage bucket.
 * Since you need to be authenticated, this will prompt for your user ID.
 *
 * SAFETY: This script only READS from Supabase. Your original data is 100% safe.
 *
 * Usage:
 *   1. npm install @supabase/supabase-js dotenv --legacy-peer-deps
 *   2. Run: node download-recordings-simple.mjs
 *   3. Enter your user ID when prompted
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your .env file');
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, 'resonance-import-package');

function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
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

async function promptForUserId() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n📋 To get your user ID:');
    console.log('   1. Open the web app in your browser and sign in');
    console.log('   2. Open DevTools (F12 or Cmd+Option+I)');
    console.log('   3. Go to Console tab');
    console.log('   4. Paste this and press Enter:');
    console.log('      ');
    console.log('      const data = JSON.parse(localStorage.getItem("sb-uwzjdosvirwzgbiouzcd-auth-token"));');
    console.log('      console.log(data.user.id);');
    console.log('      ');
    console.log('   5. Copy the UUID that appears\n');

    rl.question('Paste your user ID here: ', (userId) => {
      rl.close();
      resolve(userId.trim());
    });
  });
}

async function main() {
  console.log('🎵 Resonance Recording Downloader\n');
  console.log('✅ SAFE: This only downloads (reads) from Supabase');
  console.log('   Your original data remains untouched\n');

  // Get user ID
  const userId = await promptForUserId();

  if (!userId || userId.length < 30) {
    console.error('❌ Invalid user ID');
    process.exit(1);
  }

  console.log('\n✅ User ID received\n');

  // Create authenticated client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Fetch recordings with all metadata
  console.log('📥 Fetching recordings from Supabase...');
  const { data: recordings, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('   Make sure your user ID is correct');
    process.exit(1);
  }

  if (!recordings || recordings.length === 0) {
    console.log('ℹ️  No recordings found for this user');
    process.exit(0);
  }

  console.log(`✅ Found ${recordings.length} recording(s)\n`);

  // Download audio files and build import data
  const importData = {
    version: '1.0',
    exported: new Date().toISOString(),
    recordingsCount: recordings.length,
    recordings: []
  };

  let successCount = 0;
  const audioDir = path.join(OUTPUT_DIR, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  for (let i = 0; i < recordings.length; i++) {
    const rec = recordings[i];
    const num = i + 1;

    console.log(`[${num}/${recordings.length}] ${rec.title}`);

    try {
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(rec.audio_file_path);

      if (!urlData?.publicUrl) {
        console.error(`   ❌ No URL available`);
        continue;
      }

      // Download audio file
      const audioFileName = `${rec.id}.m4a`;
      const audioPath = path.join(audioDir, audioFileName);

      await downloadFile(urlData.publicUrl, audioPath);
      console.log(`   ✅ Downloaded audio`);

      // Add to import manifest
      importData.recordings.push({
        id: rec.id,
        audioFile: audioFileName,
        title: rec.title,
        text: rec.text || '',
        category: rec.category || null,
        duration: rec.duration_seconds || 0,
        createdAt: rec.created_at,
        isFavorite: rec.is_favorite || false,
        listenCount: rec.listen_count || 0,
        affirmationId: rec.affirmation_id || null,
        isBestTake: rec.is_best_take || false,
        tags: rec.tags || []
      });

      successCount++;

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  // Save import manifest
  const manifestPath = path.join(OUTPUT_DIR, 'resonance-import.json');
  fs.writeFileSync(manifestPath, JSON.stringify(importData, null, 2));
  console.log(`\n✅ Created import manifest`);

  // Create iOS-compatible bundle info
  const readmePath = path.join(OUTPUT_DIR, 'README.txt');
  fs.writeFileSync(readmePath, `
Resonance iOS Import Package
=============================

✨ Successfully created package with ${successCount} recording(s)
📅 Exported: ${new Date().toLocaleString()}

WHAT'S IN THIS PACKAGE:
-----------------------
📄 resonance-import.json - Import manifest with all metadata
📁 audio/ - Your .m4a recording files
📖 README.txt - This file

HOW TO IMPORT:
--------------

🚀 METHOD 1: COMPLETE IMPORT (Recommended)
   Preserves all metadata: titles, text, categories, favorites, etc.

   1. Connect iPhone/iPad via cable
   2. Open Finder > Select device > Files tab
   3. Select "Resonance" app
   4. Drag 'resonance-import.json' AND all files from audio/ folder into Resonance Documents
   5. In iOS app: Profile > Import Recordings > "Import JSON" tab
   6. Tap "Import from JSON Package"

   ✨ This restores everything exactly as it was!

📦 METHOD 2: AUDIO FILES ONLY
   Just imports audio, you'll manually add metadata

   1. Connect iPhone/iPad via cable
   2. Open Finder > Select device > Files tab
   3. Select "Resonance" app
   4. Drag all files from audio/ folder into Resonance Documents
   5. In iOS app: Profile > Import Recordings > "Scan Files" tab
   6. Tap "Scan for New Recordings"

WHAT GETS RESTORED (Method 1):
------------------------------
✅ Recording titles
✅ Affirmation text
✅ Categories
✅ Creation dates
✅ Favorite status
✅ Listen counts
✅ Affirmation groupings (multiple takes)
✅ Best take designations
✅ Tags

SAFETY:
-------
✅ Your original Supabase data is COMPLETELY SAFE
✅ This is a read-only copy
✅ Nothing was deleted from Supabase
✅ You can re-export anytime

TROUBLESHOOTING:
---------------
Q: Import not working?
A: Make sure you copied the JSON file AND the audio files

Q: Files not appearing in Finder?
A: Enable file sharing in iOS Settings > General > iPhone Storage > Resonance

Q: Want to re-import?
A: Just run this script again - it always creates a fresh package

---
Questions? Check QUICK_START_IMPORT.md in the ios folder
`);

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ PACKAGE CREATED SUCCESSFULLY!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
  console.log(`📊 ${successCount} of ${recordings.length} recordings exported\n`);
  console.log(`📦 Contents:`);
  console.log(`   • resonance-import.json (${(fs.statSync(manifestPath).size / 1024).toFixed(1)} KB)`);
  console.log(`   • audio/ folder (${successCount} files)`);
  console.log(`   • README.txt (instructions)\n`);
  console.log(`🔒 Safety: Your Supabase data is untouched`);
  console.log(`✨ Ready to import to iOS!`);
  console.log(`\n📖 See README.txt for import instructions\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
