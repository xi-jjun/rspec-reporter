import {trimEachLines} from "../../utils/StringUtils";

export class DefaultReporter {
  /**
   * @param octokit {InstanceType<typeof GitHub>} for using GitHub API.
   * @param template {DefaultTemplate} Template class. `DefaultReporter` use `DefaultTemplate`.
   * @param githubContext {InstanceType<typeof Context.Context>} github context object. It contains issue number, repo info etc...
   */
  constructor(octokit, template, githubContext) {
    this.name = "DefaultReporter";
    this.octokit = octokit;
    this.template = template;
    this.githubContext = githubContext;
  }

  /**
   * Parse rspec result file and create pull request comment.
   *
   * @param rspecResult {JSON} rspec result (JSON format)
   */
  reportRspecResult(rspecResult) {
    const rspecCasesResult = this.extractRspecResult(rspecResult);
    const content = this.drawPullRequestComment(rspecCasesResult);
    this.createCommentToPullRequest(content);
  }

  /**
   * iterate rspec each cases and extract `filepath`, `full desc`, `detail message`.<br>
   * It return extracted rspec failed results by case.
   *
   * @param rspecResult {JSON} rspec result (JSON format)
   * @returns [RspecCaseResult]
   */
  extractRspecResult(rspecResult) {
    console.log("extractRspecResult START!");
    return rspecResult.examples
      .filter(rspecCaseResult => rspecCaseResult.status === 'failed')
      .map(rspecCaseResult => {
      console.log(rspecCaseResult);
      return {
        filepath: rspecCaseResult.file_path,
        fullDescription: rspecCaseResult.full_description,
        exceptionMessage: rspecCaseResult.exception.message
      }
    });
  }

  /**
   * draw report result for comment to pull request.<br>
   * return comment content string.
   *
   * @param rspecCasesResult {Array<RspecCaseResult>} list for rspec each cases result. More detail in `extractRspecResult` method.
   * @returns String
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

  /**
   * create pull request comment.
   *
   * @param content {String} rspec report content
   */
  createCommentToPullRequest(content) {
    this.octokit.rest.issues.createComment({
      issue_number: this.githubContext.issue.number,
      owner: this.githubContext.repo.owner,
      repo: this.githubContext.repo.repo,
      body: content
    });
  }
}