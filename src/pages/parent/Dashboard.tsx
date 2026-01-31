import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader, PageContent } from '../../components/common/PageContainer';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { useProfileStore } from '../../stores/profileStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTableProgress, getStreak, getStarBalance } from '../../db/database';
import type { Profile, TableProgress, Streak, StarBalance } from '../../types';

interface ProfileStats {
  profile: Profile;
  progress: TableProgress[];
  streak: Streak | null;
  stars: StarBalance | null;
}

export function ParentDashboard() {
  const navigate = useNavigate();
  const { profiles, loadProfiles, removeProfile } = useProfileStore();
  const { isPinVerified, clearPinVerification } = useSettingsStore();
  const [profileStats, setProfileStats] = useState<ProfileStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPinVerified) {
      navigate('/parent/pin?redirect=dashboard', { replace: true });
      return;
    }

    loadProfiles();
  }, [isPinVerified, navigate, loadProfiles]);

  useEffect(() => {
    const loadStats = async () => {
      const stats: ProfileStats[] = [];

      for (const profile of profiles) {
        const [progress, streak, stars] = await Promise.all([
          getTableProgress(profile.id),
          getStreak(profile.id),
          getStarBalance(profile.id),
        ]);

        stats.push({
          profile,
          progress,
          streak: streak || null,
          stars: stars || null,
        });
      }

      setProfileStats(stats);
      setLoading(false);
    };

    if (profiles.length > 0) {
      loadStats();
    } else {
      setLoading(false);
    }
  }, [profiles]);

  const handleBack = () => {
    clearPinVerification();
    navigate('/profiles');
  };

  const getMasteredCount = (progress: TableProgress[]) => {
    return progress.filter(p => p.status === 'mastered').length;
  };

  const getInProgressCount = (progress: TableProgress[]) => {
    return progress.filter(p => p.status === 'learning' || p.status === 'practiced').length;
  };

  const handleDeleteProfile = async (profileId: string, profileName: string) => {
    if (confirm(`Are you sure you want to delete ${profileName}'s profile? This cannot be undone.`)) {
      await removeProfile(profileId);
    }
  };

  return (
    <PageContainer showStars={false}>
      <PageHeader title="Parent Dashboard" onBack={handleBack} />
      <PageContent className="gap-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[var(--color-text-secondary)]">Loading...</div>
          </div>
        ) : profileStats.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <p className="text-[var(--color-text-secondary)]">No profiles yet.</p>
            <Button onClick={() => navigate('/create-profile')}>
              Add Explorer
            </Button>
          </div>
        ) : (
          <>
            {/* Profile Overview Cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Explorers</h2>

              {profileStats.map(({ profile, progress, streak, stars }, index) => (
                <motion.div
                  key={profile.id}
                  className="p-4 rounded-2xl bg-white/5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-4">
                    <Avatar avatarId={profile.avatarId} size="lg" />

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{profile.name}</h3>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="text-center p-2 rounded-lg bg-white/5">
                          <div className="text-2xl font-bold text-green-400">
                            {getMasteredCount(progress)}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">Mastered</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-white/5">
                          <div className="text-2xl font-bold text-yellow-400">
                            {getInProgressCount(progress)}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">Learning</div>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-white/5">
                          <div className="text-2xl font-bold text-orange-400">
                            {streak?.currentStreak || 0}
                          </div>
                          <div className="text-xs text-[var(--color-text-secondary)]">Day Streak</div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-2 mt-3 text-sm text-[var(--color-text-secondary)]">
                        <span>⭐ {stars?.totalStars || 0} stars</span>
                        <span>•</span>
                        <span className="capitalize">{profile.theme} theme</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => navigate(`/parent/child/${profile.id}`)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteProfile(profile.id, profile.name)}
                      className="text-red-400 border-red-400/30"
                    >
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 mt-auto">
              <Button fullWidth onClick={() => navigate('/create-profile')}>
                ➕ Add Explorer
              </Button>
              <Button fullWidth variant="ghost" onClick={() => navigate('/parent/settings')}>
                ⚙️ Settings
              </Button>
            </div>
          </>
        )}
      </PageContent>
    </PageContainer>
  );
}
