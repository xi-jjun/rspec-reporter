const core = require('@actions/core');
const github = require('@actions/github');

const {GITHUB_TOKEN} = process.env;
const octokit = github.getOctokit(GITHUB_TOKEN);

try {
  const FILE_PATH = 'filepath';
  const rspecResultFilepath = core.getInput(FILE_PATH);
  const onlyChangedRspecFile = core.getInput('only-pull-request-files');
  console.log(onlyChangedRspecFile);

  const fs = require('fs');
  const results = JSON.parse(fs.readFileSync(rspecResultFilepath, 'utf8'));

  let pullRequestRubyFilenames = [];
  if (onlyChangedRspecFile === 'true') {
    const changedFilenames = fetchPullRequestFilenames(github.context);
    // 1. *_spec.rb 파일에서 _spec 앞의 이름 추출
    // 2. *.rb 파일 이름 추출
    pullRequestRubyFilenames = changedFilenames.filter(changedFilename => changedFilename.endsWith('.rb'))
      .map(changedRubyFilename => {
        if (changedRubyFilename.endsWith('_spec.rb')) {
          return changedRubyFilename;
        } else {
          const removeExtFilename = changedRubyFilename.substring(0, changedRubyFilename.length - '.rb'.length);
          return `${removeExtFilename}_spec.rb`;
        }
      });
    console.log(pullRequestRubyFilenames);
  }

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
      const testCaseFilename = testCaseResult.file_path.split('/').slice(-1)[0];
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

  octokit.issues.createComment({
    issue_number: github.context.issue.number,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: comment
  });
} catch (error) {
  core.setFailed(error.message);
}

// @param githubContext actions/github's context object
async function fetchPullRequestFilenames(githubContext) {
  return await octokit.pulls.listFiles({
    owner: githubContext.repo.owner,
    repo: githubContext.repo.repo,
    pull_number: githubContext.issue.number
  })
    .then(response => {
      const pullRequestFileInfoList = response.data;
      return pullRequestFileInfoList.map(pullRequestFileInfo => pullRequestFileInfo.filename);
    })
    .catch(error => {
      console.log(error);
      throw new Error(`fetchPullRequestFilenames failed : ${error.message}`);
    });
}
