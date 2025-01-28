import {GitHubApi} from "./modules/GitHubApi";
import {Reporter} from "./reporters/Reporter";

const core = require('@actions/core');
const github = require('@actions/github');

const {GITHUB_TOKEN} = process.env;
const octokit = github.getOctokit(GITHUB_TOKEN);

try {
  const filepath = core.getInput('filepath');
  const testFramework = core.getInput('test-framework');
  console.log('== inputs ==');
  console.log(`filepath : ${filepath}`);
  console.log(`test-framework : ${testFramework}`)

  const gitHubApi = new GitHubApi(octokit, github.context);
  const reporter = new Reporter(gitHubApi);
  reporter.report(filepath, testFramework);
} catch (error) {
  core.setFailed(error.message);
}
