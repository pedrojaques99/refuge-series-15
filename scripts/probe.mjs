// Mede se a thread principal responde num Chrome real (headless novo, tempo real).
//   node scripts/probe.mjs [url] [largura] [altura]
// Imprime latência de Runtime.evaluate a cada 500ms e o tempo médio de quadro.
import { spawn } from 'node:child_process'
const url = process.argv[2] ?? 'http://localhost:4317/'
const [w, h] = [process.argv[3] ?? 390, process.argv[4] ?? 844]
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const port = 9333
const p = spawn(chrome, ['--headless=new', '--mute-audio', `--remote-debugging-port=${port}`, `--window-size=${w},${h}`, '--user-data-dir=' + process.env.TEMP + '/probe-chrome', 'about:blank'])
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let tabs
for (let i = 0; i < 40 && !tabs; i++) { await sleep(250); tabs = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json()).catch(() => null) }
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0; const pend = new Map(); const logs = []
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id) } if (m.method === 'Runtime.exceptionThrown' || m.method === 'Runtime.consoleAPICalled') logs.push(JSON.stringify(m.params).slice(0, 300)) }
const send = (method, params = {}, timeout = 4000) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); setTimeout(() => pend.has(i) && (pend.delete(i), res({ timeout: true })), timeout) })
await send('Runtime.enable'); await send('Page.enable')
await send('Page.navigate', { url })
for (let i = 0; i < 10; i++) {
  await sleep(500)
  const t = Date.now()
  const r = await send('Runtime.evaluate', { expression: `new Promise(r=>{let n=0,l=performance.now(),s=0;const f=()=>{const x=performance.now();s+=x-l;l=x;++n<20?requestAnimationFrame(f):r((s/20).toFixed(1))};requestAnimationFrame(f)})`, awaitPromise: true, returnByValue: true })
  console.log(`t=${(i + 1) * 0.5}s eval ${r.timeout ? 'TIMEOUT' : Date.now() - t + 'ms'} frame ${r.result?.result?.value ?? '-'}ms`)
}
console.log(logs.slice(0, 8).join('\n'))
p.kill(); process.exit(0)
