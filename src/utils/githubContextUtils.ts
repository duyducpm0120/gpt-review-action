import { GitHub } from "@actions/github/lib/utils";
import * as github from "@actions/github";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export const getAllPullRequestFiles = async (
  octokit: InstanceType<typeof GitHub>
): Promise<RestEndpointMethodTypes["pulls"]["listFiles"]["response"]> => {
  const context = github.context;

  const pullRequestNumber = context.issue.number;
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;

  const pullRequestFiles = await octokit.rest.pulls.listFiles({
    owner: repoOwner,
    repo: repoName,
    pull_number: pullRequestNumber,
  });
  return pullRequestFiles;
};

export const getAllPullRequestCommits = async (
  octokit: InstanceType<typeof GitHub>
) => {
  const context = github.context;

  const pullRequestNumber = context.issue.number;
  const repoOwner = context.repo.owner;
  const repoName = context.repo.repo;

  const commits = await octokit.rest.pulls.listCommits({
    owner: repoOwner,
    repo: repoName,
    pull_number: pullRequestNumber,
  });
  return commits.data;
};

export const getLatestCommitId = async (
  octokit: InstanceType<typeof GitHub>
) => {
  const commits = await getAllPullRequestCommits(octokit);
  const latestCommit = commits[commits.length - 1];
  return latestCommit.sha;
};
