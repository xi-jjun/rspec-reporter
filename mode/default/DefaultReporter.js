import {Reporter} from "../Reporter";

export class DefaultReporter extends Reporter {
  /**
   * @param template {DefaultTemplate} Template class. `DefaultReporter` use `DefaultTemplate`.
   * @param gitHubApi {GitHubApi} GitHub API module class.
   */
  constructor(template, gitHubApi) {
    super(template, gitHubApi);
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
    this.gitHubApi.createCommentToPullRequest(content);
  }

  /**
   * iterate rspec each cases and extract `filepath`, `full desc`, `detail message`.<br>
   * It return extracted rspec failed results by case.
   *
   * @param rspecResult {JSON} rspec result (JSON format)
   * @returns [RspecCaseResult]
   */
  extractRspecResult(rspecResult) {
    return rspecResult.examples
      .filter(rspecCaseResult => rspecCaseResult.status === 'failed')
      .map(rspecCaseResult => {
        return {
          filepath: rspecCaseResult.file_path,
          fullDescription: rspecCaseResult.full_description,
          exceptionMessage: rspecCaseResult.exception.message
        }
      });
  }
}
