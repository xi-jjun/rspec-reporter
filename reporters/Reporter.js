import {RspecParser} from "../parsers/RspecParser";
import {trimEachLines} from "../utils/StringUtils";

export class Reporter {
  /**
   * @param template {Template} rspec comment design template
   * @param gitHubApi {GitHubApi} GitHub API module class
   */
  constructor(template, gitHubApi) {
    this.parser = {
      rspec: new RspecParser()
    };
    this.template = template;
    this.gitHubApi = gitHubApi;
  }

  report(filepath, testFramework) {
    const parser = this.parser[testFramework.toLowerCase()];
    if (!parser) {
      throw new Error(`No parser available for test-framework: ${testFramework}`);
    }

    const testResult = parser.parse(filepath);
    const content = this.drawPullRequestComment(testResult);
    this.gitHubApi.createCommentToPullRequest(content);
  }

  /**
   * @param testResult {TestResult}
   * @return {string}
   */
  drawPullRequestComment(testResult) {
    const header = this.template.formatter(this.template.header());
    const testResultBody = testResult.testCaseResults
      .map(testCaseResult => {
        const filepath = testCaseResult.filepath;
        const fullDescription = testCaseResult.fullDescription;
        const failMessage = testCaseResult.failMessage;
        return this.template.formatter(this.template.body(), filepath, fullDescription, failMessage);
      }).join("\n");
    const footer = this.template.formatter(this.template.footer());

    return `
    ${trimEachLines(header)}
    ${trimEachLines(testResultBody)}
    ${trimEachLines(footer)}
    `;
  }
}
