import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, FileText, Search, SlidersHorizontal, Users } from 'lucide-react';
import { api } from '../services/api.js';
import { EvidenceIcon, EvidenceMedia, ErrorMessage, Header, Loading, Notice } from '../components.jsx';

const categories = [['ALL','All evidence'],['MESSAGE','Messages'],['IMAGE','Images'],['CCTV','Surveillance'],['WITNESS_STATEMENT','Witnesses'],['DOCUMENT','Documents'],['PHYSICAL_CLUE','Physical clues'],['DIGITAL_LOG','Digital records']];

export default function InvestigationPage() {
  const { caseId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  useEffect(() => { api.getCase(caseId).then(setData).catch(e => setError(e.message)); }, [caseId]);

  if (error) return <><Header/><div className="center-state"><ErrorMessage>{error}</ErrorMessage><Link className="button" to="/">Return home</Link></div></>;
  if (!data) return <><Header/><Loading/></>;
  const c = data.case;
  const evidence = c.evidence.filter(e => filter === 'ALL' || e.type === filter);

  return <div className="app-page"><Header light/><main className="investigation">
    <div className="case-top"><div><div className="eyebrow"><span className="eyebrow-line"/> ACTIVE INVESTIGATION <span className="status-pill">{c.status}</span></div><h1>{c.title}</h1><p>{c.summary}</p></div><Link className="button button-gold" to={`/case/${caseId}/accuse`}>Accuse a suspect <ArrowUpRight size={15}/></Link></div>
    <Notice/><div className="investigation-grid">
      <aside className="case-rail"><div className="rail-card"><div className="rail-heading"><Users size={16}/><span>PERSONS OF INTEREST</span><b>{c.suspects.length}</b></div>{c.suspects.map((s,i)=><article className="suspect-row" key={s.id}><span className="avatar">{s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</span><div><b>{s.name}</b><small>{s.relationshipToCase}</small></div><span className="suspect-index">0{i+1}</span></article>)}</div>
        <div className="rail-card case-brief"><span className="rail-label">CASE BRIEF</span><p>{c.scenario}</p><div><span>DIFFICULTY</span><b>{c.difficulty}</b></div><div><span>GENRE</span><b>{c.genre.replaceAll('_',' ')}</b></div></div>
      </aside>
      <section className="evidence-area"><div className="evidence-header"><div><span className="rail-label">THE EVIDENCE ROOM</span><h2>Collected artifacts <small>{c.evidence.length} items</small></h2></div><button className="filter-toggle" onClick={() => setFilter(filter === 'ALL' ? 'MESSAGE' : 'ALL')}><SlidersHorizontal size={15}/> Filter</button></div>
        <div className="category-tabs">{categories.map(([value,label]) => <button className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value}>{label}</button>)}</div>
        {evidence.length === 0 ? <div className="empty-state"><Search/><p>No artifacts in this category yet.</p></div> : <div className="evidence-grid">{evidence.map(item => <Link className="evidence-card" to={`/case/${caseId}/evidence/${item.id}`} key={item.id}>
          <div className={`evidence-preview preview-${item.type.toLowerCase()}`}>
            {item.media?.status === 'READY' && item.media.storageUrl ? <EvidenceMedia media={item.media} alt={item.title} className="evidence-media"/> : <EvidenceIcon type={item.type}/>}
            <span>{item.type.replaceAll('_',' ')}</span>
            {item.media?.status === 'FAILED' && <i title={item.media.failureMessage}>MEDIA UNAVAILABLE</i>}
            {item.media?.status === 'READY' && <i>{item.media.kind === 'VIDEO' ? 'VIDEO' : 'IMAGE'}</i>}
          </div>
          <div className="evidence-card-body"><div className="artifact-meta"><span>{item.sourceLabel}</span><span>{item.occurredAt ? new Date(item.occurredAt).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}) : 'UNDATED'}</span></div><h3>{item.title}</h3><p>{item.summary}</p><span className="open-artifact">OPEN ARTIFACT <ArrowUpRight size={13}/></span></div>
        </Link>)}</div>}
      </section>
    </div>
    <div className="case-bottom"><span><FileText size={15}/> Fictional evidence; generated media is labeled.</span><Link to={`/case/${caseId}/accuse`}>Ready to make your accusation? <ArrowUpRight size={14}/></Link></div>
  </main></div>;
}
