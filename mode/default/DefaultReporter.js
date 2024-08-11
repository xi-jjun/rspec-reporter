import {Reporter} from "../Reporter";

export class DefaultReporter extends Reporter {
  /**
   * @param octokit {InstanceType<typeof GitHub>} for using GitHub API.
   * @param template {DefaultTemplate} Template class. `DefaultReporter` use `DefaultTemplate`.
   * @param githubContext {InstanceType<typeof Context.Context>} github context object. It contains issue number, repo info etc...
   */
  constructor(octokit, template, githubContext) {
    super(octokit, template, githubContext);
    this.name = "DefaultReporter";
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
