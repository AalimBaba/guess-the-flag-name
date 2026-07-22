import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { cpSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import worldCountries from 'world-countries'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const frontendRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(frontendRoot, '..')
const publicRoot = path.join(frontendRoot, 'public', 'flags')
const dataRoot = path.join(frontendRoot, 'src', 'data')
const countryDir = path.join(publicRoot, 'countries')
const stateDir = path.join(publicRoot, 'states')
const cityDir = path.join(publicRoot, 'cities')
const historicalDir = path.join(publicRoot, 'historical')

const historicalEntries = [
  {
    id: 'ottoman-empire',
    name: 'Ottoman Empire',
    type: 'banner',
    asset: '/flags/historical/ottoman-empire.svg',
    assetSource: 'reconstruction',
    source: 'https://commons.wikimedia.org/wiki/File:Flag_of_the_Ottoman_Empire.svg',
    note: 'Later imperial banner with crescent and star; rendered as a simplified reconstruction.',
    aliases: ['Sublime Porte', 'Ottoman banner'],
    difficulty: 'hard',
  },
  {
    id: 'venice-republic',
    name: 'Republic of Venice',
    type: 'standard',
    asset: '/flags/historical/venice-republic.svg',
    assetSource: 'reconstruction',
    source: 'https://commons.wikimedia.org/wiki/Category:Flags_of_the_Republic_of_Venice',
    note: 'Stylized reconstructions based on the Venetian lion standard.',
    aliases: ['Venetian Republic', 'Venice standard'],
    difficulty: 'hard',
  },
  {
    id: 'sardinia-kingdom',
    name: 'Kingdom of Sardinia',
    type: 'flag',
    asset: '/flags/historical/sardinia-kingdom.svg',
    assetSource: 'reconstruction',
    source: 'https://commons.wikimedia.org/wiki/Category:Flags_of_the_Kingdom_of_Sardinia',
    note: 'Historic dynastic banner rendered as a simplified reconstruction.',
    aliases: ['Sardinian Kingdom', 'Sardinia royal standard'],
    difficulty: 'hard',
  },
  {
    id: 'roman-vexillum',
    name: 'Roman vexillum',
    type: 'vexillum reconstruction',
    asset: '/flags/historical/roman-vexillum.svg',
    assetSource: 'reconstruction',
    source: 'https://en.wikipedia.org/wiki/Vexillum',
    note: 'Reconstruction of a Roman vexillum, not an attested national flag.',
    aliases: ['Vexillum Romanum', 'Roman standard'],
    difficulty: 'hard',
  },
]

const cityEntries = [
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Netherlands',
    asset: '/flags/cities/amsterdam.svg',
    assetSource: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Flag_of_Amsterdam.svg',
    aliases: ['City of Amsterdam'],
    difficulty: 'medium',
  },
  {
    id: 'berlin',
    name: 'Berlin',
    country: 'Germany',
    asset: '/flags/cities/berlin.svg',
    assetSource: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Flag_of_Berlin.svg',
    aliases: ['Berlin city flag'],
    difficulty: 'medium',
  },
  {
    id: 'montreal',
    name: 'Montreal',
    country: 'Canada',
    asset: '/flags/cities/montreal.svg',
    assetSource: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Flag_of_Montreal.svg',
    aliases: ['Montreal'],
    difficulty: 'medium',
  },
  {
    id: 'prague',
    name: 'Prague',
    country: 'Czechia',
    asset: '/flags/cities/prague.svg',
    assetSource: 'Wikimedia Commons',
    source: 'https://commons.wikimedia.org/wiki/File:Flag_of_Prague.svg',
    aliases: ['Praha'],
    difficulty: 'hard',
  },
]

const easyCountryCodes = new Set([
  'US', 'GB', 'CA', 'FR', 'DE', 'IT', 'ES', 'JP', 'CN', 'IN', 'BR', 'AU', 'MX', 'RU', 'ZA',
  'KR', 'AR', 'SE', 'NL', 'TR', 'NO', 'FI', 'DK', 'PT', 'CH', 'IE', 'AT', 'GR', 'PL', 'CL',
  'CO', 'PE', 'NZ', 'SG', 'TH', 'MY', 'ID', 'PH', 'VN', 'EG', 'KE', 'NG', 'MA', 'TN', 'AE',
  'SA', 'IL', 'UA', 'RO', 'HU', 'CZ',
])

