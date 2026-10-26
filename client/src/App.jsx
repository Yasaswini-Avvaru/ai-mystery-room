import { Routes, Route } from 'react-router-dom';
import HomePage from './routes/HomePage.jsx';
import CreateMysteryPage from './routes/CreateMysteryPage.jsx';
import InvestigationPage from './routes/InvestigationPage.jsx';
import EvidencePage from './routes/EvidencePage.jsx';
import AccusationPage from './routes/AccusationPage.jsx';
import SolutionPage from './routes/SolutionPage.jsx';

export default function App() {
  return <Routes><Route path="/" element={<HomePage />} /><Route path="/create" element={<CreateMysteryPage />} /><Route path="/case/:caseId" element={<InvestigationPage />} /><Route path="/case/:caseId/evidence/:evidenceId" element={<EvidencePage />} /><Route path="/case/:caseId/accuse" element={<AccusationPage />} /><Route path="/case/:caseId/solution" element={<SolutionPage />} /><Route path="*" element={<main className="center-state"><h1>Page not found</h1><a className="button" href="/">Return to case files</a></main>} /></Routes>;
}
