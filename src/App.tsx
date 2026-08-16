import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RosterProvider } from '@/context/RosterContext';
import { Layout } from '@/layout/Layout';
import { OverviewPage } from '@/pages/Overview';
import { ClassesPage } from '@/pages/Classes';
import { RosterPage } from '@/pages/Roster';
import { MetiersPage } from '@/pages/Metiers';
import { BuildsPage } from '@/pages/Builds';

export default function App() {
  return (
    <RosterProvider>
      <BrowserRouter basename="/data_classification_API_blizzard">
        <Layout>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/roster" element={<RosterPage />} />
            <Route path="/metiers" element={<MetiersPage />} />
            <Route path="/builds" element={<BuildsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </RosterProvider>
  );
}
