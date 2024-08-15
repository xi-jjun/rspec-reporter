import {RspecReporterFactory} from "./mode/RspecReporterFactory";
import {GitHubApi} from "./modules/GitHubApi";

const core = require('@actions/core');
const github = require('@actions/github');

const {GITHUB_TOKEN} = process.env;
const octokit = github.getOctokit(GITHUB_TOKEN);

try {
  const rspecResultFilepath = core.getInput('filepath');
  const reportMode = core.getInput('report-mode');
  console.log('== inputs ==');
  console.log(`mode : ${reportMode}`);
  console.log(`filepath : ${rspecResultFilepath}`);

  const fs = require('fs');
  const rspecResult = JSON.parse(fs.readFileSync(rspecResultFilepath, 'utf8'));

  const gitHubApi = new GitHubApi(octokit, github.context);
  const reporter = RspecReporterFactory.create(reportMode, gitHubApi);
  reporter.reportRspecResult(rspecResult);
} catch (error) {
  core.setFailed(error.message);
}
