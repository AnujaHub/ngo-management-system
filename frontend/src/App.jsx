import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom'
import {
    getAnalytics,
    getDashboard,
    getDonors,
    createDonor,
    updateDonor,
    deleteDonor,
    getVolunteers,
    createVolunteer,
    updateVolunteer,
    deleteVolunteer,
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    getBeneficiaries,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    getDonations,
    createDonation,
    updateDonation,
    deleteDonation,
} from './api'
import './App.css'

const idMap = {
    donors: 'donor_id',
    volunteers: 'volunteer_id',
    projects: 'project_id',
    beneficiaries: 'beneficiary_id',
    donations: 'donation_id',
}

const tableFields = {
    donors: [
        { label: 'Name', name: 'name', type: 'text', required: true },
        { label: 'Donor Type', name: 'donor_type', type: 'text' },
        { label: 'City', name: 'city', type: 'text' },
        { label: 'Organization', name: 'organization', type: 'text' },
    ],
    volunteers: [
        { label: 'Name', name: 'name', type: 'text', required: true },
        { label: 'Phone', name: 'phone', type: 'text' },
        { label: 'Skill', name: 'skill', type: 'text' },
        { label: 'Availability', name: 'availability', type: 'text' },
    ],
    projects: [
        { label: 'Project Name', name: 'project_name', type: 'text', required: true },
        { label: 'Category', name: 'category', type: 'text' },
        { label: 'Location', name: 'location', type: 'text' },
        { label: 'Budget', name: 'budget', type: 'number', step: '0.01' },
    ],
    beneficiaries: [
        { label: 'Name', name: 'name', type: 'text', required: true },
        { label: 'Age', name: 'age', type: 'number' },
        { label: 'Location', name: 'location', type: 'text' },
        { label: 'Category', name: 'category', type: 'text' },
    ],
    donations: [
        { label: 'Donor ID', name: 'donor_id', type: 'number', required: true },
        { label: 'Project ID', name: 'project_id', type: 'number' },
        { label: 'Donation Date', name: 'donation_date', type: 'date' },
        { label: 'Amount', name: 'amount', type: 'number', step: '0.01', required: true },
    ],
}

const defaultValues = {
    donors: { name: '', donor_type: '', city: '', organization: '' },
    volunteers: { name: '', phone: '', skill: '', availability: '' },
    projects: { project_name: '', category: '', location: '', budget: '' },
    beneficiaries: { name: '', age: '', location: '', category: '' },
    donations: { donor_id: '', project_id: '', donation_date: '', amount: '' },
}

const entityColumns = {
    donors: ['donor_id', 'name', 'donor_type', 'city', 'organization'],
    volunteers: ['volunteer_id', 'name', 'phone', 'skill', 'availability'],
    projects: ['project_id', 'project_name', 'category', 'location', 'budget'],
    beneficiaries: ['beneficiary_id', 'name', 'age', 'location', 'category'],
    donations: ['donation_id', 'donor_id', 'project_id', 'donation_date', 'amount'],
}

const columnLabels = {
    donor_id: 'ID', volunteer_id: 'ID', project_id: 'ID', beneficiary_id: 'ID', donation_id: 'ID',
    donor_type: 'Type', project_name: 'Project', donation_date: 'Date',
}

const entityMeta = {
    donors: { singular: 'donor', icon: '◉' },
    volunteers: { singular: 'volunteer', icon: '✦' },
    projects: { singular: 'project', icon: '▣' },
    beneficiaries: { singular: 'beneficiary', icon: '♡' },
    donations: { singular: 'donation', icon: '↗' },
}

