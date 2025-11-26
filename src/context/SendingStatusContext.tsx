import React, { createContext, useContext, useState, useCallback } from 'react';
import SendingStatusSnackbar, { SendingStatus } from '../components/SendingStatusSnackbar';

export interface SendingStatistics {
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
}

interface SendingStatusContextType {
  showSendingStatus: (historyId?: string) => void;
  updateSendingStatus: (status: SendingStatus, historyId?: string, statistics?: SendingStatistics) => void;
  closeSendingStatus: () => void;
  getHistoryId: () => string | null;
  getStatistics: () => SendingStatistics | null;
}

const SendingStatusContext = createContext<SendingStatusContextType | undefined>(undefined);

export const useSendingStatus = () => {
  const context = useContext(SendingStatusContext);
  if (!context) {
    throw new Error('useSendingStatus must be used within a SendingStatusProvider');
  }
  return context;
};

export const SendingStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<SendingStatus>(null);
  const [open, setOpen] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<SendingStatistics | null>(null);

  const showSendingStatus = useCallback((newHistoryId?: string) => {
    setHistoryId(newHistoryId || null);
    setStatus('request');
    setOpen(true);
    setStatistics(null);
  }, []);

  const updateSendingStatus = useCallback((newStatus: SendingStatus, newHistoryId?: string, newStatistics?: SendingStatistics) => {
    setStatus(newStatus);
    if (newHistoryId !== undefined) {
      setHistoryId(newHistoryId || null);
    }
    if (newStatistics !== undefined) {
      setStatistics(newStatistics || null);
    }
    if (newStatus === null) {
      setOpen(false);
    }
  }, []);

  const closeSendingStatus = useCallback(() => {
    if (status !== 'sending' && status !== 'failed') {
      setOpen(false);
      setStatus(null);
      setHistoryId(null);
      setStatistics(null);
    } else if (status === 'failed') {
      // failed 상태에서는 닫기 버튼으로 닫을 수 있음
      setOpen(false);
      setStatus(null);
      setHistoryId(null);
      setStatistics(null);
    }
  }, [status]);

  const getHistoryId = useCallback(() => {
    return historyId;
  }, [historyId]);

  const getStatistics = useCallback(() => {
    return statistics;
  }, [statistics]);

  const handleViewHistory = useCallback(() => {
    // historyId는 컴포넌트에서 가져와서 사용
    return historyId;
  }, [historyId]);

  return (
    <SendingStatusContext.Provider value={{ showSendingStatus, updateSendingStatus, closeSendingStatus, getHistoryId, getStatistics }}>
      {children}
      <SendingStatusSnackbar
        open={open}
        status={status}
        statistics={statistics}
        onViewHistory={status === 'completed' ? handleViewHistory : undefined}
        onClose={closeSendingStatus}
      />
    </SendingStatusContext.Provider>
  );
};
