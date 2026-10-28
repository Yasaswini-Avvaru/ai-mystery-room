import { Link } from 'react-router-dom';
import { ArrowUpRight, Fingerprint, ShieldAlert } from 'lucide-react';
import { resolveAssetUrl } from './services/api.js';

export function Header({ light = false }) { return <header className="site-header"><Link to="/" className="brand"><span className="brand-mark"><Fingerprint size={18}/></span><span>CASEFILE<small>AN AI MYSTERY ROOM</small></span></Link><nav><Link to="/create">Create a case <ArrowUpRight size={14}/></Link></nav>{light && <span className="header-note">FICTIONAL INVESTIGATIONS ONLY</span>}</header>; }
export function PageShell({ children }) { return <div className="page-shell"><Header light/><main>{children}</main></div>; }
export function Notice() { return <div className="fiction-notice"><ShieldAlert size={15}/><span>This is a fictional AI-generated mystery. All characters, messages, images, recordings, and evidence are simulated.</span></div>; }
export function ErrorMessage({ children }) { return children ? <div className="error-box" role="alert">{children}</div> : null; }
export function Loading({ label = 'Loading case file…' }) { return <div className="center-state"><span className="loader"/><p>{label}</p></div>; }
export function EvidenceIcon({ type }) { const map = { MESSAGE: '◌', IMAGE: '▧', CCTV: '◉', WITNESS_STATEMENT: '“', DOCUMENT: '▤', PHYSICAL_CLUE: '⌑', DIGITAL_LOG: '⌘', TIMELINE_RECORD: '◷' }; return <span className="evidence-icon">{map[type] || '⌑'}</span>; }
export function EvidenceMedia({ media, alt = '', className = '', controls = false }) {
  if (!media?.storageUrl || media.status !== 'READY') return null;
  if (media.kind === 'IMAGE') return <img className={className} src={resolveAssetUrl(media.storageUrl)} alt={alt || media.altText || 'Fictional evidence image'} loading="lazy" />;
  if (media.kind === 'VIDEO') return <video className={className} src={resolveAssetUrl(media.storageUrl)} aria-label={alt || media.altText || 'Fictional surveillance video'} controls={controls} muted={!controls} playsInline preload="metadata" />;
  return null;
}