function difficultyFor(code, fallback = ['easy', 'medium', 'hard']) {
  if (easyCountryCodes.has(code)) return 'easy'
  const hash = [...code].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return fallback[hash % fallback.length]
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function unique(list) {
  return [...new Set(list.filter(Boolean))]
}

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

async function writeSvg(filePath, svg) {
  await writeFile(filePath, svg.replace(/\r?\n\s+/g, '\n').trim() + '\n', 'utf8')
}

function simpleHistoricalSvg({ fill, accent, emblem, title }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" role="img" aria-label="${title}">
  <rect width="900" height="600" fill="${fill}"/>
  <rect y="40" width="900" height="520" fill="none" stroke="${accent}" stroke-width="24"/>
  ${emblem}
</svg>`
}

function makeCircleEmblem(cx, cy, r, fill, stroke = 'none') {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${stroke !== 'none' ? ` stroke="${stroke}" stroke-width="10"` : ''}/>`
}

function makeCrossBar(x, y, w, h, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}"/>`
}

function historicalSvg(entry) {
  switch (entry.id) {
    case 'ottoman-empire':
      return simpleHistoricalSvg({
        fill: '#c62828',
        accent: '#f7f1d1',
        title: entry.name,
        emblem: `
          <circle cx="470" cy="300" r="110" fill="#f7f1d1"/>
          <circle cx="505" cy="300" r="92" fill="#c62828"/>
          <polygon points="590,248 610,306 670,306 622,342 640,400 590,366 540,400 558,342 510,306 570,306" fill="#f7f1d1"/>
        `,
      })
    case 'venice-republic':
      return simpleHistoricalSvg({
        fill: '#8f1d21',
        accent: '#f0cf76',
        title: entry.name,
        emblem: `
          <circle cx="455" cy="305" r="120" fill="#f0cf76"/>
          <path d="M395 280c55-95 190-70 185 40-3 70-75 120-145 100-38-11-62-42-61-76 0-22 7-43 21-64z" fill="#8f1d21"/>
          <circle cx="454" cy="262" r="18" fill="#f0cf76"/>
        `,
      })
    case 'sardinia-kingdom':
      return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" role="img" aria-label="${entry.name}">
  <rect width="900" height="600" fill="#ffffff"/>
  <rect width="900" height="600" fill="none" stroke="#b71c1c" stroke-width="28"/>
  <path d="M140 110h120v120H140zM640 110h120v120H640zM140 360h120v120H140zM640 360h120v120H640z" fill="#b71c1c"/>
  <path d="M260 140c65 0 130 65 130 130s-65 130-130 130-130-65-130-130 65-130 130-130z" fill="#ffffff" stroke="#111" stroke-width="14"/>
  <path d="M213 190h94v20h-94zm0 36h94v20h-94zm0 36h94v20h-94z" fill="#111"/>
  <circle cx="260" cy="250" r="18" fill="#b71c1c"/>
  <rect x="680" y="140" width="30" height="230" fill="#111"/>
  <path d="M665 150c35-24 92-23 125 14-13 36-44 62-92 64-34 1-58-20-69-44 3-12 15-24 36-34z" fill="#d4af37" stroke="#111" stroke-width="6"/>
  <path d="M702 154c0-18 11-33 28-33 16 0 28 15 28 33v50h-56z" fill="#111"/>
</svg>`
    case 'roman-vexillum':
      return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" role="img" aria-label="${entry.name}">
  <rect width="900" height="600" fill="#4a235a"/>
  <rect x="120" y="120" width="660" height="360" rx="18" fill="#b38a2e"/>
  <rect x="150" y="150" width="600" height="300" rx="14" fill="#4a235a"/>
  <circle cx="450" cy="300" r="108" fill="#b38a2e"/>
  <circle cx="450" cy="300" r="78" fill="#4a235a"/>
  <path d="M435 235h30l28 37-14 38 18 33-40 30-32-19-31 19-40-30 18-33-14-38 28-37z" fill="#b38a2e"/>
  <rect x="770" y="100" width="26" height="400" fill="#6f4f25"/>
  <rect x="756" y="100" width="54" height="18" fill="#c9a45d"/>
</svg>`
    default:
      return simpleHistoricalSvg({
        fill: '#24405a',
        accent: '#d1b26d',
        title: entry.name,
        emblem: makeCircleEmblem(450, 300, 95, '#d1b26d'),
      })
  }
}

const citySvgUrls = {
  amsterdam: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Amsterdam.svg',
  berlin: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Berlin.svg',
  montreal: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Montreal.svg',
  prague: 'https://commons.wikimedia.org/wiki/Special:FilePath/Flag_of_Prague.svg',
}

