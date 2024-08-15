export const splitDiffByFile = (
  diff: string
): { fileName: string; content: string }[] => {
  // Split the diff content by each file change
  const fileDiffs = diff.split(/^diff --git a\//gm).filter(Boolean);

  return fileDiffs.map((d) => {
    // Extract the file name using a regular expression
    const fileNameMatch = d.match(/^[^\s]+/);
    let fileName = fileNameMatch ? fileNameMatch[0] : "unknown";

    // Remove the "a/" or "b/" prefix from the filename
    fileName = fileName.replace(/^a\//, "").replace(/^b\//, "");

    const result = {
      fileName,
      content: `diff --git a/${d.trim()}`,
    };

    return result;
  });
};

