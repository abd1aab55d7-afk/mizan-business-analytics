import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import {
  ActiveTab,
  Language,
  Currency,
  DateFilter,
  StandardTransaction,
  InventoryItem,
  BusinessAlert,
  OverviewMetrics,
} from '../types/data';
import {
  SYNTHETIC_TRANSACTIONS,
  SAMPLE_INVENTORY,
} from '../engine/sampleData';
import {
  calculateOverviewMetrics,
  generateBusinessAlerts,
  filterTransactionsByDate,
} from '../engine/calculations';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  allTransactions: StandardTransaction[];
  filteredTransactions: StandardTransaction[];
  previousPeriodTransactions: StandardTransaction[];
  inventory: InventoryItem[];
  isDemoData: boolean;

  overviewMetrics: OverviewMetrics;
  alerts: BusinessAlert[];
  dismissedAlertIds: Set<string>;
  dismissAlert: (id: string) => void;

  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  isAlertsDrawerOpen: boolean;
  setIsAlertsDrawerOpen: (open: boolean) => void;

  loadImportedData: (items: StandardTransaction[], inventoryItems?: InventoryItem[]) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [language, setLanguage] = useState<Language>('ar');
  const [currency, setCurrency] = useState<Currency>('EGP');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoData, setIsDemoData] = useState(true);

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    preset: 'thisQuarter',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
  });

  const [allTransactions, setAllTransactions] = useState<StandardTransaction[]>(() => {
    const saved = localStorage.getItem('business_insight_txs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached transactions', e);
      }
    }
    return SYNTHETIC_TRANSACTIONS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('business_insight_inv');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return SAMPLE_INVENTORY;
  });

  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);

  // Sync RTL / LTR document attributes when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Handle Preset Date Filter changes
  const { currentTransactions, previousTransactions } = useMemo(() => {
    let start = dateFilter.startDate;
    let end = dateFilter.endDate;

    if (dateFilter.preset === 'today') {
      start = '2026-10-28';
      end = '2026-10-28';
    } else if (dateFilter.preset === 'last7') {
      start = '2026-10-21';
      end = '2026-10-28';
    } else if (dateFilter.preset === 'last30') {
      start = '2026-10-01';
      end = '2026-10-31';
    } else if (dateFilter.preset === 'thisQuarter') {
      start = '2026-10-01';
      end = '2026-10-31';
    } else if (dateFilter.preset === 'all') {
      start = undefined;
      end = undefined;
    }

    const current = filterTransactionsByDate(allTransactions, start, end);

    // Equivalent previous period (e.g. September 2026 if current is October 2026)
    let prevStart: string | undefined = '2026-09-01';
    let prevEnd: string | undefined = '2026-09-30';

    if (!start && !end) {
      prevStart = undefined;
      prevEnd = undefined;
    }

    const previous = filterTransactionsByDate(allTransactions, prevStart, prevEnd);

    return {
      currentTransactions: current,
      previousTransactions: previous,
    };
  }, [allTransactions, dateFilter]);

  // Apply search query filter if user typed in top search bar
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return currentTransactions;
    const q = searchQuery.toLowerCase().trim();
    return currentTransactions.filter(
      (t) =>
        (t.productName && t.productName.toLowerCase().includes(q)) ||
        (t.customerName && t.customerName.toLowerCase().includes(q)) ||
        (t.orderId && t.orderId.toLowerCase().includes(q)) ||
        (t.region && t.region.toLowerCase().includes(q))
    );
  }, [currentTransactions, searchQuery]);

  // Overview calculated metrics
  const overviewMetrics = useMemo(() => {
    return calculateOverviewMetrics(
      filteredTransactions,
      previousTransactions,
      currency,
      language
    );
  }, [filteredTransactions, previousTransactions, currency, language]);

  // Evidence-based alerts
  const alerts = useMemo(() => {
    return generateBusinessAlerts(filteredTransactions, previousTransactions, currency).filter(
      (a) => !dismissedAlertIds.has(a.id)
    );
  }, [filteredTransactions, previousTransactions, currency, dismissedAlertIds]);

  const dismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => new Set(prev).add(id));
  };

  const loadImportedData = (
    items: StandardTransaction[],
    inventoryItems?: InventoryItem[]
  ) => {
    setAllTransactions(items);
    if (inventoryItems && inventoryItems.length > 0) {
      setInventory(inventoryItems);
      localStorage.setItem('business_insight_inv', JSON.stringify(inventoryItems));
    }
    setIsDemoData(false);
    localStorage.setItem('business_insight_txs', JSON.stringify(items));
    setActiveTab('overview');
  };

  const resetToDemoData = () => {
    localStorage.removeItem('business_insight_txs');
    localStorage.removeItem('business_insight_inv');
    setAllTransactions(SYNTHETIC_TRANSACTIONS);
    setInventory(SAMPLE_INVENTORY);
    setIsDemoData(true);
    setDismissedAlertIds(new Set());
    setActiveTab('overview');
  };

  const clearAllData = () => {
    localStorage.removeItem('business_insight_txs');
    localStorage.removeItem('business_insight_inv');
    setAllTransactions([]);
    setInventory([]);
    setIsDemoData(false);
  };

  const refreshData = () => {
    // Quick touch trigger
    setAllTransactions([...allTransactions]);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        currency,
        setCurrency,
        dateFilter,
        setDateFilter,
        searchQuery,
        setSearchQuery,
        allTransactions,
        filteredTransactions,
        previousPeriodTransactions: previousTransactions,
        inventory,
        isDemoData,
        overviewMetrics,
        alerts,
        dismissedAlertIds,
        dismissAlert,
        isMobileNavOpen,
        setIsMobileNavOpen,
        isAlertsDrawerOpen,
        setIsAlertsDrawerOpen,
        loadImportedData,
        resetToDemoData,
        clearAllData,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
