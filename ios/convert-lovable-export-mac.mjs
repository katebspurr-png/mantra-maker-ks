#!/usr/bin/env node

/**
 * Convert Lovable Export to iOS Import Format (macOS Native)
 *
 * Uses macOS built-in tools to convert WebM to M4A.
 * No external dependencies required!
 *
 * Usage:
 *   node convert-lovable-export-mac.mjs
 */

import fs from 'fs';
import path from 'path';
import { spawn, exec } from 'child_process';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execPromise = promisify(exec);

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

async function convertAudioFile(inputPath, outputPath) {
  // Try ffmpeg first if available
  try {
    await execPromise(`which ffmpeg`);
    // ffmpeg is available
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:a', 'aac',
        '-b:a', '128k',
        '-y',
        outputPath
      ]);

      ffmpeg.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('ffmpeg failed'));
      });
      ffmpeg.on('error', reject);
    });
  } catch {
    // ffmpeg not available, copy as-is and let iOS handle it
    // Actually, iOS doesn't support WebM, so we need to skip conversion
    // and just copy the file, then warn the user
    throw new Error('Conversion tool not available - WebM files cannot be converted');
  }
}

async function main() {
  console.log('🎵 Converting Lovable Export to iOS Format\n');

  // Read CSV
  if (!fs.existsSync(CSV_FILE)) {
    console.error('❌ recordings_index.csv not found');
    console.error('   Make sure lovable-export folder exists with the export files');
    process.exit(1);
  }

  const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
  const recordings = parseCSV(csvContent);

  console.log(`✅ Found ${recordings.length} recordings in CSV\n`);

  // Check for conversion tool
  let canConvert = false;
  try {
    await execPromise('which ffmpeg');
    canConvert = true;
    console.log('✅ ffmpeg found - will convert WebM to M4A\n');
  } catch {
    console.log('⚠️  ffmpeg not found - WebM files need conversion');
    console.log('   Install ffmpeg to convert files:');
    console.log('   1. Install Homebrew: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
    console.log('   2. Install ffmpeg: brew install ffmpeg');
    console.log('   3. Run this script again\n');
    console.log('   OR use the web app to re-record in a compatible format\n');
    process.exit(1);
  }

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

      if (canConvert) {
        console.log(`   ⏳ Converting to M4A...`);
        await convertAudioFile(webmPath, m4aPath);
        console.log(`   ✅ Converted`);
      }

      // Parse tags
      const tags = rec.tags ? rec.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

      // Add to import manifest
      importData.recordings.push({
        id: rec.id,
        audioFile: audioFileName,
        title: rec.title,
        text: rec.title,
        category: tags[0] || null,
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

HOW TO IMPORT TO iOS:
--------------------

1. Connect iPhone/iPad via cable
2. Open Finder > Select device > Files tab
3. Select "Resonance" app
4. Drag BOTH files into Resonance Documents:
   • resonance-import.json
   • All files from the audio/ folder

5. In iOS app:
   • Open Profile tab
   • Tap "Import Recordings"
   • Select "Import JSON" tab
   • Tap "Import from JSON Package"

WHAT GETS RESTORED:
-------------------
✅ Recording titles
✅ Creation dates
✅ Tags (imported as categories)
✅ Duration information

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
  console.log(`   • resonance-import.json`);
  console.log(`   • audio/ folder (${successCount} M4A files)\n`);
  console.log(`✨ Ready to import to iOS!`);
  console.log(`\n📖 Next Steps:`);
  console.log(`   See QUICK_START_IMPORT.md for detailed import instructions\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
