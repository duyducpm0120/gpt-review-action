import axios from "axios";
import { GitHub } from "@actions/github/lib/utils";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { isLocalTesting } from "../config";
import { ExcludedPatterns, OpenAIUrls } from "./const";

export const shouldSkipFileReview = (fileName: string): boolean => {
  return ExcludedPatterns.some((pattern) => fileName.includes(pattern));
};

export const postFileReview = async (
  fileDiff: { fileName: string; content: string },
  apiKey: string,
  octokit: InstanceType<typeof GitHub>,
  prompt: string,
  model: string,
  commitId: string,
  pullRequestFiles: { filename: string }[]
) => {
  const { fileName, content } = fileDiff;

  // Use the helper function to determine if the file should be skipped
  if (shouldSkipFileReview(fileName)) {
    console.log(`Skipping review for file ${fileName}`);
    return;
  }

  try {
    const response = await axios.post(
      OpenAIUrls.completion,
      {
        model: model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: String(content) },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const review = response.data.choices[0].message.content;

    if (isLocalTesting) {
      // Print the review to the console
      console.log(`Review for file ${fileName}: ${review}`);
      // Skip the rest of the function
      return;
    }

    const context = github.context;

    const pullRequestNumber = context.issue.number;
    const repoOwner = context.repo.owner;
    const repoName = context.repo.repo;

    const matchingFile = pullRequestFiles.find((file) =>
      file.filename.endsWith(fileName)
    );

    if (matchingFile) {
      await octokit.rest.pulls.createReviewComment({
        owner: repoOwner,
        repo: repoName,
        pull_number: pullRequestNumber,
        body: review,
        commit_id: commitId, // Use the latest commit ID
        path: matchingFile.filename,
        subject_type: "file",
      });
    } else {
      core.warning(`File ${fileName} not found in the pull request.`);
    }
  } catch (error) {
    console.log("Error in postFileReview: ", error);
    throw error;
  }
};
