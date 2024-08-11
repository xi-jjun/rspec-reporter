import {ReporterFactory} from "./mode/ReporterFactory";

const core = require('@actions/core');
const github = require('@actions/github');

const {GITHUB_TOKEN} = process.env;
const octokit = github.getOctokit(GITHUB_TOKEN);

try {
  const rspecResultFilepath = core.getInput('filepath');
  const reportMode = core.getInput('report-mode');
  console.log(`report mode is [${reportMode}]`);

  const fs = require('fs');
  const rspecResult = JSON.parse(fs.readFileSync(rspecResultFilepath, 'utf8'));

  const reporter = ReporterFactory.createReporter(reportMode, octokit, github.context);
  reporter.reportRspecResult(rspecResult);
} catch (error) {
  core.setFailed(error.message);
}
