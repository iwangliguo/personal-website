import { useState } from 'react';

interface UseEntryNavOptions {
  total: number;
  initial?: number;
}

export function useEntryNav({ total, initial = 0 }: UseEntryNavOptions) {
  const [currentIndex, setCurrentIndex] = useState(initial);

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, total - 1)));
  };

  const goPrev = () => goTo(currentIndex - 1);
  const goNext = () => goTo(currentIndex + 1);

  return {
    currentIndex,
    goTo,
    goPrev,
    goNext,
    hasPrev: currentIndex > 0,
    hasNext: currentIndex < total - 1,
  };
}
