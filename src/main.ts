import * as core from "@actions/core";
import * as github from "@actions/github";
import { splitDiffByFile } from "./splitDiff";
import { postFileReview } from "./postReview";
import * as fs from "fs";
import { isLocalTesting } from "../config";

export type IInputData = {
  diffFilePath: string;
  openaiApiKey: string;
  githubToken: string;
  prompt: string;
  model: string;
};

const getInputData = (): IInputData => {
  const diffFilePath = core.getInput("diff-file-path");
  const openaiApiKey = core.getInput("openai-api-key");
  const githubToken = core.getInput("github-token");
  const prompt = core.getInput("prompt");
  const model = core.getInput("model");

  return { diffFilePath, openaiApiKey, githubToken, prompt, model };
};

const getTestInputData = (): IInputData => {
  return {
    diffFilePath: "test-diff.diff",
    openaiApiKey: process.env.OPENAI_API_KEY,
    githubToken: process.env.GITHUB_TOKEN,
    prompt: "You are an expert React Native Engineer working on the vHandicap mobile app. Your responsibility is to review the React Native code with a focus on functionality, ensuring the code implements the intended functionality and meets specified requirements, handling edge cases and error scenarios appropriately. Identify any exposed secrets or sensitive information within the code, and highlight areas where the code could be optimized for better performance, particularly in rendering, state management, and asynchronous operations, to minimize the risk of app crashes. Provide feedback on the overall readability of the code, including naming conventions, structure, and clarity. Verify that all error handling uses dispatchErrorPopup or handleException from the @vgcorp/vhandicap library. Please avoid reviewing the I18n languages folder or any yarn.lock and package-lock.json files, and focus strictly on the React Native codebase. Your comments should be detailed and thorough, offering solutions supported by examples and explanations to assist your teammates, with the response in Vietnamese while keeping technical terminology.",
    model: "gpt-4",
  };
};

export const processInputData = async () => {
  try {
    const data = isLocalTesting ? getTestInputData() : getInputData();
    const { diffFilePath, openaiApiKey, githubToken, prompt, model } = data;
    const diffContent = fs.readFileSync(diffFilePath, "utf-8");
    console.log('DiffContent: /n', diffContent);
    const fileDiffs = splitDiffByFile(diffContent);
    console.log('FileDiffs: /n', fileDiffs);
    const octokit = github.getOctokit(githubToken);

    for (const fileDiff of fileDiffs) {
      await postFileReview(fileDiff, openaiApiKey, octokit, prompt, model);
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
};
