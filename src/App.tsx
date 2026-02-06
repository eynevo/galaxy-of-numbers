import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './themes/themeContext';
import { BreakReminder } from './components/common/BreakReminder';
import { InstallPrompt } from './components/common/InstallPrompt';
import { ThemeDecorations } from './components/common/ThemeDecorations';
import { CharacterUnlockNotification } from './components/common/CharacterUnlockNotification';

// Pages
import { Splash } from './pages/Splash';
import { ProfileSelect } from './pages/ProfileSelect';
import { ProfileCreate } from './pages/ProfileCreate';
import { Assessment } from './pages/Assessment';
import { MainMenu } from './pages/MainMenu';
import { Adventure } from './pages/Adventure';
import { Learning } from './pages/Learning';
import { Quiz } from './pages/Quiz';
import { Results } from './pages/Results';
import { Collection } from './pages/Collection';
import { Practice } from './pages/Practice';
import { MixedReview } from './pages/MixedReview';
import { Challenge } from './pages/Challenge';
import { PinEntry } from './pages/parent/PinEntry';
import { ParentDashboard } from './pages/parent/Dashboard';
import { ParentSettings } from './pages/parent/Settings';
import { ChildDetail } from './pages/parent/ChildDetail';

function App() {
  return (
    <BrowserRouter basename="/galaxy-of-numbers">
      <ThemeProvider>
        <ThemeDecorations />
        <BreakReminder />
        <InstallPrompt />
        <CharacterUnlockNotification />
        <Routes>
          {/* Splash and onboarding */}
          <Route path="/" element={<Splash />} />
          <Route path="/profiles" element={<ProfileSelect />} />
          <Route path="/create-profile" element={<ProfileCreate />} />
          <Route path="/assessment" element={<Assessment />} />

          {/* Main app */}
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/adventure" element={<Adventure />} />
          <Route path="/learning/:tableNumber" element={<Learning />} />
          <Route path="/quiz/:tableNumber" element={<Quiz />} />
          <Route path="/results/:attemptId" element={<Results />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/mixed-review" element={<MixedReview />} />
          <Route path="/challenge" element={<Challenge />} />

          {/* Parent section */}
          <Route path="/parent/pin" element={<PinEntry />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/settings" element={<ParentSettings />} />
          <Route path="/parent/child/:id" element={<ChildDetail />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
