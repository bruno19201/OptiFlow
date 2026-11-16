import { useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3,
  Bell, Boxes, CalendarDays, CheckCircle2, ChevronDown, ChevronRight,
  ClipboardList, Clock3, Command, Download, Factory, Filter, LayoutDashboard,
  Menu, PackageCheck, Search, Settings, ShieldCheck, Truck, Users, Wrench, X
} from 'lucide-react'

const navGroups = [
  { title: 'VISÃO GERAL', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  { title: 'PRODUÇÃO', items: [
    { id: 'montagem', label: 'Montagem', icon: Wrench, count: 18 },
    { id: 'digital', label: 'Surfaçagem Digital', icon: Activity, count: 24 },
    { id: 'tradicional', label: 'Surfaçagem Tradicional', icon: Factory, count: 12 },
  ]},
  { title: 'CONTROLE', items: [
    { id: 'quebras', label: 'Controle de quebras', icon: AlertTriangle },
    { id: 'expedicao', label: 'Expedição', icon: Truck, count: 9 },
    { id: 'movimentacoes', label: 'Movimentações', icon: CalendarDays, allUsers: true },
  ]},
]

const orders = [
  { os: 'OS-260184', client: 'Mariana Oliveira', sector: 'Surfaçagem Digital', status: 'Em produção', time: '00h 42min', priority: 'Normal' },
  { os: 'OS-260183', client: 'Roberto Almeida', sector: 'Montagem', status: 'Aguardando', time: '01h 15min', priority: 'Alta' },
  { os: 'OS-260182', client: 'Camila Santos', sector: 'Surfaçagem Tradicional', status: 'Em produção', time: '02h 08min', priority: 'Normal' },
  { os: 'OS-260181', client: 'André Costa', sector: 'Montagem', status: 'Concluída', time: '03h 21min', priority: 'Normal' },
  { os: 'OS-260180', client: 'Patrícia Lima', sector: 'Surfaçagem Digital', status: 'Aguardando', time: '00h 28min', priority: 'Alta' },
]

const sectorData = [
  { name: 'Montagem', total: 18, done: 12, color: 'blue', icon: Wrench },
  { name: 'Surfaçagem Digital', total: 24, done: 17, color: 'cyan', icon: Activity },
  { name: 'Surfaçagem Tradicional', total: 12, done: 8, color: 'violet', icon: Factory },
]

const pageTitles = {
  dashboard: ['Dashboard', 'Acompanhe os indicadores gerais da produção.'],
  montagem: ['Montagem', 'Visão operacional do setor de montagem.'],
  digital: ['Surfaçagem Digital', 'Acompanhamento da produção digital.'],
  tradicional: ['Surfaçagem Tradicional', 'Acompanhamento da produção tradicional.'],
  quebras: ['Controle de quebras', 'Indicadores e ocorrências de perdas.'],
  expedicao: ['Expedição', 'Acompanhamento das ordens prontas para envio.'],
  movimentacoes: ['Movimentações', 'Registre entradas e saídas e consulte o movimento diário por setor.'],
}

function Sidebar({ active, setActive, open, close, user, onLogout }) {
  const isManager = user.role === 'gestor'
  const allowedGroups = navGroups.map(group => ({ ...group, items: group.items.filter(item => isManager || item.id === user.sector || item.allUsers) })).filter(group => group.items.length)
  return <>
    {open && <button className="mobile-scrim" aria-label="Fechar menu" onClick={close} />}
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Command size={22} /></div>
        <div><strong>Opti<span>Flow</span></strong><small>GESTÃO ÓPTICA</small></div>
        <button className="icon-button sidebar-close" onClick={close} aria-label="Fechar menu"><X size={19}/></button>
      </div>
      <div className="workspace"><div className="workspace-icon"><Factory size={17}/></div><div><b>Laboratório óptico</b><small>Unidade principal</small></div><ChevronDown size={15}/></div>
      <nav className="nav">
        {allowedGroups.map(group => <div className="nav-group" key={group.title}>
          <p className="nav-label">{group.title}</p>
          {group.items.map(item => {
            const Icon = item.icon
            return <button key={item.id} className={`nav-item ${active === item.id ? 'active' : ''}`} onClick={() => { setActive(item.id); close() }}>
              <Icon size={18}/><span>{item.label}</span>{item.count && <em>{item.count}</em>}
            </button>
          })}
        </div>)}
      </nav>
      <div className="sidebar-bottom">
        {isManager && <><button className={`nav-item ${active === 'usuarios' ? 'active' : ''}`} onClick={() => { setActive('usuarios'); close() }}><Users size={18}/><span>Usuários e acessos</span></button><button className={`nav-item ${active === 'configuracoes' ? 'active' : ''}`} onClick={() => { setActive('configuracoes'); close() }}><Settings size={18}/><span>Configurações</span></button></>}
        <div className="sidebar-user"><div className="avatar">{user.name.slice(0,2).toUpperCase()}</div><div><b>{user.name}</b><small>{isManager ? 'Gestor' : `Funcionário · ${user.sectorLabel}`}</small></div><button className="logout-small" onClick={onLogout} title="Sair">Sair</button></div>
      </div>
    </aside>
  </>
}

function MetricCard({ title, value, detail, trend, icon: Icon, tone }) {
  return <article className="metric-card">
    <div className="metric-top"><span>{title}</span><div className={`metric-icon ${tone}`}><Icon size={19}/></div></div>
    <div className="metric-value">{value}</div>
    <div className="metric-foot"><span className={trend.startsWith('+') ? 'positive' : 'muted'}>{trend.startsWith('+') && <ArrowUpRight size={14}/>} {trend}</span><span>{detail}</span></div>
  </article>
}

function ProductionChart() {
  const bars = [38, 54, 46, 68, 58, 82, 66, 74, 61, 92, 76, 86]
  return <div className="chart-card">
    <div className="card-heading"><div><h3>Ritmo de produção</h3><p>Ordens concluídas ao longo do dia</p></div><button className="select-button">Hoje <ChevronDown size={14}/></button></div>
    <div className="chart-legend"><span><i className="legend-dot blue-dot"/> Concluídas</span><span><i className="legend-dot gray-dot"/> Meta diária</span></div>
    <div className="chart-area">
      <div className="y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
      <div className="chart-bars">{bars.map((height, i) => <div className="bar-column" key={i}><div className="bar-track"><div className="bar" style={{height: `${height}%`}} /></div><small>{['08','09','10','11','12','13','14','15','16','17','18','19'][i]}h</small></div>)}</div>
    </div>
  </div>
}

function SectorCard({ sector }) {
  const Icon = sector.icon
  const percent = Math.round(sector.done / sector.total * 100)
  return <div className="sector-row">
    <div className={`sector-icon ${sector.color}`}><Icon size={18}/></div>
    <div className="sector-info"><div className="sector-title"><b>{sector.name}</b><span>{sector.done}/{sector.total} concluídas</span></div><div className="progress"><span className={sector.color} style={{width: `${percent}%`}}/></div></div>
    <strong className="sector-percent">{percent}%</strong>
  </div>
}

function OrdersTable({ rows = orders }) {
  return <div className="table-wrap"><table><thead><tr><th>ORDEM DE SERVIÇO</th><th>CLIENTE</th><th>SETOR</th><th>STATUS</th><th>TEMPO</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.os}><td><b className="os-number">{row.os}</b></td><td>{row.client}</td><td>{row.sector}</td><td><span className={`status ${row.status === 'Concluída' ? 'done' : row.status === 'Aguardando' ? 'waiting' : 'working'}`}><i/>{row.status}</span></td><td className="time-cell"><Clock3 size={14}/>{row.time}</td></tr>)}</tbody>
  </table></div>
}


function GlobalOrderSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const normalized = query.trim().toLocaleLowerCase('pt-BR')
  const numericQuery = normalized.replace(/\D/g, '')
  const isOnlyNumbers = /^\d+$/.test(normalized)
  const results = normalized
    ? orders.filter(order => {
        if (isOnlyNumbers) {
          // Quando a pesquisa for numérica, compara somente o início do número da OS.
          const osNumbers = String(order.os).replace(/\D/g, '')
          return osNumbers.startsWith(numericQuery)
        }
        // Para nomes de clientes ou códigos digitados com letras, mantém a busca textual.
        return `${order.os} ${order.client}`.toLocaleLowerCase('pt-BR').includes(normalized)
      })
    : []

  return <div className="global-search">
    <label className="global-search-field">
      <Search size={16}/>
      <input
        value={query}
        onChange={event => { setQuery(event.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={event => { if (event.key === 'Escape') setOpen(false) }}
        placeholder="Pesquisar OS ou cliente..."
        aria-label="Pesquisar ordem de serviço por OS ou nome do cliente"
      />
      {query && <button type="button" onClick={() => { setQuery(''); setOpen(false) }} aria-label="Limpar pesquisa"><X size={14}/></button>}
    </label>
    {open && query.trim() && <div className="global-search-results">
      <div className="global-search-caption">RESULTADOS EM TODOS OS SETORES</div>
      {results.length ? results.map(order => <div className="global-search-result" key={order.os}>
        <div><b>{order.os}</b><span>{order.client}</span></div>
        <div className="global-search-meta"><span>{order.sector}</span><small className={`status ${order.status === 'Concluída' ? 'done' : order.status === 'Aguardando' ? 'waiting' : 'working'}`}>{order.status}</small></div>
      </div>) : <p className="global-search-empty">Nenhum serviço encontrado para essa pesquisa.</p>}
      <p className="global-search-note">A pesquisa considera todos os setores. Os resultados atuais são demonstrativos.</p>
    </div>}
  </div>
}

function Dashboard() {
  return <>
    <section className="welcome-banner"><div><span className="eyebrow">DOMINGO, 15 DE NOVEMBRO DE 2026</span><h2>Bom trabalho, gestor <span>👋</span></h2><p>Aqui está o resumo da operação do laboratório hoje.</p></div><div className="banner-symbol"><Boxes size={64}/></div></section>
    <section className="metrics-grid">
      <MetricCard title="OS em produção" value="54" trend="+8,2%" detail="vs. período anterior" icon={Activity} tone="blue"/>
      <MetricCard title="Aguardando setor" value="17" trend="No momento" detail="em fila de produção" icon={Clock3} tone="amber"/>
      <MetricCard title="Concluídas hoje" value="37" trend="+12,5%" detail="vs. período anterior" icon={CheckCircle2} tone="green"/>
      <MetricCard title="Quebras registradas" value="03" trend="Hoje" detail="2 OD · 1 OE" icon={AlertTriangle} tone="red"/>
    </section>
    <section className="dashboard-grid">
      <ProductionChart/>
      <div className="panel-card sectors-card"><div className="card-heading"><div><h3>Produção por setor</h3><p>Desempenho do dia</p></div><button className="more-button">•••</button></div><div className="sector-list">{sectorData.map(s => <SectorCard key={s.name} sector={s}/>)}</div><div className="sector-total"><span>Total em andamento</span><b>54 OS</b></div></div>
    </section>
    <section className="panel-card recent-card"><div className="card-heading"><div><h3>Movimentações recentes</h3><p>Últimas atualizações recebidas do sistema de produção</p></div><button className="text-button">Ver todas <ChevronRight size={15}/></button></div><OrdersTable/></section>
    <p className="demo-note"><ShieldCheck size={15}/> Dados demonstrativos para apresentação. Ainda não conectado ao sistema do laboratório.</p>
  </>
}

function SectionPage({ page }) {
  const [query, setQuery] = useState('')
  const [breakSector, setBreakSector] = useState('Todos')
  const filtered = useMemo(() => orders.filter(o => `${o.os} ${o.client}`.toLowerCase().includes(query.toLowerCase())), [query])
  const config = {
    montagem: { value: '18', label: 'OS no setor', sub: '12 concluídas hoje', icon: Wrench, extra: '6 aguardando montagem' },
    digital: { value: '24', label: 'OS no setor', sub: '17 concluídas hoje', icon: Activity, extra: '7 em processamento' },
    tradicional: { value: '12', label: 'OS no setor', sub: '8 concluídas hoje', icon: Factory, extra: '4 em processamento' },
    quebras: { value: '03', label: 'Quebras hoje', sub: '2 OD · 1 OE', icon: AlertTriangle, extra: 'Setor com mais ocorrências: Digital' },
    expedicao: { value: '09', label: 'Aguardando expedição', sub: '26 expedidas hoje', icon: Truck, extra: 'Tempo médio: 18 minutos' },
  }
  const data = config[page] || config.montagem
  const Icon = data.icon
  const filteredRows = page === 'montagem' ? filtered.filter(o => o.sector === 'Montagem') : page === 'digital' ? filtered.filter(o => o.sector === 'Surfaçagem Digital') : page === 'tradicional' ? filtered.filter(o => o.sector === 'Surfaçagem Tradicional') : filtered
  const breakRecords = [
    { os: 'OS-260176', eye: 'OD', sector: 'Surfaçagem Digital', reason: 'Quebra durante produção', time: '10:42' },
    { os: 'OS-260169', eye: 'OE', sector: 'Montagem', reason: 'Quebra durante montagem', time: '09:18' },
    { os: 'OS-260151', eye: 'OD', sector: 'Surfaçagem Tradicional', reason: 'Quebra no processo', time: '08:36' },
  ]
  const visibleBreaks = breakRecords.filter(item => (breakSector === 'Todos' || item.sector === breakSector) && `${item.os} ${item.reason}`.toLowerCase().includes(query.toLowerCase()))
  const breakSectors = ['Todos', 'Montagem', 'Surfaçagem Digital', 'Surfaçagem Tradicional']
  return <div className="section-page">
    <div className="section-summary">
      <div className={`large-metric-icon ${page}`}><Icon size={25}/></div>
      <div><span>{data.label}</span><strong>{data.value}</strong><small>{data.sub}</small></div>
      <div className="summary-extra">{data.extra}</div>
    </div>
    <div className="panel-card"><div className="card-heading responsive-heading"><div><h3>{page === 'quebras' ? 'Registros recentes' : page === 'expedicao' ? 'Ordens para expedição' : 'Ordens do setor'}</h3><p>Dados demonstrativos de acompanhamento</p></div><div className="table-actions"><label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar OS ou cliente"/></label><button className="select-button"><Filter size={14}/> Filtrar</button></div></div>
      {page === 'quebras' ? <>
        <div className="break-sector-tabs" role="tablist" aria-label="Filtrar quebras por setor">
          {breakSectors.map(sector => <button key={sector} type="button" role="tab" aria-selected={breakSector === sector} className={breakSector === sector ? 'active' : ''} onClick={() => setBreakSector(sector)}>
            {sector}<span>{sector === 'Todos' ? breakRecords.length : breakRecords.filter(item => item.sector === sector).length}</span>
          </button>)}
        </div>
        <div className="break-list">
          {visibleBreaks.length ? visibleBreaks.map(item => <div className="break-item" key={item.os}>
            <span className={`break-tag ${item.eye === 'OE' ? 'oe' : ''}`}>{item.eye}</span>
            <div><b>{item.os}</b><small>{item.sector} · {item.reason}</small></div>
            <time>{item.time}</time>
          </div>) : <p className="empty-breaks">Nenhuma quebra encontrada neste setor.</p>}
        </div>
      </> : <OrdersTable rows={filteredRows}/>}
    </div>
    <p className="demo-note"><ShieldCheck size={15}/> Informações ilustrativas. A integração com a fonte de dados será definida posteriormente.</p>
  </div>
}


function localDateValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
function localDateTimeValue(date = new Date()) {
  return `${localDateValue(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
function MovementsPage({ token, user }) {
  const isManager = user.role === 'gestor'
  const sectorOptions = [
    { id: 'montagem', label: 'Montagem' },
    { id: 'digital', label: 'Surfaçagem Digital' },
    { id: 'tradicional', label: 'Surfaçagem Tradicional' },
  ]
  const [movements, setMovements] = useState([])
  const [selectedDate, setSelectedDate] = useState(localDateValue())
  const [os, setOs] = useState('')
  const [sector, setSector] = useState(user.sector || 'montagem')
  const [type, setType] = useState('entrada')
  const [occurredAt, setOccurredAt] = useState(localDateTimeValue())
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadMovements() {
    const response = await fetch(`${API}/movements`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Não foi possível carregar as movimentações.')
    setMovements(data.movements || [])
  }
  useEffect(() => { loadMovements().catch(err => setError(err.message)) }, [token])

  const dayMovements = movements.filter(item => localDateValue(new Date(item.occurredAt)) === selectedDate)
  const report = sectorOptions.map(option => ({
    ...option,
    entries: dayMovements.filter(item => item.sector === option.id && item.type === 'entrada').length,
    exits: dayMovements.filter(item => item.sector === option.id && item.type === 'saida').length,
  }))
  const totalEntries = report.reduce((sum, item) => sum + item.entries, 0)
  const totalExits = report.reduce((sum, item) => sum + item.exits, 0)

  async function submitMovement(event) {
    event.preventDefault()
    setError(''); setSuccess(''); setSaving(true)
    try {
      const response = await fetch(`${API}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ os, sector, type, occurredAt, notes }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível salvar a movimentação.')
      await loadMovements()
      setSelectedDate(localDateValue(new Date(data.movement.occurredAt)))
      setOs(''); setNotes(''); setSuccess('Movimentação registrada com sucesso.')
      setOccurredAt(localDateTimeValue())
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return <div className="movement-page">
    <section className="panel-card movement-form-card">
      <div className="card-heading"><div><h3>Registrar movimentação</h3><p>Registre quando uma OS entrar ou sair de um setor</p></div></div>
      <form className="movement-form" onSubmit={submitMovement}>
        <label> Número da OS <input value={os} onChange={e => setOs(e.target.value)} placeholder="Ex.: OS-260200" required /></label>
        <label>Setor <select value={sector} onChange={e => setSector(e.target.value)} disabled={!isManager}>{sectorOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
        <label>Movimentação <select value={type} onChange={e => setType(e.target.value)}><option value="entrada">Entrada no setor</option><option value="saida">Saída do setor</option></select></label>
        <label>Data e horário <input type="datetime-local" value={occurredAt} max={localDateTimeValue()} onChange={e => setOccurredAt(e.target.value)} required /></label>
        <label className="movement-notes">Observação (opcional) <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ex.: encaminhada para o próximo setor" maxLength={300}/></label>
        <button className="auth-submit" disabled={saving}>{saving ? 'Salvando...' : 'Registrar movimentação'}</button>
      </form>
      {error && <p className="auth-error">{error}</p>}{success && <p className="user-success">{success}</p>}
      <p className="demo-note"><ShieldCheck size={15}/> {isManager ? 'Como gestor, você pode registrar movimentações em qualquer setor.' : 'Seu usuário só pode registrar movimentações do setor ao qual está vinculado.'}</p>
    </section>

    <section className="panel-card movement-report-card">
      <div className="card-heading movement-report-heading"><div><h3>Relatório diário por setor</h3><p>Escolha uma data para consultar as entradas e saídas</p></div><label className="date-filter"><CalendarDays size={16}/><input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} /></label></div>
      <div className="table-wrap"><table className="movement-report-table"><thead><tr><th>SETOR</th><th>ENTRARAM</th><th>SAÍRAM</th><th>SALDO DO DIA</th></tr></thead><tbody>
        {report.map(item => <tr key={item.id}><td><b>{item.label}</b></td><td><span className="movement-count entry-count">{item.entries}</span></td><td><span className="movement-count exit-count">{item.exits}</span></td><td>{item.entries - item.exits > 0 ? '+' : ''}{item.entries - item.exits}</td></tr>)}
        <tr className="movement-total-row"><td><b>Total geral</b></td><td><b>{totalEntries}</b></td><td><b>{totalExits}</b></td><td><b>{totalEntries - totalExits > 0 ? '+' : ''}{totalEntries - totalExits}</b></td></tr>
      </tbody></table></div>
      {!dayMovements.length && <p className="movement-empty">Nenhuma movimentação registrada nesta data.</p>}
    </section>

    <section className="panel-card movement-history-card">
      <div className="card-heading"><div><h3>Movimentações do dia</h3><p>{dayMovements.length} registro(s) em {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('pt-BR')}</p></div></div>
      {dayMovements.length ? <div className="table-wrap"><table><thead><tr><th>HORÁRIO</th><th>OS</th><th>SETOR</th><th>MOVIMENTAÇÃO</th><th>REGISTRADO POR</th></tr></thead><tbody>
        {dayMovements.slice().sort((a,b) => b.occurredAt.localeCompare(a.occurredAt)).map(item => <tr key={item.id}><td>{new Date(item.occurredAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</td><td><b className="os-number">{item.os}</b></td><td>{item.sectorLabel}</td><td><span className={`movement-pill ${item.type}`}>{item.type === 'entrada' ? 'Entrada' : 'Saída'}</span></td><td>{item.userName}</td></tr>)}
      </tbody></table></div> : <p className="movement-empty">Os registros feitos aparecerão aqui.</p>}
    </section>
  </div>
}

const API = '/api'

function AuthScreen({ setup, onAuthenticated }) {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setError('')
    if (setup && password !== confirm) return setError('As senhas não conferem.')
    setBusy(true)
    try {
      const response = await fetch(`${API}/${setup ? 'setup' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(setup ? { name, username, password } : { username, password }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível entrar.')
      localStorage.setItem('optiflow_token', data.token)
      onAuthenticated(data.user)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <div className="auth-screen"><div className="auth-card"><div className="auth-brand"><div className="brand-mark"><Command size={24}/></div><div><strong>Opti<span>Flow</span></strong><small>GESTÃO ÓPTICA</small></div></div><div className="auth-intro"><span className="eyebrow">ACESSO AO SISTEMA</span><h1>{setup ? 'Configure o administrador' : 'Bem-vindo de volta'}</h1><p>{setup ? 'Crie a primeira conta. Ela terá acesso de gestor a todos os setores.' : 'Entre com seu usuário e senha para acessar o painel.'}</p></div><form onSubmit={submit} className="auth-form">{setup && <label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" required minLength={2}/></label>}<label>Usuário<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Digite seu usuário" required minLength={3} autoComplete="username"/></label><label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" required minLength={8} autoComplete={setup ? 'new-password' : 'current-password'}/></label>{setup && <label>Confirmar senha<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Digite a senha novamente" required minLength={8} autoComplete="new-password"/></label>}{error && <div className="auth-error">{error}</div>}<button className="auth-submit" disabled={busy}>{busy ? 'Aguarde...' : setup ? 'Criar administrador' : 'Entrar no OptiFlow'}</button></form><div className="auth-security"><ShieldCheck size={15}/> Acesso protegido por senha criptografada</div></div><p className="auth-footer">© 2026 OptiFlow · Gestão Inteligente de Produção Óptica</p></div>
}

function UsersPage({ token, currentUser }) {
  const [users, setUsers] = useState([])
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('funcionario')
  const [sector, setSector] = useState('montagem')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  async function loadUsers() {
    const r = await fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
    const d = await r.json(); if (r.ok) setUsers(d.users || [])
  }
  useEffect(() => { loadUsers() }, [])
  async function createUser(e) {
    e.preventDefault(); setMessage(''); setError('')
    try {
      const r = await fetch(`${API}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, username, password, role, sector: role === 'funcionario' ? sector : null }) })
      const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Erro ao cadastrar usuário.')
      setName(''); setUsername(''); setPassword(''); setMessage('Usuário cadastrado com sucesso!'); loadUsers()
    } catch (e) { setError(e.message) }
  }
  async function removeUser(id) {
    if (!window.confirm('Deseja realmente excluir este usuário?')) return
    const r = await fetch(`${API}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const d = await r.json(); if (!r.ok) setError(d.error || 'Não foi possível excluir.'); else { setMessage('Usuário excluído.'); loadUsers() }
  }
  const sectorNames = { montagem: 'Montagem', digital: 'Surfaçagem Digital', tradicional: 'Surfaçagem Tradicional' }
  return <div className="users-page"><section className="panel-card user-create"><div className="card-heading"><div><h3>Cadastrar novo usuário</h3><p>Crie acessos para gestores e funcionários do laboratório.</p></div></div><form className="user-form" onSubmit={createUser}><label>Nome completo<input value={name} onChange={e=>setName(e.target.value)} required placeholder="Nome do funcionário"/></label><label>Nome de usuário<input value={username} onChange={e=>setUsername(e.target.value)} required minLength={3} placeholder="Ex.: joao.silva"/></label><label>Senha inicial<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} placeholder="Mínimo de 8 caracteres"/></label><label>Tipo de acesso<select value={role} onChange={e=>setRole(e.target.value)}><option value="funcionario">Funcionário</option><option value="gestor">Gestor</option></select></label>{role === 'funcionario' && <label>Setor do funcionário<select value={sector} onChange={e=>setSector(e.target.value)}><option value="montagem">Montagem</option><option value="digital">Surfaçagem Digital</option><option value="tradicional">Surfaçagem Tradicional</option></select></label>}<button className="auth-submit">Cadastrar usuário</button></form>{message && <p className="user-success">{message}</p>}{error && <p className="auth-error">{error}</p>}</section><section className="panel-card user-list"><div className="card-heading"><div><h3>Usuários cadastrados</h3><p>{users.length} conta(s) com acesso ao OptiFlow</p></div></div><div className="table-wrap"><table><thead><tr><th>NOME</th><th>USUÁRIO</th><th>PERFIL</th><th>SETOR</th><th>AÇÃO</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><b>{u.name}</b></td><td>{u.username}</td><td>{u.role === 'gestor' ? 'Gestor' : 'Funcionário'}</td><td>{u.sector ? sectorNames[u.sector] : 'Todos'}</td><td>{u.id !== currentUser.id ? <button className="delete-user" onClick={()=>removeUser(u.id)}>Excluir</button> : <span className="muted">Você</span>}</td></tr>)}</tbody></table></div></section><p className="demo-note"><ShieldCheck size={15}/> As senhas são armazenadas com hash seguro. Funcionários continuam com o menu operacional do próprio setor, mas podem pesquisar serviços de todos os setores.</p></div>
}

export default function App() {
  const [authState, setAuthState] = useState('checking')
  const [setup, setSetup] = useState(false)
  const [user, setUser] = useState(null)
  const [active, setActive] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const token = localStorage.getItem('optiflow_token')
  const sectorPages = ['montagem', 'digital', 'tradicional']
  useEffect(() => {
    async function init() {
      try {
        const status = await fetch(`${API}/setup-status`).then(r=>r.json())
        setSetup(!status.initialized)
        if (token) {
          const r = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
          const d = await r.json()
          if (r.ok) { setUser(d.user); setActive(d.user.role === 'gestor' ? 'dashboard' : d.user.sector) ; setAuthState('ready'); return }
          localStorage.removeItem('optiflow_token')
        }
        setAuthState('login')
      } catch { setAuthState('offline') }
    }
    init()
  }, [])
  function authenticated(u) { setSetup(false); setUser(u); setActive(u.role === 'gestor' ? 'dashboard' : u.sector); setAuthState('ready') }
  function logout() { localStorage.removeItem('optiflow_token'); setUser(null); setAuthState('login') }
  if (authState === 'checking') return <div className="auth-screen"><div className="auth-loading">Carregando OptiFlow...</div></div>
  if (authState === 'offline') return <div className="auth-screen"><div className="auth-card"><h2>Servidor não iniciado</h2><p>Feche o terminal e inicie o projeto pelo comando <b>npm run dev</b>, que abre o painel e o servidor de autenticação.</p></div></div>
  if (authState === 'login') return <AuthScreen setup={setup} onAuthenticated={authenticated}/>
  const isManager = user.role === 'gestor'
  const title = pageTitles[active] || [active === 'usuarios' ? 'Usuários e acessos' : 'Configurações', 'Área administrativa do OptiFlow.']
  const allowed = isManager || active === user.sector || active === 'movimentacoes'
  return <div className="app-shell">
    <Sidebar active={active} setActive={setActive} open={menuOpen} close={() => setMenuOpen(false)} user={user} onLogout={logout}/>
    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu/></button><div className="breadcrumb">OptiFlow <ChevronRight size={14}/> <b>{title[0]}</b></div></div>
        <div className="topbar-right"><GlobalOrderSearch/><div className="live-indicator"><i/> Acesso autenticado</div><div className="notification-wrap"><button className="icon-button notification-button" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notificações"><Bell size={19}/><i/></button>{notificationsOpen && <div className="notification-popover"><b>Notificações</b><p>Você está conectado ao OptiFlow como {isManager ? 'gestor' : 'funcionário'}.</p></div>}</div><div className="top-avatar">{user.name.slice(0,2).toUpperCase()}</div><button className="top-logout" onClick={logout}>Sair</button></div>
      </header>
      <div className="content">
        <div className="page-heading"><div><h1>{title[0]}</h1><p>{title[1]}</p></div><button className="date-button"><CalendarDays size={16}/> 15 nov, 2026 <ChevronDown size={14}/></button></div>
        {active === 'movimentacoes' ? <MovementsPage token={token} user={user}/> : isManager && active === 'dashboard' ? <Dashboard/> : isManager && active === 'usuarios' ? <UsersPage token={token} currentUser={user}/> : isManager && active === 'configuracoes' ? <div className="panel-card placeholder"><Settings size={28}/><h3>Configurações</h3><p>Esta área será desenvolvida na próxima etapa.</p></div> : allowed && sectorPages.includes(active) ? <SectionPage page={active}/> : isManager && ['quebras','expedicao'].includes(active) ? <SectionPage page={active}/> : <div className="panel-card placeholder"><ShieldCheck size={28}/><h3>Acesso restrito</h3><p>Seu usuário não tem permissão para visualizar esta área.</p></div>}
      </div>
      <footer className="footer"><span>© 2026 OptiFlow</span><span>Gestão Inteligente de Produção Óptica</span></footer>
    </main>
  </div>
}
