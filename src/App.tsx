import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InquiryListPage from './pages/InquiryListPage';
import InquiryAnalysisPage from './pages/InquiryAnalysisPage';
import AutoMailPage from './pages/AutoMailPage';
import ManualMailPage from './pages/ManualMailPage';
import MailTemplatePage from './pages/MailTemplatePage';
import MailGroupPage from './pages/MailGroupPage';
import MailHistoryPage from './pages/MailHistoryPage';
import Layout from './components/Layout';
import { getAuthToken } from './utils/storage';
import { ColorModeProvider } from './context/ColorModeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { SendingStatusProvider } from './context/SendingStatusContext';
import ThemeCustomization from './themes';

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
  interface Palette {
    grey: {
      [key: string | number]: string;
    };
  }
  interface Theme {
    vars: {
      palette: Palette;
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
                        <Layout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<InquiryListPage />} />
                    <Route path="analysis" element={<InquiryAnalysisPage />} />
                    <Route path="auto-mail" element={<AutoMailPage />} />
                    <Route path="auto-mail/:groupId/:templateId" element={<MailTemplatePage />} />
                    <Route path="manual-mail" element={<ManualMailPage />} />
                    <Route path="manual-mail/:groupId/:templateId" element={<MailTemplatePage />} />
                    <Route path="mail-group" element={<MailGroupPage />} />
                    <Route path="mail-history" element={<MailHistoryPage />} />
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
