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

  drawPullRequestComment(rspecTestResult) {
    const header = this.template.formatter(this.template.header());
    const rspecResultBody = rspecTestResult.map(rspecCaseResult => {
      const filepath = rspecCaseResult.filepath;
      const fullDescription = rspecCaseResult.fullDescription;
      const exceptionMessage = rspecCaseResult.exceptionMessage;
      return this.template.formatter(this.template.body(), filepath, fullDescription, exceptionMessage);
    }).join("\n");
    const footer = this.template.formatter(this.template.footer());

    return `
    ${trimEachLines(header)}
    ${trimEachLines(rspecResultBody)}
    ${trimEachLines(footer)}
    `;
  }
}
