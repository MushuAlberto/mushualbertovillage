// utils/time.ts

/**
 * Formats a total number of seconds into a MM:SS string.
 * @param totalSeconds The total seconds to format.
 * @returns A string in MM:SS format.
 */
export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');
  return `${paddedMinutes}:${paddedSeconds}`;
};
