import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageContent } from '../components/common/PageContainer';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { useProfileStore } from '../stores/profileStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useProgressStore } from '../stores/progressStore';

export function ProfileSelect() {
  const navigate = useNavigate();
  const { profiles, loadProfiles, setCurrentProfile } = useProfileStore();
  const startSession = useSettingsStore(state => state.startSession);
  const loadProgress = useProgressStore(state => state.loadProgress);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleSelectProfile = async (profileId: string) => {
    await setCurrentProfile(profileId);
    await loadProgress(profileId);
    startSession();
    navigate('/menu');
  };

  const handleAddProfile = () => {
    navigate('/parent/pin?redirect=create-profile');
  };

  const handleParentAccess = () => {
    navigate('/parent/pin?redirect=dashboard');
  };

  return (
    <PageContainer>
      <PageContent center className="gap-8">
        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Who's Playing?</h1>
          <p className="text-[var(--color-text-secondary)]">Select your explorer</p>
        </motion.div>

        {/* Profiles Grid */}
        <div className="w-full max-w-md">
          {profiles.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {profiles.map((profile, index) => (
                <motion.button
                  key={profile.id}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  onClick={() => handleSelectProfile(profile.id)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar avatarId={profile.avatarId} size="xl" />
                  <span className="text-lg font-semibold text-white">{profile.name}</span>
                  <span className="text-sm text-[var(--color-text-secondary)] capitalize">
                    {profile.theme === 'sparkle' ? '✨ Sparkle' : '🧱 Lego'} Theme
                  </span>
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-[var(--color-text-secondary)] mb-4">
                No explorers yet! Let's create one.
              </p>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <motion.div
          className="w-full max-w-md space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button fullWidth variant="primary" onClick={handleAddProfile}>
            ➕ Add Explorer
          </Button>

          <Button fullWidth variant="ghost" onClick={handleParentAccess}>
            👨‍👩‍👧‍👦 Parent Dashboard
          </Button>
        </motion.div>
      </PageContent>
    </PageContainer>
  );
}
