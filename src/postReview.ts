import axios from "axios";
import { GitHub } from "@actions/github/lib/utils";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { isLocalTesting } from "../config";
import { OpenAIUrls } from "./const";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";

export const postFileReview = async (
  fileDiff: { fileName: string; content: string },
  apiKey: string,
  octokit: InstanceType<typeof GitHub>,
  prompt: string,
  model: string,
  commitId: string,
  pullRequestFiles: RestEndpointMethodTypes["pulls"]["listFiles"]["response"]["data"]
) => {
  const { fileName, content } = fileDiff;
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
      console.log(
        `Posting review for file ${fileName} with content: ${review}`
      );
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
