// Capturas reais por CDP com emulação de celular (390x844 @3x, touch).
//   node scripts/cdp-shots.mjs <pasta-saida> [url]
// Tira: topo, cada seção por id, e um "tocar o disco" com o disco girando.
// Seções sem id podem ser alcançadas por scrollY (veja STEPS).
import { spawn } from 'node:child_process'
import { writeFile, mkdir } from 'node:fs/promises'

const out = process.argv[2] ?? 'shots'
const url = process.argv[3] ?? 'http://localhost:4317/'
const W = Number(process.env.W ?? 390), H = Number(process.env.H ?? 844)
const mobile = W < 768
const port = 9334
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
await mkdir(out, { recursive: true })
const p = spawn(chrome, ['--headless=new', '--mute-audio', `--remote-debugging-port=${port}`, '--user-data-dir=' + process.env.TEMP + '/cdp-shots', 'about:blank'])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let tabs
for (let i = 0; i < 40 && !tabs; i++) { await sleep(250); tabs = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json()).catch(() => null) }
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0; const pend = new Map(); const errs = []
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? m); pend.delete(m.id) } if (m.method === 'Runtime.exceptionThrown') errs.push(m.params.exceptionDetails?.exception?.description?.slice(0, 300)); if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errs.push(JSON.stringify(m.params.args).slice(0, 300)) }
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const js = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value
const shot = async (name) => { const { data } = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(`${out}/${name}.png`, Buffer.from(data, 'base64')); console.log(`${out}/${name}.png`) }

await send('Runtime.enable'); await send('Page.enable')
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: mobile ? 2 : 1, mobile })
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 })
await send('Page.navigate', { url })
await sleep(2600)
await shot('01-hero')

// tocar o disco: clique no centro do vinil
const c = await js(`(()=>{const r=document.querySelector('[aria-pressed][role=button]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`)
for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: c.x, y: c.y, button: 'left', clickCount: 1 })
await sleep(1600)
await shot('02-playing')
console.log('estado', await js(`document.querySelector('[role=button][aria-pressed]').getAttribute('aria-pressed') + ' rpm ' + document.querySelector('[role=button][aria-pressed]').closest('section').innerText.match(/RPM\\s+([\\d.]+)/i)?.[1]`))

// scratch: arrasto em arco no topo do disco, ida e volta
const drag = async (pts, gapMs = 16) => {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pts[0][0], y: pts[0][1], button: 'left', clickCount: 1 })
  for (const [x, y] of pts.slice(1)) { await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, button: 'left', buttons: 1 }); await sleep(gapMs) }
  const [x, y] = pts.at(-1)
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 })
}
const disc = await js(`(()=>{const r=document.querySelector('[role=button][aria-pressed]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,r:r.width/2}})()`)
const arc = (a0, a1, n) => Array.from({ length: n }, (_, i) => { const a = (a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI / 180; return [disc.x + Math.cos(a) * disc.r * 0.8, disc.y + Math.sin(a) * disc.r * 0.8] })
await drag(arc(-120, -60, 8).concat(arc(-60, -140, 10)), 12)
console.log('após scratch', await js(`document.querySelector('#topo').innerText.match(/PITCH\s+(\S+)/i)?.[1]`))

if (process.env.FLOW === 'rsvp') {
  await js(`document.getElementById('lista').scrollIntoView()`)
  await sleep(600)
  await js(`(()=>{document.querySelector('#lista button[type=submit]').click()})()`)
  await sleep(500)
  await shot('r1-erros')
  const fill = (n, v) => js(`(()=>{const i=document.querySelector('#lista input[name=${n}]');const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,'${v}');i.dispatchEvent(new Event('input',{bubbles:true}))})()`)
  await fill('name', 'Marina Alves'); await fill('email', 'marina@exemplo.com')
  await js(`document.querySelector('#lista button[type=submit]').click()`)
  await sleep(1400)
  await shot('r2-ingresso')
  const st = await js(`(()=>{const r=document.querySelector('#lista [aria-label^="Confirmar presença"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width}})()`)
  await drag(Array.from({ length: 14 }, (_, i) => [st.x + i * st.w * 0.07, st.y + i * 1.5]), 20)
  await sleep(1800)
  await shot('r3-confirmado')
  console.log('pass', await js(`localStorage.getItem('refuge-series-15')`))
}

const ids = (process.env.IDS ?? 'manifesto,lineup,relogio,lista,rodape').split(',')
for (const s of ids) {
  const ok = await js(`(()=>{const e=document.getElementById('${s}');if(!e)return false;window.scrollTo(0,e.getBoundingClientRect().top+scrollY-(${s === 'rodape' ? 0 : 0}));return true})()`)
  if (!ok) { console.log('sem #' + s); continue }
  await sleep(1300)
  await shot(`s-${s}`)
}
console.log('overflow-x', await js(`document.documentElement.scrollWidth + ' / ' + innerWidth`))
if (errs.length) console.log('ERROS:\n' + errs.join('\n'))
p.kill(); process.exit(0)
