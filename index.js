import {DefaultTemplate} from "./mode/DefaultTemplate";
import {DefaultReporter} from "./mode/DefaultReporter";
import {OnlyPRFilesReporter} from "./mode/onlyPullRequestFiles/OnlyPRFilesReporter";
import {OnlyPRFilesTemplate} from "./mode/onlyPullRequestFiles/OnlyPRFilesTemplate";

const core = require('@actions/core');
const github = require('@actions/github');

const {GITHUB_TOKEN} = process.env;
const octokit = github.getOctokit(GITHUB_TOKEN);

try {
  const rspecResultFilepath = core.getInput('filepath');
  const onlyChangedRspecFile = core.getInput('only-pull-request-files');

  const fs = require('fs');
  const rspecResult = JSON.parse(fs.readFileSync(rspecResultFilepath, 'utf8'));

  if (onlyChangedRspecFile === 'true') {
    const onlyPRFilesTemplate = new OnlyPRFilesTemplate();
    const onlyPRFilesReporter = new OnlyPRFilesReporter(octokit, onlyPRFilesTemplate, github.context);
    onlyPRFilesReporter.reportRspecResult(rspecResult);
  } else {
    const defaultTemplate = new DefaultTemplate();
    const defaultReporter = new DefaultReporter(octokit, defaultTemplate, github.context);
    defaultReporter.reportRspecResult(rspecResult);
  }
} catch (error) {
  core.setFailed(error.message);
}
