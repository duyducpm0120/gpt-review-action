import { ExcludedPatterns } from "../const";

export const shouldSkipFileReview = (fileName: string): boolean => {
  return ExcludedPatterns.some((pattern) => fileName.includes(pattern));
};
