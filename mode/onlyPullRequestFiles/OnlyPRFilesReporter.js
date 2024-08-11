import {trimEachLines} from "../../utils/StringUtils";

export class OnlyPRFilesReporter {
  /**
   * @param octokit {InstanceType<typeof GitHub>} for using GitHub API.
   * @param template {OnlyPRFilesTemplate} Template class. `DefaultReporter` use `DefaultTemplate`.
   * @param githubContext {InstanceType<typeof Context.Context>} github context object. It contains issue number, repo info etc...
   */
  constructor(octokit, template, githubContext) {
    this.name = "OnlyPRFilesReporter";
    this.octokit = octokit;
    this.template = template;
    this.githubContext = githubContext;
  }

  /**
   * Parse rspec result file and create pull request comment.<br>
   * Report rspec result only in pull requested files.
   *
   * @param rspecResult {JSON} rspec result (JSON format)
   */
  reportRspecResult(rspecResult) {
    this.#fetchPullRequestFiles()
      .then(response => {
        const pullRequestFiles = response.data;
        return pullRequestFiles.map(pullRequestFile => this.#extractFilenameFromPath(pullRequestFile.filename));
      })
      .then(pullRequestFilenames => this.#filterOnlyRubyFiles(pullRequestFilenames))
      .then(pullRequestRubyFilenames => this.#convertRubyFilenameToRspecFilenames(pullRequestRubyFilenames))
      .then(pullRequestRspecFilenames => {
        const rspecCasesResult = this.#extractRspecResult(rspecResult, pullRequestRspecFilenames);
        const content = this.#drawPullRequestComment(rspecCasesResult);
        this.#createCommentToPullRequest(content);
      })
      .catch(error => {
        console.log(error);
        throw new Error(`OnlyPRFilesReporter.reportRspecResult failed : ${error.message}`);
      });
  }

  async #fetchPullRequestFiles() {
    return await this.octokit.rest.pulls.listFiles({
      owner: this.githubContext.repo.owner,
      repo: this.githubContext.repo.repo,
      pull_number: this.githubContext.issue.number
    });
  }

  /**
   * extract filename from filepath.
   *
   * @param filepath {string} file path of rspec. <br>ex: `".github/workflows/product_spec.rb"`
   * @returns {string} filename. ex: `product_spec.rb`
   */
  #extractFilenameFromPath(filepath) {
    try {
      return filepath.split('/').slice(-1)[0];
    } catch (error) {
      console.log(`OnlyPRFilesReporter.#extractFilenameFromPath failed : ${error.message}`);
      return '';
    }
  }

  /**
   * filter only ruby filenames.
   *
   * @param pullRequestFilenames {Array<string>} pull request filenames
   * @returns {Array<string>} ruby filenames
   */
  #filterOnlyRubyFiles(pullRequestFilenames) {
    return pullRequestFilenames.filter(pullRequestFilename => pullRequestFilename.endsWith('.rb'));
  }

  /**
   * make .rb or _spec.rb filename to spec filename.<br>
   * we need to execute rspec when original file is changed.
   *
   * @example
   * `hello.rb` --> `hello_spec.rb` (changed)
   * `hello_service_spec.rb` --> `hello_service_spec.rb` (not changed)
   * `hello.txt` --> `` (empty string)
   * @param pullRequestFilenames {Array<string>} pull request filenames
   * @returns {Array<string>} ruby rspec filenames
   */
  #convertRubyFilenameToRspecFilenames(pullRequestFilenames) {
    return pullRequestFilenames.map(pullRequestRubyFilename => {
      if (pullRequestRubyFilename.endsWith('_spec.rb')) {
        return pullRequestRubyFilename;
      } else if (pullRequestRubyFilename.endsWith('.rb')) {
        const removeExtFilename = pullRequestRubyFilename.substring(0, pullRequestRubyFilename.length - '.rb'.length);
        return `${removeExtFilename}_spec.rb`;
      } else {
        return '';
      }
    });
  }

  /**
   * iterate rspec each cases and extract `filepath`, `full desc`, `detail message`.<br>
   * It return extracted rspec failed results by case.
   *
   * @param rspecResult {JSON} rspec result (JSON format)
   * @param pullRequestRspecFilenames {Array<string>} rspec filenames
   * @returns [RspecCaseResult] rspec cases result in pull requested files
   */
  #extractRspecResult(rspecResult, pullRequestRspecFilenames) {
    console.log("#extractRspecResult START!");
    return rspecResult.examples
      .filter(rspecCaseResult => rspecCaseResult.status === 'failed')
      .filter(failedRspecCaseResult => this.#isPullRequestFiles(failedRspecCaseResult, pullRequestRspecFilenames))
      .map(failedRspecCaseResult => {
        return {
          filepath: failedRspecCaseResult.file_path,
          fullDescription: failedRspecCaseResult.full_description,
          exceptionMessage: failedRspecCaseResult.exception.message
        }
      });
  }

  /**
   * check rspec case is in the pull request files
   *
   * @param rspecCaseResult {JSON} rspec case result example
   * @param pullRequestedFilenames {Array<string>} pull requested filenames
   * @returns {boolean} return `true` if it is pull requested filename, otherwise return false.
   */
  #isPullRequestFiles(rspecCaseResult, pullRequestedFilenames) {
    const filename = this.#extractFilenameFromPath(rspecCaseResult.file_path);
    return pullRequestedFilenames.includes(filename);
  }

  /**
   * draw report result for comment to pull request.<br>
   * return comment content string.
   *
   * @param rspecCasesResult {Array<RspecCaseResult>} list for rspec each cases result. More detail in `#extractRspecResult` method.
   * @returns {string} report content
   */
  #drawPullRequestComment(rspecCasesResult) {
    console.log("#drawPullRequestComment START!!");
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
  #createCommentToPullRequest(content) {
    this.octokit.rest.issues.createComment({
      issue_number: this.githubContext.issue.number,
      owner: this.githubContext.repo.owner,
      repo: this.githubContext.repo.repo,
      body: content
    });
  }
}
