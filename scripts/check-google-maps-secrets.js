const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const root = path.resolve(__dirname, '..')
const privateFiles = new Set(['public/maps-config.json', 'dist/maps-config.json', 'staging/maps-config.json', 'maps-config.local.json'])
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString().split('\0').filter(Boolean)
const failures = new Set(tracked.filter(file => privateFiles.has(file)))
const files = new Set(tracked)

function walk(relative) {
  const directory = path.join(root, relative)
  if (!fs.existsSync(directory)) return
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.posix.join(relative, entry.name)
    if (entry.isDirectory()) walk(file)
    else if (entry.isFile() && !privateFiles.has(file)) files.add(file)
  }
}

for (const directory of ['src', 'public', 'dist', 'staging']) walk(directory)
for (const file of files) {
  if (privateFiles.has(file)) continue
  const absolute = path.join(root, file)
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue
  if (/AIza[0-9A-Za-z_-]{35}/.test(fs.readFileSync(absolute).toString())) failures.add(file)
}

if (failures.size) {
  console.error('Google API keys or deployment-owned config detected in publishable files:')
  for (const file of failures) console.error(file)
  process.exitCode = 1
} else {
  console.log('No Google API key literals or tracked Maps runtime configuration found.')
}
