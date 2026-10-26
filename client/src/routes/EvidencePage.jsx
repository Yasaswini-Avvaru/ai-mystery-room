import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ImagePlus } from 'lucide-react';
import { api } from '../services/api.js';
import { EvidenceIcon, EvidenceMedia, Header, Loading, Notice, ErrorMessage } from '../components.jsx';

export default function EvidencePage() {
  const { caseId, evidenceId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retryingImage, setRetryingImage] = useState(false);
  const [retryError, setRetryError] = useState('');
  useEffect(() => { api.getEvidence(caseId, evidenceId).then(setData).catch(e => setError(e.message)); }, [caseId, evidenceId]);
  const evidence = data?.evidence;
  async function generateImage() {
    setRetryingImage(true);
    setRetryError('');
    try { const result = await api.generateEvidenceImage(caseId, evidenceId); setData(current => ({ ...current, evidence: result.evidence })); }
    catch (e) { setRetryError(e.message); }
    finally { setRetryingImage(false); }
  }

  return <div className="app-page"><Header light/>
    {error ? <div className="center-state"><ErrorMessage>{error}</ErrorMessage></div> : !data ? <Loading/> : <main className="detail-page">
      <Link className="back-link" to={`/case/${caseId}`}><ArrowLeft size={14}/> BACK TO INVESTIGATION</Link>
      <div className="detail-card">
        <div className={`detail-artifact preview-${evidence.type.toLowerCase()}`}>
          {evidence.media?.status === 'READY' && evidence.media.storageUrl ? <EvidenceMedia media={evidence.media} alt={evidence.title} className="detail-media" controls/> : <>
            <EvidenceIcon type={evidence.type}/><span>{evidence.type.replaceAll('_',' ')}</span>
            <small className="media-status">{evidence.media?.status === 'FAILED' ? (evidence.media.failureMessage || 'Media generation failed; written evidence is available.') : 'Fictional evidence artifact'}</small>
            {evidence.type === 'IMAGE' && evidence.media?.status !== 'READY' && <button className="button button-gold" onClick={generateImage} disabled={retryingImage}>{retryingImage ? 'Generating photo…' : <>Generate evidence photo <ImagePlus size={15}/></>}</button>}
            {retryError && <small className="media-status" role="alert">{retryError}</small>}
          </>}
        </div>
        <div className="detail-content"><div className="eyebrow"><span className="eyebrow-line"/> EVIDENCE / {evidence.sourceLabel}</div><h1>{evidence.title}</h1><p className="detail-summary">{evidence.summary}</p><div className="detail-copy">{evidence.content}</div>
          <div className="detail-meta"><span>SOURCE <b>{evidence.sourceLabel}</b></span>{evidence.occurredAt && <span>RECORDED <b>{new Date(evidence.occurredAt).toLocaleString()}</b></span>}<span>RELATED PERSONS <b>{evidence.relatedSuspects.map(s => s.name).join(', ') || 'None identified'}</b></span></div>
          <Notice/><Link className="button button-gold" to={`/case/${caseId}`}>Return to evidence room <ArrowUpRight size={15}/></Link>
        </div>
      </div>
    </main>}
  </div>;
}
