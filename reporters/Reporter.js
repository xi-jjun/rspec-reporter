import {RspecParser} from "../parsers/RspecParser";
import {trimEachLines} from "../utils/StringUtils";
import {DefaultTemplate} from "../mode/default/DefaultTemplate";

export class Reporter {
  /**
   * @param gitHubApi {GitHubApi} GitHub API module class
   */
  constructor(gitHubApi) {
    this.parser = {
      rspec: new RspecParser()
    };
    this.templates = {
      default: new DefaultTemplate()
    }
    this.gitHubApi = gitHubApi;
  }

  report(filepath, testFramework, template = 'default') {
    const parser = this.parser[testFramework.toLowerCase()];
    if (!parser) {
      throw new Error(`No parser available for test-framework: ${testFramework}`);
    }
    const reportTemplate = this.templates[template];
    if (!reportTemplate) {
      throw new Error(`No template available: ${template}`);
    }
    reportTemplate.testFramework = reportTemplate.testFrameworks[testFramework.toLowerCase()];

    const testResult = parser.parse(filepath);
    const content = this.drawPullRequestComment(testResult, reportTemplate);
    this.gitHubApi.createCommentToPullRequest(content);
  }

  /**
   * @param testResult {TestResult}
   * @param reportTemplate {Template}
   * @return {string}
   */
  drawPullRequestComment(testResult, reportTemplate) {
    const header = reportTemplate.formatter(reportTemplate.header());
    const testResultBody = testResult.testCaseResults
      .map(testCaseResult => {
        const filepath = testCaseResult.filepath;
        const fullDescription = testCaseResult.fullDescription;
        const failMessage = testCaseResult.failMessage;
        return reportTemplate.formatter(reportTemplate.body(), filepath, fullDescription, failMessage);
      }).join("\n");
    const footer = reportTemplate.formatter(reportTemplate.footer());

    return `
    ${trimEachLines(header)}
    ${trimEachLines(testResultBody)}
    ${trimEachLines(footer)}
    `;
  }
}
