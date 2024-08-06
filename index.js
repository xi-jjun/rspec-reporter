const core = require('@actions/core');
const github = require('@actions/github');

const FILE_PATH = 'filepath';

try {
  const {GITHUB_TOKEN} = process.env;
  const octokit = github.getOctokit(GITHUB_TOKEN);

  const rspecResultFilepath = core.getInput(FILE_PATH);
  console.log("rspec result filepath", rspecResultFilepath);

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
    if (testCaseResult.status === 'failed') {
      comment += `<tr>\n`;
      comment += `  <td> ${testCaseResult.file_path} </td>\n`;
      comment += `  <td> ${testCaseResult.full_description} </td>\n`;
      comment += `  <td>\n\n`
      comment += `\`\`\`console\n`;
      comment += ` \n${testCaseResult.exception.message}\n \n`;
      comment += `\`\`\`\n\n`;
      comment += `  </td>\n`
      comment += `</tr>`;
    }
  });
  comment += `</table>`;

  octokit.rest.issues.createComment({
    issue_number: github.context.issue.number,
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    body: comment
  });
} catch (error) {
  core.setFailed(error.message);
}

