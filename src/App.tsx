import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './themes/themeContext';

// Pages
import { Splash } from './pages/Splash';
import { ProfileSelect } from './pages/ProfileSelect';
import { ProfileCreate } from './pages/ProfileCreate';
import { MainMenu } from './pages/MainMenu';
import { Adventure } from './pages/Adventure';
import { Learning } from './pages/Learning';
import { Quiz } from './pages/Quiz';
import { Results } from './pages/Results';
import { PinEntry } from './pages/parent/PinEntry';
import { ParentDashboard } from './pages/parent/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Routes>
          {/* Splash and onboarding */}
          <Route path="/" element={<Splash />} />
          <Route path="/profiles" element={<ProfileSelect />} />
          <Route path="/create-profile" element={<ProfileCreate />} />

          {/* Main app */}
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/adventure" element={<Adventure />} />
          <Route path="/learning/:tableNumber" element={<Learning />} />
          <Route path="/quiz/:tableNumber" element={<Quiz />} />
          <Route path="/results/:attemptId" element={<Results />} />

          {/* Parent section */}
          <Route path="/parent/pin" element={<PinEntry />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
