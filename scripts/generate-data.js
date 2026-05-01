#!/usr/bin/env node
/**
 * Reads all Decap CMS markdown files from _data/ and writes _data/content.json.
 * Run automatically by Netlify at build time (see netlify.toml).
 * Run locally: node scripts/generate-data.js
 */
const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, '_data');
const OUT      = path.join(DATA_DIR, 'content.json');

// ── YAML FRONTMATTER PARSER ──────────────────────────────────────────────────
// Handles: strings, booleans, numbers, block scalars (|), plain lists (- item)
function parseDoc(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)/);
    if (!m) return { data: {}, body: '' };
    return { data: parseYAML(m[1]), body: m[2].trim() };
}

function parseYAML(text) {
    const result = {};
    const lines  = text.split(/\r?\n/);
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim() || line.trimStart().startsWith('#')) { i++; continue; }

        const m = line.match(/^([\w][\w_-]*):\s*(.*)/);
        if (!m) { i++; continue; }

        const key  = m[1];
        const rest = m[2].trim();

        // Block scalar: key: | or key: |-
        if (rest === '|' || rest === '|-' || rest === '>' || rest === '>-') {
            const nextLine   = lines[i + 1] || '';
            const baseIndent = (nextLine.match(/^(\s+)/) || ['', '  '])[1].length;
            const parts      = [];
            i++;
            while (i < lines.length) {
                const l      = lines[i];
                const indent = (l.match(/^(\s*)/) || ['', ''])[1].length;
                if (l.trim() === '') { parts.push(''); i++; continue; }
                if (indent < baseIndent) break;
                parts.push(l.slice(baseIndent));
                i++;
            }
            result[key] = parts.join('\n').replace(/\n+$/, '');
            continue;
        }

        // Plain list: key: (empty) followed by - items
        if (rest === '' && i + 1 < lines.length && /^\s*-\s/.test(lines[i + 1])) {
            const items = [];
            i++;
            while (i < lines.length && /^\s*-\s/.test(lines[i])) {
                items.push(lines[i].replace(/^\s*-\s*/, '').trim().replace(/^['"]|['"]$/g, ''));
                i++;
            }
            result[key] = items;
            continue;
        }

        // Scalars
        if      (rest === 'true')  result[key] = true;
        else if (rest === 'false') result[key] = false;
        else if (rest !== '' && /^-?\d+(\.\d+)?$/.test(rest)) result[key] = Number(rest);
        else    result[key] = rest.replace(/^['"]|['"]$/g, '');

        i++;
    }

    return result;
}

// ── READERS ──────────────────────────────────────────────────────────────────
function readCollection(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.md') && !f.startsWith('.'))
        .map(f => {
            const slug = path.basename(f, '.md');
            const text = fs.readFileSync(path.join(dir, f), 'utf8');
            const { data, body } = parseDoc(text);
            return Object.assign({ slug }, data, body ? { body } : {});
        });
}

function readSingleFile(file) {
    if (!fs.existsSync(file)) return {};
    const { data } = parseDoc(fs.readFileSync(file, 'utf8'));
    return data;
}

// ── BUILD ─────────────────────────────────────────────────────────────────────
const content = {
    projects:     readCollection(path.join(DATA_DIR, 'projects')),
    awards:       readCollection(path.join(DATA_DIR, 'awards')),
    team:         readCollection(path.join(DATA_DIR, 'team')),
    testimonials: readCollection(path.join(DATA_DIR, 'testimonials')),
    settings:     readSingleFile(path.join(DATA_DIR, 'settings', 'contact.md')),
};

// Sort awards newest-first, group same year so year cell only shows once
content.awards.sort((a, b) => (b.year || 0) - (a.year || 0));
content.team.sort((a, b)   => (a.order || 99) - (b.order || 99));

fs.writeFileSync(OUT, JSON.stringify(content, null, 2));

console.log('✓ Generated _data/content.json');
console.log(`  projects:     ${content.projects.length}`);
console.log(`  awards:       ${content.awards.length}`);
console.log(`  team:         ${content.team.length}`);
console.log(`  testimonials: ${content.testimonials.length}`);
console.log(`  settings:     ${Object.keys(content.settings).length} fields`);
