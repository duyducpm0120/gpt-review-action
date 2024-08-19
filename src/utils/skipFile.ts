import { ExcludedPatterns } from "src/const";

export const shouldSkipFileReview = (fileName: string): boolean => {
  return ExcludedPatterns.some((pattern) => fileName.includes(pattern));
};
