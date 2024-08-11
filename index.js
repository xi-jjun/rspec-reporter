import {DefaultTemplate} from "./mode/DefaultTemplate";
import {DefaultReporter} from "./mode/DefaultReporter";

const core = require('@actions/core');
const github = require('@actions/github');

const {GITHUB_TOKEN} = process.env;
const octokit = github.getOctokit(GITHUB_TOKEN);

try {
  const FILE_PATH = 'filepath';
  const rspecResultFilepath = core.getInput(FILE_PATH);
  const onlyChangedRspecFile = core.getInput('only-pull-request-files');

  if (onlyChangedRspecFile === 'true') {
    fetchPullRequestFiles(github.context)
      .then(response => {
        const pullRequestFiles = response.data;
        const pullRequestFilenames = pullRequestFiles.map(pullRequestFileInfo => extractFilename(pullRequestFileInfo.filename));
        return filterPullRequestFilenames(pullRequestFilenames);
      })
      .then(filteredPullRequestFilename => createRspecReportComment(rspecResultFilepath, filteredPullRequestFilename))
      .then(comment => {
        octokit.rest.issues.createComment({
          issue_number: github.context.issue.number,
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          body: comment
        });
      })
      .catch(error => {
        console.log(error);
        throw new Error(`fetchPullRequestFiles failed : ${error.message}`);
      });
  } else {
    const fs = require('fs');
    const results = JSON.parse(fs.readFileSync(rspecResultFilepath, 'utf8'));

    const defaultTemplate = new DefaultTemplate();
    const defaultReporter = new DefaultReporter(octokit, defaultTemplate, github.context);
    defaultReporter.reportRspecResult(results);
  }
} catch (error) {
  core.setFailed(error.message);
}

// @param githubContext actions/github's context object
async function fetchPullRequestFiles(githubContext) {
  return await octokit.rest.pulls.listFiles({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    pull_number: githubContext.issue.number
  });
}

function filterPullRequestFilenames(pullRequestFilenames) {
  // 1. *_spec.rb 파일에서 _spec 앞의 이름 추출
  // 2. *.rb 파일 이름 추출
  return pullRequestFilenames.filter(changedFilename => changedFilename.endsWith('.rb'))
    .map(changedRubyFilename => {
      if (changedRubyFilename.endsWith('_spec.rb')) {
        return changedRubyFilename;
      } else {
        const removeExtFilename = changedRubyFilename.substring(0, changedRubyFilename.length - '.rb'.length);
        return `${removeExtFilename}_spec.rb`;
      }
    });
}

function createRspecReportComment(rspecResultFilepath, pullRequestRubyFilenames) {
  const fs = require('fs');
  const results = JSON.parse(fs.readFileSync(rspecResultFilepath, 'utf8'));

  let comment = `## RSpec Test Results\n\n`;
  comment += `<table>
                <tr>
                  <td> rspec path </td> 
                  <td> full description </td>
                  <td> detail error message </td>
                </tr>
            `;

  results.examples.forEach(testCaseResult => {
    if (pullRequestRubyFilenames.length !== 0) {
      const testCaseFilename = extractFilename(testCaseResult.file_path);
      if (!pullRequestRubyFilenames.includes(testCaseFilename)) {
        // skip if not included
        console.log(`${testCaseResult.file_path} is skipped, because it is not included this pull request commits.`);
        return;
      }
    }

    if (testCaseResult.status === 'failed') {
      comment += `<tr>\n`;
      comment += `  <td> ${testCaseResult.file_path} </td>\n`;
      comment += `  <td> ${testCaseResult.full_description} </td>\n`;
      comment += `  <td>\n\n`;
      comment += `\`\`\`console\n`;
      comment += ` \n${testCaseResult.exception.message}\n \n`;
      comment += `\`\`\`\n\n`;
      comment += `  </td>\n`;
      comment += `</tr>`;
    }
  });
  comment += `</table>`;

  return comment;
}

function extractFilename(filepath) {
  return filepath.split('/').slice(-1)[0];
}
