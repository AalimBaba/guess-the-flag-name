import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')
const collectionsUrl = pathToFileURL(path.join(frontendRoot, 'src', 'data', 'collections.js')).href

const { collections } = await import(collectionsUrl)

const checks = []

function assert(condition, message) {
  if (!condition) throw new Error(message)
  checks.push(message)
}

function unique(values) {
  return new Set(values.map((value) => value.toLowerCase())).size === values.length
}

function validateCollection(collection, expectedCount) {
  assert(Array.isArray(collection.collections), `${collection.id} collection entries are present`)
  assert(collection.collections.length === expectedCount, `${collection.id} has ${expectedCount} entries`)
  assert(unique(collection.collections.map((entry) => entry.id)), `${collection.id} ids are unique`)
  assert(unique(collection.collections.map((entry) => entry.name)), `${collection.id} names are unique`)
  for (const entry of collection.collections) {
    assert(entry.asset && typeof entry.asset === 'string', `${entry.name} has an asset path`)
    assert(Array.isArray(entry.aliases) && entry.aliases.length > 0, `${entry.name} has aliases`)
    assert(entry.source && typeof entry.source === 'string', `${entry.name} has a source`)
    assert(entry.difficulty && typeof entry.difficulty === 'string', `${entry.name} has difficulty`)
  }
}

validateCollection(collections.nations, 195)
validateCollection(collections.states, 50)

assert(collections.historical.collections.length > 0, 'historical collection has entries')
for (const entry of collections.historical.collections) {
  assert(entry.type && typeof entry.type === 'string', `${entry.name} has a classification type`)
  assert(entry.note && typeof entry.note === 'string', `${entry.name} has a historical note`)
  assert(entry.source && typeof entry.source === 'string', `${entry.name} has a source`)
  assert(entry.asset && typeof entry.asset === 'string', `${entry.name} has an asset path`)
}

assert(collections.cities.collections.length > 0, 'city collection has entries')
for (const entry of collections.cities.collections) {
  assert(entry.country && typeof entry.country === 'string', `${entry.name} has a country`)
  assert(entry.source && typeof entry.source === 'string', `${entry.name} has a source`)
  assert(entry.asset && typeof entry.asset === 'string', `${entry.name} has an asset path`)
}

console.log(`Validated collections: nations=${collections.nations.collections.length}, states=${collections.states.collections.length}, historical=${collections.historical.collections.length}, cities=${collections.cities.collections.length}`)
