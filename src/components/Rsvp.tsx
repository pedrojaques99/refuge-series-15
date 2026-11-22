import { useId, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { TicketStub } from '@/components/ui/ticket-stub'
import { MagneticCta } from '@/components/ui/magnetic-cta'
import { EVENT } from '@/content'
import { EASE_DRAWER, EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { LineUp } from './Reveal'

import { loadPass, savePass, type Pass } from '@/pass'

/* número estável por e-mail: a mesma pessoa sempre recebe o mesmo ingresso */
function ticketNo(email: string) {
  let h = 2166136261
  for (const c of email.trim().toLowerCase()) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return String((Math.abs(h) % 312) + 1).padStart(4, '0')
}

function icsFile(p: Pass) {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Refuge//Series 15//PT',
    'BEGIN:VEVENT',
    `UID:refuge15-${p.no}@refuge`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(EVENT.startsAt)}`,
    `DTEND:${stamp(EVENT.endsAt)}`,
    'SUMMARY:Refuge Series 15',
    `DESCRIPTION:Ingresso ${p.no} em nome de ${p.name}. O endereço chega por e-mail 48h antes.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: 'refuge-series-15.ics' })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Field({ label, error, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="label-mono text-fundacao/60">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-e` : undefined}
        className={cn(
          'h-12 border-b bg-transparent text-xl font-medium tracking-[-0.02em] text-fundacao outline-none transition-colors placeholder:text-fundacao/25',
          'focus:border-fundacao focus-visible:shadow-none',
          error ? 'border-[#8a3b2b]' : 'border-fundacao/25',
        )}
        {...p}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-e`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-[#8a3b2b]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Rsvp() {
  const reduce = useReducedMotion()
  const [pass, setPass] = useState<Pass | null>(loadPass)
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [shared, setShared] = useState(false)

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const email = String(f.get('email') ?? '').trim()
    const next: typeof errors = {}
    if (name.length < 2) next.name = 'Como a gente te chama na porta?'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) next.email = 'Esse e-mail não parece completo.'
    setErrors(next)
    if (Object.keys(next).length) return
    const p = { name, email, no: ticketNo(email), confirmed: false }
    setPass(p)
    savePass(p)
  }

  const setConfirmed = (confirmed: boolean) => {
    if (!pass) return
    const p = { ...pass, confirmed }
    setPass(p)
    savePass(p)
  }

  const share = async () => {
    const data = { title: 'Refuge Series 15', text: `Refuge Series 15, ${EVENT.dateLabel}. Bora?`, url: location.origin }
    try {
      if (navigator.share) await navigator.share(data)
      else {
        await navigator.clipboard.writeText(`${data.text} ${data.url}`)
        setShared(true)
        setTimeout(() => setShared(false), 2200)
      }
    } catch {
      /* compartilhamento cancelado */
    }
  }

  const first = pass?.name.split(' ')[0]

  return (
    <section id="lista" className="relative overflow-hidden bg-superficie px-4 py-24 text-fundacao sm:px-8">
      <div className="relative z-10 mx-auto flex max-w-[560px] flex-col gap-10 pb-16">
        <header className="flex flex-col gap-5">
          <p className="label-mono text-fundacao/60">Lista · entrada gratuita</p>
          <h2 className="font-display text-[clamp(2.2rem,11vw,3.8rem)] leading-[0.95] tracking-[-0.045em]">
            <LineUp key={pass?.confirmed ? 'ok' : 'in'} lines={pass?.confirmed ? ['Lugar', 'guardado.'] : ['Entra na', 'lista.']} />
          </h2>
          <p className="max-w-[38ch] text-base leading-relaxed text-fundacao/70">
            {pass?.confirmed
              ? `Te vemos na pista, ${first}. O endereço chega no seu e-mail 48h antes.`
              : 'A casa é pequena e a entrada é por nome. Deixe nome e e-mail, rasgue o canhoto e o endereço chega 48h antes.'}
          </p>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          {!pass ? (
            <motion.form
              key="form"
              noValidate
              onSubmit={submit}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
              className="flex flex-col gap-8"
            >
              <Field label="Nome" name="name" autoComplete="name" placeholder="Seu nome" error={errors.name} />
              <Field
                label="E-mail"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="voce@email.com"
                error={errors.email}
              />
              <div className="pt-2">
                <MagneticCta type="submit" className="h-14 px-8">
                  Gerar meu ingresso
                </MagneticCta>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="ticket"
              initial={reduce ? false : { opacity: 0, y: 60, rotate: -3 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.9, ease: EASE_DRAWER }}
              className="flex flex-col gap-6"
            >
              {/* o ingresso em papel Cal, canhoto em Areia Clara: as duas cores claras da cartela */}
              <div className="[--background:#f1f0ec] [--border:#bfbab0] [--card:#eae9d6] [--foreground:#0d0d0d] [--muted-foreground:#5f5b54]">
                <TicketStub
                  title={
                    <span className="flex flex-col gap-1">
                      <span>Refuge Series 15</span>
                      <span className="font-sans text-sm font-normal text-[#5f5b54]">{pass.name}</span>
                    </span>
                  }
                  meta={`ter 15 dez · ${EVENT.hours}`}
                  big="15"
                  bigLabel="dez"
                  stub={pass.no}
                  stubLabel="entrada"
                  spoken={`Presença confirmada na Refuge Series 15, terça 15 de dezembro às 23h. Ingresso ${pass.no}.`}
                  defaultTorn={pass.confirmed}
                  onTear={() => setConfirmed(true)}
                  onUndo={() => setConfirmed(false)}
                />
              </div>

              <AnimatePresence>
                {pass.confirmed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.25 }}
                    className="flex flex-wrap gap-3"
                  >
                    <MagneticCta onClick={() => icsFile(pass)} className="h-12 px-6">
                      Salvar na agenda
                    </MagneticCta>
                    <MagneticCta variant="outline" onClick={share} className="h-12 px-6">
                      {shared ? 'Link copiado' : 'Chamar alguém'}
                    </MagneticCta>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => {
                  setPass(null)
                  savePass(null)
                }}
                className="label-mono self-start text-fundacao/50 underline underline-offset-4 hover:text-fundacao"
              >
                Trocar nome
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* o parafuso em raio X: a única cor fora da cartela, só aparece pra quem confirmou */}
      <AnimatePresence>
        {pass?.confirmed && (
          <motion.img
            src="/brand/screw-xray.webp"
            alt=""
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 140, rotate: 30 }}
            animate={{ opacity: 1, y: 0, rotate: 12 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.15 }}
            className="pointer-events-none absolute bottom-[4%] right-[-10%] -z-0 w-[46%] max-w-[300px] mix-blend-multiply [filter:brightness(1.08)_contrast(1.15)] [mask-image:radial-gradient(closest-side,black_70%,transparent)]"
          />
        )}
      </AnimatePresence>
    </section>
  )
}
