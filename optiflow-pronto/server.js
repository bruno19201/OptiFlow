import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const dataDir = path.join(__dirname, 'server-data')
const usersFile = path.join(dataDir, 'users.json')
const secretFile = path.join(dataDir, '.jwt-secret')
const movementsFile = path.join(dataDir, 'movements.json')
const sectors = ['montagem', 'digital', 'tradicional']
let movementWriteQueue = Promise.resolve()
const sectorLabels = { montagem: 'Montagem', digital: 'Surfaçagem Digital', tradicional: 'Surfaçagem Tradicional' }

app.use(express.json({ limit: '20kb' }))

async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true })
  try { await fs.access(usersFile) } catch { await fs.writeFile(usersFile, '[]', { flag: 'wx' }) }
  try { await fs.access(secretFile) } catch { await fs.writeFile(secretFile, crypto.randomBytes(48).toString('hex'), { flag: 'wx', mode: 0o600 }) }
  try { await fs.access(movementsFile) } catch { await fs.writeFile(movementsFile, '[]', { flag: 'wx' }) }
}
async function readMovements() { return JSON.parse(await fs.readFile(movementsFile, 'utf8')) }
async function writeMovements(items) { await fs.writeFile(movementsFile, JSON.stringify(items, null, 2)) }
async function appendMovement(item) {
  movementWriteQueue = movementWriteQueue.then(async () => {
    const items = await readMovements()
    items.push(item)
    await writeMovements(items)
  })
  await movementWriteQueue
}
async function readUsers() { return JSON.parse(await fs.readFile(usersFile, 'utf8')) }
async function writeUsers(users) { await fs.writeFile(usersFile, JSON.stringify(users, null, 2), { mode: 0o600 }) }
async function getSecret() { return fs.readFile(secretFile, 'utf8') }
function publicUser(user) {
  return { id: user.id, name: user.name, username: user.username, role: user.role, sector: user.sector, sectorLabel: ({ montagem: 'Montagem', digital: 'Surfaçagem Digital', tradicional: 'Surfaçagem Tradicional' })[user.sector] || null }
}
async function createToken(user) { return jwt.sign({ sub: user.id, role: user.role }, await getSecret(), { expiresIn: '12h' }) }
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return res.status(401).json({ error: 'Faça login para continuar.' })
    const payload = jwt.verify(token, await getSecret())
    const user = (await readUsers()).find(u => u.id === payload.sub)
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' })
    req.user = user; next()
  } catch { return res.status(401).json({ error: 'Sessão inválida ou expirada. Entre novamente.' }) }
}
function managerOnly(req, res, next) {
  if (req.user.role !== 'gestor') return res.status(403).json({ error: 'Apenas gestores podem realizar esta ação.' })
  next()
}

app.get('/api/setup-status', async (_req, res) => {
  const users = await readUsers()
  res.json({ initialized: users.length > 0 })
})
app.post('/api/setup', async (req, res) => {
  const users = await readUsers()
  if (users.length) return res.status(409).json({ error: 'O administrador inicial já foi criado. Faça login.' })
  const { name, username, password } = req.body || {}
  if (!name?.trim() || !username?.trim() || typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Informe nome, usuário e senha com pelo menos 8 caracteres.' })
  const user = { id: crypto.randomUUID(), name: name.trim(), username: username.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12), role: 'gestor', sector: null, createdAt: new Date().toISOString() }
  await writeUsers([user])
  res.status(201).json({ token: await createToken(user), user: publicUser(user) })
})
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Informe usuário e senha.' })
  const user = (await readUsers()).find(u => u.username === username.trim().toLowerCase())
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Usuário ou senha incorretos.' })
  res.json({ token: await createToken(user), user: publicUser(user) })
})
app.get('/api/me', auth, (req, res) => res.json({ user: publicUser(req.user) }))
app.get('/api/users', auth, managerOnly, async (_req, res) => res.json({ users: (await readUsers()).map(publicUser) }))
app.post('/api/users', auth, managerOnly, async (req, res) => {
  const { name, username, password, role, sector } = req.body || {}
  if (!name?.trim() || !username?.trim() || typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Preencha nome, usuário e senha com pelo menos 8 caracteres.' })
  if (!['gestor', 'funcionario'].includes(role)) return res.status(400).json({ error: 'Tipo de acesso inválido.' })
  if (role === 'funcionario' && !sectors.includes(sector)) return res.status(400).json({ error: 'Selecione um setor válido para o funcionário.' })
  const users = await readUsers()
  const normalized = username.trim().toLowerCase()
  if (users.some(u => u.username === normalized)) return res.status(409).json({ error: 'Este nome de usuário já está em uso.' })
  const user = { id: crypto.randomUUID(), name: name.trim(), username: normalized, passwordHash: await bcrypt.hash(password, 12), role, sector: role === 'funcionario' ? sector : null, createdAt: new Date().toISOString() }
  users.push(user); await writeUsers(users)
  res.status(201).json({ user: publicUser(user) })
})
app.delete('/api/users/:id', auth, managerOnly, async (req, res) => {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Você não pode excluir seu próprio usuário.' })
  const users = await readUsers()
  const target = users.find(u => u.id === req.params.id)
  if (!target) return res.status(404).json({ error: 'Usuário não encontrado.' })
  if (target.role === 'gestor' && users.filter(u => u.role === 'gestor').length === 1) return res.status(400).json({ error: 'O sistema precisa manter pelo menos um gestor.' })
  await writeUsers(users.filter(u => u.id !== req.params.id))
  res.json({ success: true })
})

// Histórico permanente de entrada e saída de serviços por setor.
app.get('/api/movements', auth, async (req, res) => {
  const items = await readMovements()
  const visible = req.user.role === 'gestor' ? items : items.filter(item => item.sector === req.user.sector)
  res.json({ movements: visible.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)) })
})
app.post('/api/movements', auth, async (req, res) => {
  const { os, sector, type, occurredAt, notes } = req.body || {}
  if (typeof os !== 'string' || !os.trim()) return res.status(400).json({ error: 'Informe o número da OS.' })
  if (!sectors.includes(sector)) return res.status(400).json({ error: 'Selecione um setor válido.' })
  if (req.user.role !== 'gestor' && sector !== req.user.sector) return res.status(403).json({ error: 'Funcionários só podem registrar movimentações do próprio setor.' })
  if (!['entrada', 'saida'].includes(type)) return res.status(400).json({ error: 'Tipo de movimentação inválido.' })
  const date = new Date(occurredAt)
  if (!occurredAt || Number.isNaN(date.getTime())) return res.status(400).json({ error: 'Informe uma data e horário válidos.' })
  if (date.getTime() > Date.now() + 5 * 60 * 1000) return res.status(400).json({ error: 'A data da movimentação não pode estar no futuro.' })
  const item = { id: crypto.randomUUID(), os: os.trim().toUpperCase(), sector, sectorLabel: sectorLabels[sector], type, occurredAt: date.toISOString(), notes: typeof notes === 'string' ? notes.trim().slice(0, 300) : '', userName: req.user.name, userId: req.user.id }
  await appendMovement(item)
  res.status(201).json({ movement: item })
})

const distDir = path.join(__dirname, 'dist')
try {
  await fs.access(distDir)
  app.use(express.static(distDir))
  app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
} catch { /* no build yet: Vite serves the frontend in development */ }

await ensureStorage()
app.listen(PORT, () => console.log(`Servidor OptiFlow ativo em http://localhost:${PORT}`))
