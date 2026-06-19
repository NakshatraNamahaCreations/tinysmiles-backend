import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const {
  GMAIL_USER,
  GMAIL_APP_PASSWORD,
  MAIL_TO,
  PORT = 5174,
} = process.env

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('[mail] GMAIL_USER and GMAIL_APP_PASSWORD must be set in .env')
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
})

transporter.verify((err) => {
  if (err) console.error('[mail] transporter verify failed:', err.message)
  else console.log('[mail] Gmail transporter ready')
})

const app = express()
app.use(cors())
app.use(express.json({ limit: '100kb' }))

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''))

app.post('/api/contact', async (req, res) => {
  const { name, email, address, services, message } = req.body || {}

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'name, email and message are required' })
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'invalid email' })
  }

  const recipient = MAIL_TO || GMAIL_USER

  const html = `
    <h2>New enquiry from Tiny Smiles website</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Address:</strong> ${escapeHtml(address || '-')}</p>
    <p><strong>Service:</strong> ${escapeHtml(services || '-')}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `

  const text =
    `New enquiry from Tiny Smiles website\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Address: ${address || '-'}\n` +
    `Service: ${services || '-'}\n\n` +
    `Message:\n${message}\n`

  try {
    await transporter.sendMail({
      from: `"Tiny Smiles Website" <${GMAIL_USER}>`,
      to: recipient,
      replyTo: `${name} <${email}>`,
      subject: `New enquiry from ${name}`,
      text,
      html,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('[mail] send failed:', err)
    res.status(500).json({ ok: false, error: 'failed to send email' })
  }
})

app.post('/api/booking', async (req, res) => {
  const { name, email, phone, date, sessionType, sessionSetting } = req.body || {}

  if (!name || !email) {
    return res.status(400).json({ ok: false, error: 'name and email are required' })
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'invalid email' })
  }

  const recipient = MAIL_TO || GMAIL_USER

  const html = `
    <h2>New booking enquiry from Tiny Smiles website</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || '-')}</p>
    <p><strong>Preferred date / timeframe:</strong> ${escapeHtml(date || '-')}</p>
    <p><strong>Session type:</strong> ${escapeHtml(sessionType || '-')}</p>
    <p><strong>Preferred setting:</strong> ${escapeHtml(sessionSetting || '-')}</p>
  `

  const text =
    `New booking enquiry from Tiny Smiles website\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone || '-'}\n` +
    `Preferred date / timeframe: ${date || '-'}\n` +
    `Session type: ${sessionType || '-'}\n` +
    `Preferred setting: ${sessionSetting || '-'}\n`

  try {
    await transporter.sendMail({
      from: `"Tiny Smiles Website" <${GMAIL_USER}>`,
      to: recipient,
      replyTo: `${name} <${email}>`,
      subject: `New booking enquiry from ${name}`,
      text,
      html,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('[mail] booking send failed:', err)
    res.status(500).json({ ok: false, error: 'failed to send booking enquiry' })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`[mail] server listening on http://localhost:${PORT}`)
})
