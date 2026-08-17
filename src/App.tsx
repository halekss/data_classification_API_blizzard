import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { RosterProvider } from '@/context/RosterContext';
import { Layout } from '@/layout/Layout';
import { PageTransition } from '@/layout/PageTransition';
import { OverviewPage } from '@/pages/Overview';
import { ClassesPage } from '@/pages/Classes';
import { RosterPage } from '@/pages/Roster';
import { MetiersPage } from '@/pages/Metiers';
import { BuildsPage } from '@/pages/Builds';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<PageTransition><OverviewPage /></PageTransition>} />
      <Route path="/classes" element={<PageTransition><ClassesPage /></PageTransition>} />
      <Route path="/roster" element={<PageTransition><RosterPage /></PageTransition>} />
      <Route path="/metiers" element={<PageTransition><MetiersPage /></PageTransition>} />
      <Route path="/builds" element={<PageTransition><BuildsPage /></PageTransition>} />
    </Routes>
  );
}

export default function App() {
  return (
    <RosterProvider>
      <BrowserRouter basename="/data_classification_API_blizzard">
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </BrowserRouter>
    </RosterProvider>
  );
}
