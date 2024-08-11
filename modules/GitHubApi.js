export class GitHubApi {
  /**
   * @param octokit {InstanceType<typeof GitHub>} for using GitHub API.
   * @param githubContext {InstanceType<typeof Context.Context>} github context object. It contains issue number, repo info etc...
   */
  constructor(octokit, githubContext) {
    this.name = "GitHubApi";
    this.octokit = octokit;
    this.githubContext = githubContext;
  }

  /**
   * Create pull request comment async.<br>
   * Body is rspec report content.
   *
   * @param content {string} rspec report result
   */
  createCommentToPullRequest(content) {
    this.octokit.rest.issues.createComment({
      issue_number: this.githubContext.issue.number,
      owner: this.githubContext.repo.owner,
      repo: this.githubContext.repo.repo,
      body: content
    });
  }

  /**
   * Read list of pull request files.
   *
   * @returns {Promise} read pull request file list promise object
   */
  async readPullRequestFiles() {
    return await this.octokit.rest.pulls.listFiles({
      owner: this.githubContext.repo.owner,
      repo: this.githubContext.repo.repo,
      pull_number: this.githubContext.issue.number
    });
  }
}
