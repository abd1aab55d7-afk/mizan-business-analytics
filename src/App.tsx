/**
 * Business Insight AI - Main Application Component
 * Architecture for Egyptian Small & Medium Distributors
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { NotificationDrawer } from './components/layout/NotificationDrawer';
import { OverviewView } from './components/views/OverviewView';
import { SalesView } from './components/views/SalesView';
import { ProductsView } from './components/views/ProductsView';
import { CustomersView } from './components/views/CustomersView';
import { InventoryView } from './components/views/InventoryView';
import { DataImportView } from './components/views/DataImportView';
import { ReportsView } from './components/views/ReportsView';
import { AiAnalystView } from './components/views/AiAnalystView';
import { SettingsView } from './components/views/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <Header />

        <main className="main-viewport" role="main">
          {activeTab === 'overview' && <OverviewView />}
          {activeTab === 'sales' && <SalesView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'import' && <DataImportView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'analyst' && <AiAnalystView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Slide-over Notifications & Alerts Drawer */}
      <NotificationDrawer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
