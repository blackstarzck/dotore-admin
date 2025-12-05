import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Loadable from './components/Loadable';
import DashboardLayout from './layout/Dashboard';
import { getAuthToken } from './utils/storage';
import { ColorModeProvider } from './context/ColorModeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { SendingStatusProvider } from './context/SendingStatusContext';
import ThemeCustomization from './themes';

// Lazy load pages
const LoginPage = Loadable(lazy(() => import('./pages/LoginPage')));
const InquiryListPage = Loadable(lazy(() => import('./pages/InquiryListPage')));
const InquiryAnalysisPage = Loadable(lazy(() => import('./pages/InquiryAnalysisPage')));
const AutoMailPage = Loadable(lazy(() => import('./pages/AutoMailPage')));
const AutoMailTemplatePage = Loadable(lazy(() => import('./pages/AutoMailTemplatePage')));
const ManualMailPage = Loadable(lazy(() => import('./pages/ManualMailPage')));
const ManualMailTemplatePage = Loadable(lazy(() => import('./pages/ManualMailTemplatePage')));
const MailGroupPage = Loadable(lazy(() => import('./pages/MailGroupPage')));
const MailHistoryPage = Loadable(lazy(() => import('./pages/MailHistoryPage')));
const MemberManagementPage = Loadable(lazy(() => import('./pages/MemberManagementPage')));

// 타입스크립트 확장을 통해 커스텀 팔레트 속성 정의
declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string;
    darker?: string;
    100?: string;
    200?: string;
    400?: string;
    700?: string;
    900?: string;
    A100?: string;
    A200?: string;
    A300?: string;
  }
  interface SimplePaletteColorOptions {
    lighter?: string;
    darker?: string;
    100?: string;
    200?: string;
    400?: string;
    700?: string;
    900?: string;
    A100?: string;
    A200?: string;
    A300?: string;
  }
  interface Theme {
    vars: {
      palette: import('@mui/material/styles').Palette;
      customShadows: {
        [key: string]: string;
      };
    };
  }
}

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getAuthToken();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeCustomization>
      <ColorModeProvider>
        <LanguageProvider>
          <SnackbarProvider>
            <Router>
              <SendingStatusProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <DashboardLayout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<InquiryListPage />} />
                    <Route path="analysis" element={<InquiryAnalysisPage />} />
                    <Route path="auto-mail" element={<AutoMailPage />} />
                    <Route path="auto-mail/:groupId/:templateId" element={<AutoMailTemplatePage />} />
                    <Route path="manual-mail" element={<ManualMailPage />} />
                    <Route path="manual-mail/:groupId/:templateId" element={<ManualMailTemplatePage />} />
                    <Route path="mail-group" element={<MailGroupPage />} />
                    <Route path="mail-history" element={<MailHistoryPage />} />
                    <Route path="member" element={<MemberManagementPage />} />
                  </Route>
                </Routes>
              </SendingStatusProvider>
            </Router>
          </SnackbarProvider>
        </LanguageProvider>
      </ColorModeProvider>
    </ThemeCustomization>
  );
}

export default App;
