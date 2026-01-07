#!/usr/bin/env node
/**
 * Skill Packager - Creates a distributable .skill file from a skill folder
 *
 * Usage:
 *     node package_skill.mjs <path/to/skill-folder> [output-directory]
 *
 * Example:
 *     node package_skill.mjs .github/skills/my-skill
 *     node package_skill.mjs .github/skills/my-skill ./dist
 */

import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import {basename, dirname, join, relative, resolve} from 'node:path';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {createGzip} from 'node:zlib';
import {validateSkill} from './quick_validate.mjs';

// Simple tar implementation for packaging
function createTarEntry(filename, content) {
  const size = Buffer.byteLength(content);
  const header = Buffer.alloc(512, 0);

  // File name (100 bytes)
  header.write(filename, 0, 100);

  // File mode (8 bytes, octal)
  header.write('0000644 ', 100, 8);

  // Owner UID (8 bytes, octal)
  header.write('0000000 ', 108, 8);

  // Owner GID (8 bytes, octal)
  header.write('0000000 ', 116, 8);

  // File size (12 bytes, octal)
  header.write(`${size.toString(8).padStart(11, '0')}' '`, 124, 12);

  // Modification time (12 bytes, octal)
  const mtime = Math.floor(Date.now() / 1000);
  header.write(`${mtime.toString(8).padStart(11, '0')}' '`, 136, 12);

  // Checksum placeholder (8 bytes, spaces)
  header.write('        ', 148, 8);

  // Type flag (1 byte, '0' = regular file)
  header.write('0', 156, 1);

  // Calculate and write checksum
  let checksum = 0;
  for (let i = 0; i < 512; i++) {
    checksum += header[i];
  }
  header.write(`${checksum.toString(8).padStart(6, '0')}\0 `, 148, 8);

  // Pad content to 512-byte boundary
  const padding = 512 - (size % 512 || 512);
  const paddingBuffer =
    padding < 512 ? Buffer.alloc(padding, 0) : Buffer.alloc(0);

  return Buffer.concat([header, Buffer.from(content), paddingBuffer]);
}

function getAllFiles(dir, base = dir) {
  const files = [];
  const entries = readdirSync(dir, {withFileTypes: true});

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, base));
    } else if (entry.isFile() && entry.name !== '.gitkeep') {
      files.push({
        path: fullPath,
        relativePath: relative(dirname(base), fullPath),
      });
    }
  }

  return files;
}

async function packageSkill(skillPath, outputDir = null) {
  skillPath = resolve(skillPath);

  // Validate skill folder exists
  if (!existsSync(skillPath)) {
    console.log(`❌ Error: Skill folder not found: ${skillPath}`);
    return null;
  }

  if (!statSync(skillPath).isDirectory()) {
    console.log(`❌ Error: Path is not a directory: ${skillPath}`);
    return null;
  }

  // Validate SKILL.md exists
  const skillMd = join(skillPath, 'SKILL.md');
  if (!existsSync(skillMd)) {
    console.log(`❌ Error: SKILL.md not found in ${skillPath}`);
    return null;
  }

  // Run validation before packaging
  console.log('🔍 Validating skill...');
  const {valid, message} = validateSkill(skillPath);
  if (!valid) {
    console.log(`❌ Validation failed: ${message}`);
    console.log('   Please fix the validation errors before packaging.');
    return null;
  }
  console.log(`✅ ${message}\n`);

  // Determine output location
  const skillName = basename(skillPath);
  let outputPath;
  if (outputDir) {
    outputPath = resolve(outputDir);
    if (!existsSync(outputPath)) {
      mkdirSync(outputPath, {recursive: true});
    }
  } else {
    outputPath = process.cwd();
  }

  const skillFilename = join(outputPath, `${skillName}.skill`);

  // Create the .skill file (tar.gz format)
  try {
    const files = getAllFiles(skillPath);
    const tarBuffers = [];

    for (const file of files) {
      const content = readFileSync(file.path);
      tarBuffers.push(createTarEntry(file.relativePath, content));
      console.log(`  Added: ${file.relativePath}`);
    }

    // Add two empty 512-byte blocks to mark end of archive
    tarBuffers.push(Buffer.alloc(1024, 0));

    const tarBuffer = Buffer.concat(tarBuffers);

    // Compress with gzip
    const writeStream = createWriteStream(skillFilename);
    const gzip = createGzip();

    await pipeline(Readable.from(tarBuffer), gzip, writeStream);

    console.log(
      `\n✅ Successfully packaged ${files.length} files to: ${skillFilename}`
    );
    return skillFilename;
  } catch (error) {
    console.log(`❌ Error creating .skill file: ${error.message}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(
      'Usage: node package_skill.mjs <path/to/skill-folder> [output-directory]'
    );
    console.log('');
    console.log('Example:');
    console.log('  node package_skill.mjs .github/skills/my-skill');
    console.log('  node package_skill.mjs .github/skills/my-skill ./dist');
    process.exit(1);
  }

  const skillPath = args[0];
  const outputDir = args.length > 1 ? args[1] : null;

  console.log(`📦 Packaging skill: ${skillPath}`);
  if (outputDir) {
    console.log(`   Output directory: ${outputDir}`);
  }
  console.log('');

  const result = await packageSkill(skillPath, outputDir);

  if (result) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
