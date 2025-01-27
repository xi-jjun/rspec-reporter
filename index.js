import {GitHubApi} from "./modules/GitHubApi";
import {Reporter} from "./reporters/Reporter";
import {DefaultTemplate} from "./mode/default/DefaultTemplate";

const core = require('@actions/core');
const github = require('@actions/github');

const {GITHUB_TOKEN} = process.env;
const octokit = github.getOctokit(GITHUB_TOKEN);

try {
  const rspecResultFilepath = core.getInput('filepath');
  const reportMode = core.getInput('report-mode');
  const testFramework = core.getInput('test-framework');
  console.log('== inputs ==');
  console.log(`mode (Deprecated) : ${reportMode}`);
  console.log(`filepath : ${rspecResultFilepath}`);
  console.log(`test-framework : ${testFramework}`)

  const defaultTemplate = new DefaultTemplate();
  const gitHubApi = new GitHubApi(octokit, github.context);
  const reporter = new Reporter(defaultTemplate, gitHubApi);
  reporter.report(rspecResultFilepath, testFramework);
} catch (error) {
  core.setFailed(error.message);
}
