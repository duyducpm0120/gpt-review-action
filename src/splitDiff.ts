export const splitDiffByFile = (
  diff: string
): { fileName: string; content: string }[] => {
  const fileDiffs = diff.split(/^diff --git .*/gm).filter(Boolean);
  return fileDiffs.map((d) => {
    const fileNameMatch = d.match(/^--- a\/([^\s]+)/);
    const fileName = fileNameMatch ? fileNameMatch[1] : "unknown";
    return { fileName, content: `diff --git ${d.trim()}` };
  });
};
