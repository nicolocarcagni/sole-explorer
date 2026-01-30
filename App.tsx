import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BlockDetail from './pages/BlockDetail';
import TransactionDetail from './pages/TransactionDetail';
import AddressDetail from './pages/AddressDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/block/:hash" element={<BlockDetail />} />
          <Route path="/tx/:txid" element={<TransactionDetail />} />
          <Route path="/address/:address" element={<AddressDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;