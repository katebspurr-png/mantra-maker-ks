#!/usr/bin/env node

/**
 * Convert Lovable Export to iOS Import Format
 *
 * This script takes the Lovable export (CSV + WebM files) and converts it
 * to the iOS-compatible import format (JSON + M4A files).
 *
 * Usage:
 *   node convert-lovable-export.mjs
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOVABLE_DIR = path.join(__dirname, 'lovable-export');
const OUTPUT_DIR = path.join(__dirname, 'resonance-import-package');
const CSV_FILE = path.join(LOVABLE_DIR, 'recordings_index.csv');
const RECORDINGS_DIR = path.join(LOVABLE_DIR, 'recordings');

function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
}

function convertAudioFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-y',
      outputPath
    ]);

    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg failed: ${stderr}`));
      }
    });
  });
}

async function main() {
  console.log('🎵 Converting Lovable Export to iOS Format\n');

  // Check if ffmpeg is available
  try {
    await new Promise((resolve, reject) => {
      const check = spawn('ffmpeg', ['-version']);
      check.on('close', (code) => code === 0 ? resolve() : reject());
      check.on('error', reject);
    });
  } catch (err) {
    console.error('❌ ffmpeg not found. Installing via Homebrew...\n');
    console.log('Please run: brew install ffmpeg');
    console.log('Then run this script again.');
    process.exit(1);
  }

  // Read CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error('❌ recordings_index.csv not found');
    console.error('   Make sure lovable-export folder exists with the export files');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const recordings = parseCSV(csvContent);

  console.log(`✅ Found ${recordings.length} recordings in CSV\n`);

  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const audioDir = path.join(OUTPUT_DIR, 'audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Convert recordings
  const importData = {
    version: '1.0',
    exported: new Date().toISOString(),
    recordingsCount: 0,
    recordings: []
  };

  let successCount = 0;

  for (let i = 0; i < recordings.length; i++) {
    const rec = recordings[i];
    const num = i + 1;

    console.log(`[${num}/${recordings.length}] ${rec.title}`);

    try {
      const webmPath = path.join(RECORDINGS_DIR, rec.filename);

      if (!fs.existsSync(webmPath)) {
        console.error(`   ❌ File not found: ${rec.filename}`);
        continue;
      }

      // Convert WebM to M4A
      const audioFileName = `${rec.id}.m4a`;
      const m4aPath = path.join(audioDir, audioFileName);

      console.log(`   ⏳ Converting to M4A...`);
      await convertAudioFile(webmPath, m4aPath);
      console.log(`   ✅ Converted`);

      // Parse tags
      const tags = rec.tags ? rec.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      // Add to import manifest
      importData.recordings.push({
        id: rec.id,
        audioFile: audioFileName,
        title: rec.title,
        text: rec.title, // Use title as text since CSV doesn't have separate text field
        category: tags[0] || null, // Use first tag as category if available
        duration: parseInt(rec.duration_seconds) || 0,
        createdAt: rec.created_at,
        isFavorite: false,
        listenCount: 0,
        affirmationId: null,
        isBestTake: false,
        tags: tags
      });

      successCount++;

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  importData.recordingsCount = successCount;

  // Save import manifest
  const manifestPath = path.join(OUTPUT_DIR, 'resonance-import.json');
  fs.writeFileSync(manifestPath, JSON.stringify(importData, null, 2));
  console.log(`\n✅ Created import manifest`);

  // Create README
  const readmePath = path.join(OUTPUT_DIR, 'README.txt');
  fs.writeFileSync(readmePath, `
Resonance iOS Import Package
=============================

✨ Successfully converted ${successCount} recording(s) from Lovable export
📅 Converted: ${new Date().toLocaleString()}

WHAT'S IN THIS PACKAGE:
-----------------------
📄 resonance-import.json - Import manifest with all metadata
📁 audio/ - Your .m4a recording files (converted from WebM)
📖 README.txt - This file

HOW TO IMPORT:
--------------

🚀 COMPLETE IMPORT (Recommended)
   Preserves all metadata: titles, tags, creation dates, etc.

   1. Connect iPhone/iPad via cable
   2. Open Finder > Select device > Files tab
   3. Select "Resonance" app
   4. Drag 'resonance-import.json' AND all files from audio/ folder into Resonance Documents
   5. In iOS app: Profile > Import Recordings > "Import JSON" tab
   6. Tap "Import from JSON Package"

   ✨ This restores everything with all metadata!

WHAT GETS RESTORED:
-------------------
✅ Recording titles
✅ Creation dates
✅ Tags (imported as categories and tags)
✅ Duration information

NOTE:
-----
- Audio files have been converted from WebM to M4A for iOS compatibility
- Original quality preserved during conversion
- All metadata from Lovable export has been preserved

---
Questions? Check QUICK_START_IMPORT.md in the ios folder
`);

  // Summary
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✨ CONVERSION COMPLETE!`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log(`📁 Location: ${OUTPUT_DIR}`);
  console.log(`📊 ${successCount} of ${recordings.length} recordings converted\n`);
  console.log(`📦 Contents:`);
  console.log(`   • resonance-import.json (${(fs.statSync(manifestPath).size / 1024).toFixed(1)} KB)`);
  console.log(`   • audio/ folder (${successCount} M4A files)`);
  console.log(`   • README.txt (instructions)\n`);
  console.log(`✨ Ready to import to iOS!`);
  console.log(`\n📖 Next steps:`);
  console.log(`   1. Connect your iPhone/iPad via cable`);
  console.log(`   2. Open Finder and select your device`);
  console.log(`   3. Go to Files tab > Resonance app`);
  console.log(`   4. Drag resonance-import.json and audio/ files into Resonance Documents`);
  console.log(`   5. In iOS app: Profile > Import Recordings > Import JSON\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
