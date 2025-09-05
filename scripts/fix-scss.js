// Run: node scripts/fix-scss-v5.js --convert-sass

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(process.cwd(), "src");
const exts = [".vue", ".scss"];
const CONVERT_SASS = process.argv.includes("--convert-sass");
const IGNORE_TAG = "IGNORE-SASS-FIX";

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (exts.includes(path.extname(entry.name))) out.push(p);
  }
  return out;
}

function replaceDeepLine(s) {
  return s.replace(/\/deep\/\s*/g, "::v-deep ").replace(/>>>\s*/g, "::v-deep ");
}

function fixTildeLine(s) {
  return s
    .replace(/@import\s+["']~([^"']+)["']/g, '@import "$1"')
    .replace(/url\(\s*["']~([^"']+)["']\s*\)/g, 'url("$1")');
}

function fixElementUiImportsLine(s) {
  s = s.replace(
    /@import\s+["']\.\/element-ui\/lib\/theme-chalk\/([^"']+)["']/g,
    '@import "element-ui/lib/theme-chalk/$1"'
  );
  s = s.replace(
    /url\(\s*["']\.\/element-ui\/lib\/theme-chalk\/([^"']+)["']\s*\)/g,
    'url("element-ui/lib/theme-chalk/$1")'
  );
  return s;
}

function splitLineAndComment(line) {
  const idx = line.indexOf("//");
  if (idx >= 0) return [line.slice(0, idx).trimEnd(), line.slice(idx)];
  return [line, ""];
}

function preProcessLines(text) {
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.includes(IGNORE_TAG)) continue;
    let s = raw;
    s = fixElementUiImportsLine(s);
    s = fixTildeLine(s);
    s = replaceDeepLine(s);
    lines[i] = s;
  }
  return lines.join("\n");
}

function addSemicolonsSmart(text) {
  const lines = text.split(/\r?\n/);

  const propRe =
    /^\s*(--[\w-]+|[A-Za-z_-][\w-]*)\s*:\s*[^;{}]+?(?:\s*!important|\s*!default|\s*!global)?\s*$/;
  const varRe =
    /^\s*\$[\w-]+\s*:\s*[^;{}]+?(?:\s*!default|\s*!global)?\s*$/;

  const atSimple = [
    /^\s*@import\s+[^;{]+$/,
    /^\s*@use\s+[^;{]+$/,
    /^\s*@forward\s+[^;{]+$/,
    /^\s*@extend\s+[^;{]+$/,
    /^\s*@include\s+[^{;]+$/,
  ];

  let depth = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    const [codeForDepth] = splitLineAndComment(raw);
    const openCount = (codeForDepth.match(/{/g) || []).length;
    const closeCount = (codeForDepth.match(/}/g) || []).length;
    const depthBefore = depth;

    if (raw.includes(IGNORE_TAG)) {
      depth += openCount - closeCount;
      if (depth < 0) depth = 0;
      continue;
    }

    const [code, comment] = splitLineAndComment(raw);

    if (code.trim()) {
      let needSemi = false;

      if (depthBefore > 0) {
        needSemi =
          propRe.test(code) ||
          varRe.test(code) ||
          atSimple.some((re) => re.test(code));
      } else {
        needSemi = varRe.test(code) || atSimple.some((re) => re.test(code));
      }

      if (needSemi && !code.trimEnd().endsWith(";")) {
        lines[i] = code + ";" + (comment ? " " + comment : "");
      }
    }

    depth += openCount - closeCount;
    if (depth < 0) depth = 0;
  }

  return lines.join("\n");
}

function looksLikeSass(body) {
  const braceCount = (body.match(/[{}]/g) || []).length;
  if (braceCount >= 2) return false;
  const lines = body.split(/\r?\n/);
  let suspect = 0;
  for (const L of lines) {
    const t = L.trim();
    if (!t || t.startsWith("//")) continue;
    if (/^[.#:\[][\w-].*$/.test(t) && !t.includes("{")) suspect++;
    if (/^[\w-]+\s*:\s*[^;]+$/.test(t)) suspect++;
  }
  return suspect >= 5;
}

function processBlock(body) {
  const pre = preProcessLines(body);
  return addSemicolonsSmart(pre);
}

function transformVue(file) {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;
  let sassified = 0;

  const re = /(<style\b[^>]*lang=["']scss["'][^>]*>)([\s\S]*?)(<\/style>)/gi;
  src = src.replace(re, (m, open, body, close) => {
    let newOpen = open;
    let newBody = body;

    if (looksLikeSass(body)) {
      if (CONVERT_SASS) {
        newOpen = open.replace(/lang=["']scss["']/i, 'lang="sass"');
        sassified++;
        changed = true;
        return newOpen + body + close;
      } else {
        console.warn(`[SASS?] ${file} → style-block remains indented .sass`);
      }
    } else {
      const fixed = processBlock(body);
      if (fixed !== body) {
        newBody = fixed;
        changed = true;
      }
    }
    return newOpen + newBody + close;
  });

  if (changed) fs.writeFileSync(file, src, "utf8");
  return { changed, sassified };
}

function transformScss(file) {
  const src = fs.readFileSync(file, "utf8");
  const out = processBlock(src);
  if (out !== src) {
    fs.writeFileSync(file, out, "utf8");
    return true;
  }
  return false;
}

// Main
const files = walk(ROOT);
let touched = 0;
let sassifiedTotal = 0;

for (const f of files) {
  try {
    if (f.endsWith(".vue")) {
      const { changed, sassified } = transformVue(f);
      if (changed) touched++;
      sassifiedTotal += sassified;
    } else if (f.endsWith(".scss")) {
      if (transformScss(f)) touched++;
    }
  } catch (e) {
    console.error("!! Could not update file:", f, e.message);
  }
}

console.log(`Changed files: ${touched}`);
if (sassifiedTotal) console.log(`Converted SCSS→SASS blocks: ${sassifiedTotal}`);
console.log('Done. Tip: run `npx prettier -w "src/**/*.{vue,scss}"`');
