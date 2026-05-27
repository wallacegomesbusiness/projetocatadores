import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CatadoresPage } from './pages/Catadores';
import { ColetasPage } from './pages/Coletas';
import { MateriaisPage } from './pages/Materiais';
import { PagamentosPage } from './pages/Pagamentos';
import { RelatoriosPage } from './pages/Relatorios';
import { Login } from './pages/Login';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('@ReciclaOrg:token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="catadores" element={<CatadoresPage />} />
            <Route path="materiais" element={<MateriaisPage />} />
            <Route path="coletas" element={<ColetasPage />} />
            <Route path="pagamentos" element={<PagamentosPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
