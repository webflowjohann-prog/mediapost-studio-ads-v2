import React, { useState } from 'react';
import type { AppView } from './types';
import { MissionHub } from './components/MissionHub';
import { QuickAdsStudio } from './components/studio/QuickAdsStudio';
import { AvatarPlatform } from './components/avatar/AvatarPlatform';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('hub');

  const navigateToMission = (missionId: string) => {
    if (missionId === 'quick_ads') setCurrentView('quick_ads');
    else if (missionId === 'avatar_platform') setCurrentView('avatar_platform');
  };

  const navigateBack = () => setCurrentView('hub');

  if (currentView === 'quick_ads') {
    return <QuickAdsStudio onBack={navigateBack} />;
  }

  if (currentView === 'avatar_platform') {
    return <AvatarPlatform onBack={navigateBack} />;
  }

  return <MissionHub onSelectMission={navigateToMission} />;
};

export default App;