function formatCurrency(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function formatDate(value) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function LoadingState({ label = 'Loading...' }) {
    return <div className="state-card"><span className="spinner" />{label}</div>
}

function ErrorState({ message }) {
    return <div className="state-card error-state"><strong>Something went wrong</strong><span>{message}</span></div>
}

function MetricCard({ icon, label, value, detail, tone = 'green' }) {
    return (
        <div className={`metric-card ${tone}`}>
            <div className="metric-icon">{icon}</div>
            <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
        </div>
    )
}

function BarChart({ items = [], labelKey, valueKey, formatter = (value) => value }) {
    const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1)
    if (!items.length) return <div className="empty-chart">No data available yet.</div>

    return (
        <div className="bar-chart">
            {items.slice(0, 7).map((item) => (
                <div className="bar-row" key={String(item[labelKey])}>
                    <div className="bar-label" title={item[labelKey]}>{item[labelKey]}</div>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${(Number(item[valueKey]) / max) * 100}%` }} /></div>
                    <strong>{formatter(item[valueKey])}</strong>
                </div>
            ))}
        </div>
    )
}

function DonutChart({ items = [] }) {
    const total = items.reduce((sum, item) => sum + Number(item.project_count || 0), 0)
    const active = items.find((item) => String(item.status).toLowerCase() === 'active')?.project_count || 0
    const activePercent = total ? (Number(active) / total) * 100 : 0

    return (
        <div className="donut-layout">
            <div className="donut" style={{ background: `conic-gradient(#168a68 ${activePercent}%, #e6b85c 0)` }}>
                <div><strong>{total}</strong><span>projects</span></div>
            </div>
            <div className="legend-list">
                {items.map((item, index) => <div key={item.status}><i className={`legend-dot dot-${index}`} />{item.status}<strong>{item.project_count}</strong></div>)}
            </div>
        </div>
    )
}

function HomePage() {
    const [summary, setSummary] = useState(null)
    const [projects, setProjects] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([getDashboard(), getProjects()])
            .then(([dashboard, projectData]) => { setSummary(dashboard); setProjects(projectData) })
            .catch(() => setError('Unable to load live NGO data. Please check the backend connection.'))
    }, [])

    return (
        <>
            <section className="hero-section">
                <div className="hero-copy">
                    <span className="eyebrow">NGO OPERATIONS, MADE SIMPLE</span>
                    <h1>Connecting people, resources <em>and impact.</em></h1>
                    <p>Manage NGO projects, volunteers, beneficiaries and donations in one connected place.</p>
                    <div className="hero-actions"><Link className="button primary-btn" to="/projects">Explore projects <span>↗</span></Link><Link className="button ghost-btn" to="/dashboard">View dashboard</Link></div>
                    <div className="hero-note"><span className="avatar-stack"><i>R</i><i>S</i><i>A</i></span><span>Making every contribution count</span></div>
                </div>
                <div className="hero-art" aria-label="Community impact illustration"><div className="sun" /><div className="hill hill-back" /><div className="hill hill-front" /><div className="person person-one" /><div className="person person-two" /><div className="plant" /></div>
            </section>

            <section className="impact-strip section-wrap">
                <div><span className="section-kicker">OUR REACH</span><h2>Small actions.<br /><em>Meaningful change.</em></h2></div>
                <div className="impact-stat"><strong>{summary?.projects ?? '—'}</strong><span>Projects</span></div><div className="impact-stat"><strong>{summary?.volunteers ?? '—'}</strong><span>Volunteers</span></div><div className="impact-stat"><strong>{summary?.beneficiaries ?? '—'}</strong><span>Beneficiaries</span></div><div className="impact-stat"><strong>{summary?.donations ?? '—'}</strong><span>Donations</span></div>
            </section>

            <section className="section-wrap projects-section" id="projects"><div className="section-heading"><div><span className="section-kicker">FROM THE FIELD</span><h2>Featured projects</h2></div><Link className="text-link" to="/projects">See all projects <span>→</span></Link></div>{error ? <ErrorState message={error} /> : <div className="project-grid">{projects.slice(0, 4).map((project, index) => <ProjectCard key={project.project_id} project={project} index={index} />)}</div>}</section>

            <section className="story-section section-wrap" id="about"><div className="story-visual"><div className="story-number">01</div><div className="story-circle">✦</div></div><div className="story-copy"><span className="section-kicker">WHY THIS SYSTEM</span><h2>One clear view of the work that matters.</h2><p>From the first volunteer sign-up to the latest donation, keep the details organized and the mission moving forward.</p><div className="feature-list"><span>✓ Better donation visibility</span><span>✓ Stronger volunteer coordination</span><span>✓ Data-led project decisions</span></div></div></section>

            <section className="cta-section section-wrap" id="impact"><div><span className="section-kicker">KEEP THE MOMENTUM GOING</span><h2>Every contribution<br /><em>creates an impact.</em></h2></div><div className="cta-actions"><Link className="button light-btn" to="/projects">View projects →</Link><Link className="button outline-light-btn" to="/dashboard">Manage NGO</Link></div></section>
        </>
    )
}

function ProjectCard({ project, index = 0 }) {
    const colors = ['mint', 'sand', 'blue', 'peach']
    return <article className={`project-card ${colors[index % colors.length]}`}><div className="project-card-top"><span className="project-index">0{index + 1}</span><span className="status-badge">{project.status || 'Active'}</span></div><h3>{project.project_name}</h3><p>{project.category || 'Community initiative'} · {project.location || 'All regions'}</p><div className="project-card-bottom"><span>Budget</span><strong>{formatCurrency(project.budget)}</strong></div></article>
}

function DashboardPage() {
    const [summary, setSummary] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([getDashboard(), getAnalytics()])
            .then(([dashboard, report]) => { setSummary(dashboard); setAnalytics(report) })
            .catch(() => setError('Failed to load dashboard analytics from PostgreSQL.'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <LoadingState label="Loading your impact dashboard..." />
    if (error) return <ErrorState message={error} />

    return <div className="dashboard-page"><div className="page-intro"><div><span className="section-kicker">ADMINISTRATION</span><h1>Good morning, admin.</h1><p>Here’s what’s happening across your NGO today.</p></div><span className="live-pill"><i /> Live database</span></div><div className="metric-grid"><MetricCard icon="▣" label="Total projects" value={summary?.projects ?? 0} detail="Across all initiatives" tone="green" /><MetricCard icon="✦" label="Total volunteers" value={summary?.volunteers ?? 0} detail="People giving their time" tone="blue" /><MetricCard icon="♡" label="Beneficiaries" value={summary?.beneficiaries ?? 0} detail="Lives being supported" tone="gold" /><MetricCard icon="↗" label="Total donations" value={summary?.donations ?? 0} detail={`${formatCurrency(summary?.totalDonation)} received`} tone="purple" /></div><div className="chart-grid"><ChartPanel title="Donations by project" subtitle="Total funds received"><BarChart items={analytics?.donationsByProject} labelKey="project_name" valueKey="total_donation" formatter={formatCurrency} /></ChartPanel><ChartPanel title="Project status" subtitle="Current portfolio"><DonutChart items={analytics?.projectStatus} /></ChartPanel><ChartPanel title="Projects by category" subtitle="Where work is focused"><BarChart items={analytics?.projectsByCategory} labelKey="category" valueKey="project_count" /></ChartPanel><ChartPanel title="Volunteers by skill" subtitle="The strengths in your community"><BarChart items={analytics?.volunteersBySkill} labelKey="skill" valueKey="volunteer_count" /></ChartPanel></div><div className="dashboard-lower"><RecentDonations donations={analytics?.recentDonations} /><ActiveProjects projects={analytics?.activeProjects} /></div><QuickActions /></div>
}

function ChartPanel({ title, subtitle, children }) { return <section className="chart-panel"><div className="chart-heading"><div><h3>{title}</h3><span>{subtitle}</span></div><span className="more-dot">•••</span></div>{children}</section> }

function RecentDonations({ donations = [] }) { return <section className="data-panel"><div className="section-heading compact"><div><span className="section-kicker">LATEST ACTIVITY</span><h2>Recent donations</h2></div><Link className="text-link" to="/donations">View all →</Link></div><div className="table-wrap"><table className="modern-table"><thead><tr><th>Donor</th><th>Project</th><th>Amount</th><th>Date</th><th>Method</th></tr></thead><tbody>{donations.length ? donations.map((donation) => <tr key={donation.donation_id}><td><strong>{donation.donor_name || 'Unknown donor'}</strong></td><td>{donation.project_name || 'General fund'}</td><td className="amount-cell">{formatCurrency(donation.amount)}</td><td>{formatDate(donation.donation_date)}</td><td><span className="method-tag">{donation.payment_method || 'Recorded'}</span></td></tr>) : <tr><td colSpan="5" className="empty-cell">No donations recorded yet.</td></tr>}</tbody></table></div></section> }

function ActiveProjects({ projects = [] }) { return <section className="data-panel"><div className="section-heading compact"><div><span className="section-kicker">IN PROGRESS</span><h2>Active projects</h2></div><Link className="text-link" to="/projects">View all →</Link></div><div className="active-project-list">{projects.slice(0, 4).map((project) => <div className="active-project" key={project.project_id}><div className="project-avatar">{project.project_name?.charAt(0) || 'P'}</div><div><strong>{project.project_name}</strong><span>{project.category || 'Initiative'} · {project.location || '—'}</span></div><b>{formatCurrency(project.budget)}</b></div>)}</div></section> }

function QuickActions() { return <section className="quick-actions"><div><span className="section-kicker">SHORTCUTS</span><h2>Move things forward</h2></div><div className="quick-links"><Link to="/donors">＋ Add donor</Link><Link to="/volunteers">＋ Add volunteer</Link><Link to="/beneficiaries">＋ Add beneficiary</Link><Link to="/donations">＋ Add donation</Link><Link to="/projects">＋ Add project</Link></div></section> }

function EntityPage({ entity, title, fetchItems, addItem, updateItem, deleteItem }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ ...defaultValues[entity] })
    const [searchTerm, setSearchTerm] = useState('')
    const [activeSearch, setActiveSearch] = useState('')
    const meta = entityMeta[entity]

    const loadItems = useCallback(async () => {
        try { setLoading(true); setItems(await fetchItems(activeSearch)); setError('') } catch { setError('Could not load records from the database.') } finally { setLoading(false) }
    }, [activeSearch, fetchItems])
    useEffect(() => { loadItems() }, [loadItems])

    const handleChange = (event) => setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }))
    const resetForm = () => { setFormData({ ...defaultValues[entity] }); setEditingId(null) }
    const handleSubmit = async (event) => { event.preventDefault(); try { if (editingId) await updateItem(editingId, formData); else await addItem(formData); resetForm(); await loadItems() } catch { setError('Save failed. Please check the values and database connection.') } }
    const handleEdit = (item) => { setEditingId(item[idMap[entity]]); setFormData(Object.fromEntries(Object.keys(defaultValues[entity]).map((key) => [key, item[key] ?? '']))) }
    const handleDelete = async (id) => { if (!window.confirm(`Delete this ${meta.singular}? This action cannot be undone.`)) return; try { await deleteItem(id); await loadItems() } catch { setError('Delete failed. This record may be referenced by another table.') } }
    const visibleColumns = useMemo(() => entityColumns[entity].filter((column) => items.length === 0 || items.some((item) => Object.prototype.hasOwnProperty.call(item, column))), [entity, items])

    return <div className="crud-page"><div className="page-intro"><div><span className="section-kicker">DATA MANAGEMENT</span><h1>{title}</h1><p>Create, update and organize your {meta.singular} records.</p></div><span className="record-count">{items.length} records</span></div><div className="crud-layout"><section className="form-card"><div className="form-card-heading"><div className="form-icon">{meta.icon}</div><div><h2>{editingId ? `Edit ${meta.singular}` : `Add ${meta.singular}`}</h2><p>Changes save directly to PostgreSQL.</p></div></div><form onSubmit={handleSubmit}><div className="form-grid">{tableFields[entity].map((field) => <label key={field.name}><span>{field.label}{field.required && <b>*</b>}</span><input type={field.type} name={field.name} step={field.step} required={field.required} value={formData[field.name] ?? ''} onChange={handleChange} /></label>)}</div><div className="button-row"><button type="submit" className="button primary-btn">{editingId ? 'Save changes' : `Add ${meta.singular}`}</button>{editingId && <button type="button" className="button ghost-btn" onClick={resetForm}>Cancel</button>}</div></form></section><section className="records-card"><div className="records-heading"><div><span className="section-kicker">LIVE RECORDS</span><h2>All {title.toLowerCase()}</h2></div><form className="search-bar" onSubmit={(event) => { event.preventDefault(); setActiveSearch(searchTerm.trim()) }}><input type="search" placeholder={`Search ${meta.singular}s...`} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /><button className="search-button" type="submit">⌕</button>{activeSearch && <button type="button" className="clear-button" onClick={() => { setSearchTerm(''); setActiveSearch('') }}>Clear</button>}</form></div>{error && <p className="error-text">{error}</p>}{loading ? <LoadingState label={`Loading ${meta.singular}s...`} /> : <div className="table-wrap"><table className="modern-table"><thead><tr>{visibleColumns.map((column) => <th key={column}>{columnLabels[column] || column.replaceAll('_', ' ')}</th>)}<th>Actions</th></tr></thead><tbody>{items.length === 0 ? <tr><td className="empty-cell" colSpan={visibleColumns.length + 1}>No {meta.singular}s found. Add your first record above.</td></tr> : items.map((item) => <tr key={item[idMap[entity]]}>{visibleColumns.map((column) => <td key={column}>{column === 'budget' || column === 'amount' ? formatCurrency(item[column]) : item[column] ?? '—'}</td>)}<td className="actions-cell"><button type="button" className="table-action edit" onClick={() => handleEdit(item)}>Edit</button><button type="button" className="table-action delete" onClick={() => handleDelete(item[idMap[entity]])}>Delete</button></td></tr>)}</tbody></table></div>}</section></div></div>
}

