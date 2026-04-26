import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LoginScreen from './components/LoginScreen/LoginScreen';
import HomeScreen from './components/HomeScreen/HomeScreen';
import ScannerScreen from './components/ScannerScreen/ScannerScreen';
import ARScreen from './components/ARScreen/ARScreen';
import InstructionsScreen from './components/InstructionsScreen/InstructionsScreen';
import SavedScreen from './components/SavedScreen/SavedScreen';
import HowItWorksScreen from './components/HowItWorksScreen/HowItWorksScreen';
import ProfileScreen from './components/ProfileScreen/ProfileScreen';
import { useSavedIdeas } from './hooks/useSavedIdeas';
import { api } from './utils/api';
import './index.css';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, x: 40, scale: 0.98 },
  in:      { opacity: 1, x: 0,  scale: 1 },
  out:     { opacity: 0, x: -40, scale: 0.98 },
};

const slideUpVariants = {
  initial: { opacity: 0, y: 60, scale: 0.97 },
  in:      { opacity: 1, y: 0,  scale: 1 },
  out:     { opacity: 0, y: -40, scale: 0.98 },
};

const pageTransition = {
  type: 'tween',
  ease: [0.4, 0, 0.2, 1],
  duration: 0.35,
};

const SCREENS = {
  LOGIN: 'login',
  HOME: 'home',
  SCANNER: 'scanner',
  AR: 'ar',
  INSTRUCTIONS: 'instructions',
  SAVED: 'saved',
  HOW_IT_WORKS: 'howItWorks',
  PROFILE: 'profile',
};

// Toast notification
const Toast = ({ message }) => (
  <motion.div
    className="toast"
    initial={{ opacity: 0, y: 60, scale: 0.9, x: "-50%" }}
    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
    exit={{ opacity: 0, y: 40, scale: 0.9, x: "-50%" }}
    transition={{ type: 'spring', damping: 20 }}
  >
    {message}
  </motion.div>
);

function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState(SCREENS.LOGIN);
  const [loading, setLoading] = useState(true);
  const [detectionData, setDetectionData] = useState(null);
  const [currentIdea, setCurrentIdea] = useState(null);
  const [toast, setToast] = useState(null);
  const { savedIdeas, saveIdea, removeIdea, isIdeaSaved } = useSavedIdeas();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const data = await api.getMe();
        if (data?.user) {
          setUser(data.user);
          setScreen(SCREENS.HOME);
        }
      } catch {
        // No valid session
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // Show toast
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  // Navigation
  const navigate = useCallback((screenName) => {
    setScreen(screenName);
  }, []);

  // Auth
  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setScreen(SCREENS.HOME);
  }, []);

  // Logout
  const handleLogout = useCallback(() => {
    api.logout();
    setUser(null);
    setScreen(SCREENS.LOGIN);
  }, []);

  // Update user profile
  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    showToast('Profile updated!');
  }, [showToast]);

  // Detection complete → go to AR
  const handleDetect = useCallback((data) => {
    setDetectionData(data);
    setScreen(SCREENS.AR);
  }, []);

  // View steps
  const handleViewSteps = useCallback((ideaData) => {
    setCurrentIdea(ideaData);
    setScreen(SCREENS.INSTRUCTIONS);
  }, []);

  // Save an idea
  const handleSave = useCallback((idea, objectData) => {
    const wasNew = saveIdea(idea, objectData);
    showToast(wasNew ? 'Idea saved!' : 'Already saved!');
  }, [saveIdea, showToast]);

  // Delete from saved
  const handleRemove = useCallback((ideaId) => {
    removeIdea(ideaId);
    showToast('Idea removed');
  }, [removeIdea, showToast]);

  // Show loading while checking session
  if (loading) {
    return (
      <div className="app-root">
        <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="splash-logo" style={{ width: 80, height: 80 }}>
            <img src="/icon.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>
      </div>
    );
  }

  // Render active screen
  const renderScreen = () => {
    switch (screen) {
      case SCREENS.LOGIN:
        return (
          <motion.div key="login" className="screen-wrapper" variants={slideUpVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <LoginScreen onLogin={handleLogin} />
          </motion.div>
        );

      case SCREENS.HOME:
        return (
          <motion.div key="home" className="screen-wrapper" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <HomeScreen
              user={user}
              savedCount={savedIdeas.length}
              onStartScan={() => navigate(SCREENS.SCANNER)}
              onSavedIdeas={() => navigate(SCREENS.SAVED)}
              onHowItWorks={() => navigate(SCREENS.HOW_IT_WORKS)}
              onProfile={() => navigate(SCREENS.PROFILE)}
            />
          </motion.div>
        );

      case SCREENS.SCANNER:
        return (
          <motion.div key="scanner" className="screen-wrapper" variants={slideUpVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ScannerScreen onBack={() => navigate(SCREENS.HOME)} onDetect={handleDetect} />
          </motion.div>
        );

      case SCREENS.AR:
        return (
          <motion.div key="ar" className="screen-wrapper" variants={slideUpVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ARScreen detectionData={detectionData} onBack={() => navigate(SCREENS.SCANNER)} onViewSteps={handleViewSteps} onSave={handleSave} isSaved={isIdeaSaved} />
          </motion.div>
        );

      case SCREENS.INSTRUCTIONS:
        return (
          <motion.div key="instructions" className="screen-wrapper" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <InstructionsScreen ideaData={currentIdea} onBack={() => navigate(detectionData ? SCREENS.AR : SCREENS.SAVED)} onSave={handleSave} isSaved={isIdeaSaved} />
          </motion.div>
        );

      case SCREENS.SAVED:
        return (
          <motion.div key="saved" className="screen-wrapper" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <SavedScreen onBack={() => navigate(SCREENS.HOME)} savedIdeas={savedIdeas} removeIdea={handleRemove} onViewSteps={handleViewSteps} />
          </motion.div>
        );

      case SCREENS.HOW_IT_WORKS:
        return (
          <motion.div key="howItWorks" className="screen-wrapper" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <HowItWorksScreen onBack={() => navigate(SCREENS.HOME)} onStartScanning={() => navigate(SCREENS.SCANNER)} />
          </motion.div>
        );

      case SCREENS.PROFILE:
        return (
          <motion.div key="profile" className="screen-wrapper" variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
            <ProfileScreen user={user} onBack={() => navigate(SCREENS.HOME)} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      <div className="app-container">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>

        <AnimatePresence>
          {toast && <Toast message={toast} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
