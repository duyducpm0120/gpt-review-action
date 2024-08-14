import * as core from '@actions/core';
import * as github from '@actions/github';
import { splitDiffByFile } from './splitDiff';
import { postFileReview } from './postReview';
import * as fs from 'fs';
import { isLocalTesting } from './localConfig';

export type IInputData = {
    diffFilePath: string;
    openaiApiKey: string;
    githubToken: string;
    prompt: string;
    model: string;
}

const getInputData = (): IInputData => {
    const diffFilePath = core.getInput('diff-file-path');
    const openaiApiKey = core.getInput('openai-api-key');
    const githubToken = core.getInput('github-token');
    const prompt = core.getInput('prompt');
    const model = core.getInput('model');

    return { diffFilePath, openaiApiKey, githubToken, prompt, model };
}

const getTestInputData = (): IInputData => {
    return {
        diffFilePath: 'test-diff.diff',
        openaiApiKey: process.env.OPENAI_API_KEY,
        githubToken: process.env.GITHUB_TOKEN,
        prompt: 'test-prompt',
        model: 'test-model'
    }
}

export const processInputData = async () => {
    try {
        const data = isLocalTesting ? getTestInputData() : getInputData();
        const { diffFilePath, openaiApiKey, githubToken, prompt, model } = data;
        const diffContent = fs.readFileSync(diffFilePath, 'utf-8');
        const fileDiffs = splitDiffByFile(diffContent);
        const octokit = github.getOctokit(githubToken);

        for (const fileDiff of fileDiffs) {
            await postFileReview(fileDiff, openaiApiKey, octokit, prompt, model);
        }

    } catch (error: any) {
        core.setFailed(error.message);
    }
};
