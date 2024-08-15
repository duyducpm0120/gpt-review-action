import axios from "axios";
import { GitHub } from "@actions/github/lib/utils";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { isLocalTesting } from "../config";

export const postFileReview = async (
    fileDiff: { fileName: string; content: string },
    apiKey: string,
    octokit: InstanceType<typeof GitHub>,
    prompt: string,
    model: string
) => {
    const { fileName, content } = fileDiff;
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
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

        // Retrieve the list of commits to get the latest commit ID
        const { data: commits } = await octokit.rest.pulls.listCommits({
            owner: repoOwner,
            repo: repoName,
            pull_number: pullRequestNumber,
        });

        const latestCommit = commits[commits.length - 1];
        const commitId = latestCommit.sha;

        const pullRequestFiles = await octokit.rest.pulls.listFiles({
            owner: repoOwner,
            repo: repoName,
            pull_number: pullRequestNumber,
        });

        //console.log('PullRequestFiles: /n', pullRequestFiles);

        const matchingFile = pullRequestFiles.data.find((file) =>
            file.filename.endsWith(fileName)
        );
        
        //console.log('MatchingFile: /n', matchingFile);

        if (matchingFile) {
            await octokit.rest.pulls.createReviewComment({
                owner: repoOwner,
                repo: repoName,
                pull_number: pullRequestNumber,
                body: review,
                commit_id: commitId, // Use the latest commit ID
                path: matchingFile.filename,
                position: 1, // Adjust the position according to your logic
            });
        } else {
            core.warning(`File ${fileName} not found in the pull request.`);
        }
    } catch (error) {
        //console.log("Error in postFileReview: ", error);
        throw error;
    }
};