function AppLayout() {
    return <div className="app-shell"><header className="top-nav"><Link className="brand" to="/"><span className="brand-mark"><img src="/assets/ngoLogo.png" alt="NGO Connect logo" /></span><span>ngo<span className="brand-dot">.</span>connect</span></Link><nav className="nav-links"><NavLink to="/">Home</NavLink><a href="/#about">About</a><NavLink to="/projects">Projects</NavLink><a href="/#impact">Impact</a><NavLink to="/dashboard">Dashboard</NavLink></nav><Link className="admin-link" to="/dashboard">Admin space <span>→</span></Link></header><main className="main-content"><Routes><Route path="/" element={<HomePage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/projects" element={<EntityPage entity="projects" title="Projects" fetchItems={getProjects} addItem={createProject} updateItem={updateProject} deleteItem={deleteProject} />} /><Route path="/donors" element={<EntityPage entity="donors" title="Donors" fetchItems={getDonors} addItem={createDonor} updateItem={updateDonor} deleteItem={deleteDonor} />} /><Route path="/volunteers" element={<EntityPage entity="volunteers" title="Volunteers" fetchItems={getVolunteers} addItem={createVolunteer} updateItem={updateVolunteer} deleteItem={deleteVolunteer} />} /><Route path="/beneficiaries" element={<EntityPage entity="beneficiaries" title="Beneficiaries" fetchItems={getBeneficiaries} addItem={createBeneficiary} updateItem={updateBeneficiary} deleteItem={deleteBeneficiary} />} /><Route path="/donations" element={<EntityPage entity="donations" title="Donations" fetchItems={getDonations} addItem={createDonation} updateItem={updateDonation} deleteItem={deleteDonation} />} /></Routes></main><footer className="site-footer"><div className="brand"><span className="brand-mark">✦</span>ngo<span className="brand-dot">.</span>connect</div><span>Connecting care with action.</span><span>© 2026 NGO Management System</span></footer></div>
}

export default function App() { return <BrowserRouter><AppLayout /></BrowserRouter> }
