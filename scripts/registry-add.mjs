// Instala peças do registry @visant sem prompt interativo.
//   node scripts/registry-add.mjs ticket-stub countdown ...
// Lê https://ui.visantlabs.com/r/<nome>.json, grava files[] em src/, junta o css
// das peças em src/registry.css e lista as deps npm que faltam.
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://ui.visantlabs.com/r'
const NL = String.fromCharCode(10)
const seen = new Set()
const npmDeps = new Set()
const cssChunks = []

const toCss = (obj, ind = '') =>
  Object.entries(obj)
    .map(([k, v]) =>
      typeof v === 'object' ? `${ind}${k} {${NL}${toCss(v, ind + '  ')}${NL}${ind}}` : `${ind}${k}: ${v};`,
    )
    .join(NL)

const target = (f) => {
  if (f.target) return f.target.replace(/^~\//, '')
  const p = f.path.replace(/^registry\/[^/]+\//, '')
  if (f.type === 'registry:hook') return path.join('src/hooks', path.basename(p))
  if (f.type === 'registry:lib') return path.join('src/lib', path.basename(p))
  return path.join('src/components/ui', path.basename(p))
}

async function add(name) {
  name = name.replace(/^@visant\//, '').replace(/^https?:\/\/\S+\/r\//, '').replace(/\.json$/, '')
  if (seen.has(name)) return
  seen.add(name)
  const res = await fetch(`${BASE}/${name}.json`)
  if (!res.ok) {
    console.log(`~ ${name}: fora do @visant (HTTP ${res.status}), provável peça base do shadcn, pulei`)
    return
  }
  const item = await res.json()
  for (const d of item.dependencies ?? []) npmDeps.add(d)
  for (const f of item.files ?? []) {
    const out = target(f)
    await mkdir(path.dirname(out), { recursive: true })
    await writeFile(out, f.content)
    console.log(`+ ${out}`)
  }
  if (item.css) cssChunks.push(`/* @visant/${name} */${NL}${toCss(item.css)}`)
  if (item.cssVars) console.log(`! ${name} traz cssVars, mapeie nos tokens: ${JSON.stringify(item.cssVars)}`)
  for (const r of item.registryDependencies ?? []) await add(r)
}

for (const n of process.argv.slice(2)) await add(n)

if (cssChunks.length) {
  const out = 'src/registry.css'
  const prev = await readFile(out, 'utf8').catch(() => '')
  const fresh = cssChunks.filter((c) => !prev.includes(c.split(NL)[0]))
  await writeFile(out, prev + fresh.map((c) => c + NL + NL).join(''))
  console.log(`+ ${out} (${fresh.length} bloco novo; importe em index.css)`)
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const have = { ...pkg.dependencies, ...pkg.devDependencies }
const missing = [...npmDeps].filter((d) => !have[d.replace(/(.)@.*$/, '$1')])
console.log(missing.length ? `${NL}faltam deps: npm i ${missing.join(' ')}` : `${NL}deps npm ok`)
