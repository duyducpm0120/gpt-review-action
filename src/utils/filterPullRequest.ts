import { ExcludedPatterns } from "../const";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export const filterPullRequestFiles = (
  pullRequestFiles: RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"]
) => {
  console.log(
    "PullRequestFile names before removed all file paths matching excluded patterns: /n",
    pullRequestFiles.map((file) => file.filename) // Print the file names
  );
  const filteredFiles = pullRequestFiles.filter((file) => {
    return !ExcludedPatterns.some((pattern) => {
      console.log("Skipping file:", file.filename);
      return file.filename.includes(pattern);
    });
  });
  console.log(
    "PullRequestFile names after removed all file paths matching excluded patterns: /n",
    filteredFiles.map((file) => file.filename) // Print the file names
  );
  return filteredFiles;
};
