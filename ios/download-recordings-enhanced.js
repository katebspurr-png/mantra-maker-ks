#!/usr/bin/env node

/**
 * Enhanced Recording Import for Resonance iOS
 *
 * This script downloads recordings from Supabase AND preserves all metadata.
 * It creates a package ready for one-click import to iOS.
 *
 * SAFETY: This script only READS from Supabase. Your original data is 100% safe.
 *
 * Usage:
 *   1. npm install @supabase/supabase-js dotenv
 *   2. Ensure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 *   3. Run: node download-recordings-enhanced.js
 *   4. Transfer the created 'resonance-import.json' file to iOS app
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
  console.error('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
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

async function main() {
  console.log('🎵 Resonance Enhanced Import Package Creator\n');
  console.log('✅ SAFE: This only downloads (reads) from Supabase');
  console.log('   Your original data remains untouched\n');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('❌ Not authenticated');
    console.error('   Sign in to the web app, then run this script');
    process.exit(1);
  }

  console.log(`👤 User: ${user.email}\n`);

  // Fetch recordings with all metadata
  console.log('📥 Fetching recordings from Supabase...');
  const { data: recordings, error } = await supabase
    .from('recordings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  if (!recordings || recordings.length === 0) {
    console.log('ℹ️  No recordings found');
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

HOW TO IMPORT (2 Methods):
--------------------------

🚀 METHOD 1: COMPLETE IMPORT (Recommended)
   Preserves all metadata: titles, text, categories, favorites, etc.

   1. Copy 'resonance-import.json' to your Mac
   2. Connect iPhone/iPad via cable
   3. Open Finder > Select device > Files tab
   4. Select "Resonance" app
   5. Drag 'resonance-import.json' into Resonance Documents
   6. In iOS app: Profile > Import Recordings > "Import from JSON"

   ✨ This restores everything exactly as it was!

📦 METHOD 2: AUDIO FILES ONLY
   Just imports audio, you'll manually add metadata

   1. Connect iPhone/iPad via cable
   2. Open Finder > Select device > Files tab
   3. Select "Resonance" app
   4. Drag all files from audio/ folder into Resonance Documents
   5. In iOS app: Profile > Import Recordings > "Scan for New Recordings"

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
Questions? Check IMPORT_RECORDINGS_GUIDE.md in the ios folder
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
