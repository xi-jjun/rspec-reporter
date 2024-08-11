import {Reporter} from "../Reporter";

export class OnlyPRFilesReporter extends Reporter {
  /**
   * @param octokit {InstanceType<typeof GitHub>} for using GitHub API.
   * @param template {Template} Template class. `OnlyPRFilesReporter` use `OnlyPRFilesTemplate`.
   * @param gitHubApi {GitHubApi} GitHub API module class.
   */
  constructor(octokit, template, gitHubApi) {
    super(octokit, template, gitHubApi);
    this.name = "OnlyPRFilesReporter";
  }

  /**
   * Parse rspec result file and create pull request comment.<br>
   * Report rspec result only in pull requested files.
   *
   * @param rspecResult {JSON} rspec result (JSON format)
   */
  reportRspecResult(rspecResult) {
    this.gitHubApi.readPullRequestFiles()
      .then(response => {
        const pullRequestFiles = response.data;
        return pullRequestFiles.map(pullRequestFile => this.#extractFilenameFromPath(pullRequestFile.filename));
      })
      .then(pullRequestFilenames => this.#filterOnlyRubyFiles(pullRequestFilenames))
      .then(pullRequestRubyFilenames => this.#convertRubyFilenameToRspecFilenames(pullRequestRubyFilenames))
      .then(pullRequestRspecFilenames => {
        const rspecCasesResult = this.#extractRspecResult(rspecResult, pullRequestRspecFilenames);
        const content = this.drawPullRequestComment(rspecCasesResult);
        this.gitHubApi.createCommentToPullRequest(content);
      })
      .catch(error => {
        console.log(error);
        throw new Error(`OnlyPRFilesReporter.reportRspecResult failed : ${error.message}`);
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
}
