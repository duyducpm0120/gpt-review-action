import { ExcludedPatterns } from "../const";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { shouldSkipFileReview } from "./skipFile";

export const filterPullRequestFilesData = (
  pullRequestFiles: RestEndpointMethodTypes["pulls"]["listFiles"]["response"]
) => {
  console.log(
    "PullRequestFile names before removed all file paths matching excluded patterns: /n",
    pullRequestFiles.data.map((file) => file.filename) // Print the file names
  );
  const filteredFiles = pullRequestFiles.data.filter((file) => {
    const isSkipped = shouldSkipFileReview(file.filename);
    if (isSkipped) {
      console.log(`Skipping file ${file.filename}`);
    }
    return !isSkipped;
  });
  console.log(
    "PullRequestFile names after removed all file paths matching excluded patterns: /n",
    filteredFiles.map((file) => file.filename) // Print the file names
  );
  return filteredFiles;
};
