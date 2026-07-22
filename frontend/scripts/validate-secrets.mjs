import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')

const files = [
  'src/services/api.js',
  'src/context/AuthContext.jsx',
  'vite.config.js',
  '../render.yaml',
]

const patterns = [
  /mongodb\+srv:\/\/[^<\s][^\s"]+/i,
  /ghp_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9]{20,}/,
  /AKIA[0-9A-Z]{16}/,
]

for (const file of files) {
  const fullPath = path.resolve(frontendRoot, file)
  const text = await readFile(fullPath, 'utf8').catch(() => '')
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      throw new Error(`Possible secret pattern found in ${file}: ${pattern}`)
    }
  }
}

console.log('No obvious secrets found in checked files')