async function downloadSvg(url, destination) {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`)
  }
  const text = await response.text()
  await writeSvg(destination, text)
}

function normalizeCountryAliases(country) {
  const aliases = [
    country.name.common,
    country.name.official,
    country.cca2,
    country.cca3,
    ...(country.altSpellings || []),
    ...(country.translations?.eng ? [country.translations.eng.common, country.translations.eng.official] : []),
  ]
  return unique(aliases).filter((value) => value.toLowerCase() !== country.name.common.toLowerCase() || value === country.name.common)
}

function countryEntry(country, index) {
  const name = country.name.common
  const code = country.cca2.toLowerCase()
  return {
    id: code,
    code,
    name,
    officialName: country.name.official,
    aliases: normalizeCountryAliases(country),
    asset: `/flags/countries/${country.cca2}.svg`,
    assetSource: 'country-flag-icons',
    source: `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`,
    difficulty: difficultyFor(country.cca2, ['easy', 'medium', 'hard']),
    region: country.region,
    subregion: country.subregion || '',
    index,
  }
}

function stateEntry(state, index) {
  const abbr = state.abbreviation
  return {
    id: abbr.toLowerCase(),
    code: abbr.toLowerCase(),
    name: state.name,
    aliases: unique([state.name, abbr, `${state.name} State`]),
    asset: `/flags/states/${abbr}.svg`,
    assetSource: 'us-state-flags',
    source: `https://www.us-state-flags.com/${abbr.toLowerCase()}.html`,
    difficulty: difficultyFor(abbr, ['easy', 'medium', 'hard']),
    country: 'United States',
    index,
  }
}

function cityEntry(city) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    aliases: unique([city.name, `${city.name} city`, city.country]),
    asset: city.asset,
    assetSource: city.assetSource,
    source: city.source,
    difficulty: city.difficulty,
    cityFlag: true,
  }
}

function historicalEntry(entry) {
  return {
    ...entry,
    aliases: unique([entry.name, ...(entry.aliases || [])]),
    historicalFlag: true,
  }
}

async function main() {
  await Promise.all([ensureDir(countryDir), ensureDir(stateDir), ensureDir(cityDir), ensureDir(historicalDir), ensureDir(dataRoot)])

  const countries = worldCountries
    .filter((country) => country.unMember || country.cca2 === 'PS')
    .map((country, index) => countryEntry(country, index))
    .sort((a, b) => a.name.localeCompare(b.name))

  const statesRaw = JSON.parse(await readFile(path.join(frontendRoot, 'node_modules', 'us-state-flags', 'src', 'data', 'states.json'), 'utf8'))
  const states = statesRaw
    .filter((state) => state.territory === false)
    .map((state, index) => stateEntry(state, index))
    .sort((a, b) => a.name.localeCompare(b.name))

  for (const country of countries) {
    const source = path.join(frontendRoot, 'node_modules', 'country-flag-icons', '3x2', `${country.code.toUpperCase()}.svg`)
    if (!existsSync(source)) {
      throw new Error(`Missing country flag asset in package for ${country.code.toUpperCase()}`)
    }
    cpSync(source, path.join(countryDir, `${country.code.toUpperCase()}.svg`))
  }

  for (const state of states) {
    const componentPath = path.join(frontendRoot, 'node_modules', 'us-state-flags', 'src', 'components', 'flags', `Flag${state.code.toUpperCase()}.js`)
    const text = await readFile(componentPath, 'utf8')
    const match = text.match(/__html:\s*`([\s\S]*?)`\s*}/)
    if (!match) {
      throw new Error(`Unable to extract SVG from ${componentPath}`)
    }
    const svg = match[1].replace(/\\`/g, '`')
    await writeSvg(path.join(stateDir, `${state.code.toUpperCase()}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 167">${svg}</svg>`)
  }

  for (const city of cityEntries) {
    await downloadSvg(citySvgUrls[city.id], path.join(cityDir, `${city.id}.svg`))
  }

  for (const historical of historicalEntries) {
    await writeSvg(path.join(historicalDir, `${historical.id}.svg`), historicalSvg(historical))
  }

  const collections = {
    nations: {
      id: 'nations',
      label: 'Nations of the World',
      entryCount: countries.length,
      description: 'All UN member states plus Palestine and Vatican City.',
      assetRoot: '/flags/countries',
      collections: countries,
    },
    states: {
      id: 'states',
      label: 'States & Territories',
      entryCount: states.length,
      description: 'All 50 US states with state abbreviations accepted as typed aliases.',
      assetRoot: '/flags/states',
      collections: states,
    },
    historical: {
      id: 'historical',
      label: 'Historical Realms',
      entryCount: historicalEntries.length,
      description: 'A small verified starter set of historical banners, standards, and reconstructions.',
      assetRoot: '/flags/historical',
      disclaimer: 'Historical flags are reconstructions or later standards unless explicitly noted otherwise.',
      collections: historicalEntries.map(historicalEntry),
    },
    cities: {
      id: 'cities',
      label: 'City Standards',
      entryCount: cityEntries.length,
      description: 'Verified municipal flags from cities across multiple countries.',
      assetRoot: '/flags/cities',
      collections: cityEntries.map(cityEntry),
    },
  }

  const out = `export const collections = ${JSON.stringify(collections, null, 2)}\n\nexport function getCollectionById(id) {\n  return collections[id] || null\n}\n\nexport const collectionList = Object.values(collections)\n`
  await writeFile(path.join(dataRoot, 'collections.js'), out, 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
