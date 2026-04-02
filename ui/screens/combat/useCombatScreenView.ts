import { useEffect, useRef, useState } from 'react';

import {
  getCombatScreenViews,
  getNextCombatScreenView,
  type CombatScreenViewId,
} from '../combat-screen.sections';

export function useCombatScreenView(hasActiveCombat: boolean) {
  const views = getCombatScreenViews();
  const [activeView, setActiveView] = useState<CombatScreenViewId>(() =>
    hasActiveCombat ? 'battle-feed' : views[0]
  );
  const previousHasActiveCombatRef = useRef(hasActiveCombat);

  useEffect(() => {
    setActiveView((currentView) =>
      getNextCombatScreenView({
        currentView,
        hadActiveCombat: previousHasActiveCombatRef.current,
        hasActiveCombat,
      })
    );

    previousHasActiveCombatRef.current = hasActiveCombat;
  }, [hasActiveCombat]);

  return {
    views,
    activeView,
    setActiveView,
  };
}
