// Vercel serverless entry. The Express app from ../index.js is exported as the
// default handler. vercel.json rewrites every /api/* request to this file, and
// Express then matches the original path (req.url is preserved).
export { default } from '../index.js'
