import {NotImplementedException} from "../exceptions/NotImplementedException";
import {trimEachLines} from "../utils/StringUtils";

export class Reporter {
  /**
   * @param octokit {InstanceType<typeof GitHub>} for using GitHub API.
   * @param template {Template} Template class.
   * @param githubContext {InstanceType<typeof Context.Context>} github context object. It contains issue number, repo info etc...
   */
  constructor(octokit, template, githubContext) {
    this.name = "Reporter";
    this.octokit = octokit;
    this.template = template;
    this.githubContext = githubContext;
  }

  /**
   * Parse rspec result file and create pull request comment.
   *
   * @param rspecResult {JSON} rspec result (JSON format). It is result of executing rspec.
   */
  reportRspecResult(rspecResult) {
    try {
      this.notImplementedError();
    } catch (error) {
      console.log(error);
    }
  }

  notImplementedError() {
    throw new NotImplementedException('You should implement this in child class');
  }

  /**
   * Draw report result for comment to pull request.<br>
   * Return comment content string. This method is common logic.
   *
   * @param rspecCasesResult {Array<RspecCaseResult>} list for rspec each cases result. More detail in `extractRspecResult` method.
   * @returns {string} return report result content. This content is going to be added pull request comment
   */
  drawPullRequestComment(rspecCasesResult) {
    console.log("drawPullRequestComment START!!");
    const header = this.template.formatter(this.template.header());
    const rspecResultBody = rspecCasesResult.map(rspecCaseResult => {
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
