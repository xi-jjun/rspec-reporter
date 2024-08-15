import {OnlyPRFilesReporter} from "./OnlyPRFilesReporter";
import {OnlyPRFilesTemplate} from "./OnlyPRFilesTemplate";

export class OnlyPRFilesReporterFactory {
  /**
   * create onlyPRFilesReporter implementation
   *
   * @param template {Template} template object for reporting
   * @param gitHubApi {GitHubApi} GitHub API module
   * @returns {OnlyPRFilesReporter}
   */
  static createReporter(template, gitHubApi) {
    return new OnlyPRFilesReporter(template, gitHubApi);
  }
}

export class OnlyPRFilesTemplateFactory {
  static createTemplate() {
    return new OnlyPRFilesTemplate();
  }
}
