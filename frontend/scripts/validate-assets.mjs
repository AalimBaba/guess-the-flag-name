import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')
const collectionsUrl = pathToFileURL(path.join(frontendRoot, 'src', 'data', 'collections.js')).href
const { collections } = await import(collectionsUrl)

async function assertExists(relativePath) {
  const fullPath = path.join(frontendRoot, 'public', relativePath.replace(/^\//, ''))
  await access(fullPath)
}

for (const collection of Object.values(collections)) {
  for (const entry of collection.collections) {
    await assertExists(entry.asset)
  }
}

console.log('Verified all local flag assets exist')
