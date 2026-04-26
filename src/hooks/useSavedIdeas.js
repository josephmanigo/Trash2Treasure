import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trash2treasure_saved_ideas';

export const useSavedIdeas = () => {
  const [savedIdeas, setSavedIdeas] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  const saveIdea = (idea, objectData) => {
    const entry = {
      ...idea,
      objectLabel: objectData?.label || 'Unknown',
      objectEmoji: objectData?.emoji || '♻️',
      savedAt: new Date().toISOString(),
      uniqueKey: `${idea.id}_${Date.now()}`
    };
    setSavedIdeas(prev => {
      const exists = prev.some(i => i.id === idea.id);
      if (exists) return prev;
      return [entry, ...prev];
    });
    return !savedIdeas.some(i => i.id === idea.id);
  };

  const removeIdea = (ideaId) => {
    setSavedIdeas(prev => prev.filter(i => i.id !== ideaId));
  };

  const isIdeaSaved = (ideaId) => savedIdeas.some(i => i.id === ideaId);

  return { savedIdeas, saveIdea, removeIdea, isIdeaSaved };
};
