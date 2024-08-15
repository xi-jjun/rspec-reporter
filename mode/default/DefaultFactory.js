import {DefaultReporter} from "./DefaultReporter";
import {DefaultTemplate} from "./DefaultTemplate";

export class DefaultReporterFactory {
  /**
   * create defaultReporter implementation
   *
   * @param template {Template} template object for reporting
   * @param gitHubApi {GitHubApi} GitHub API module
   * @returns {DefaultReporter}
   */
  static createReporter(template, gitHubApi) {
    return new DefaultReporter(template, gitHubApi);
  }
}

export class DefaultTemplateFactory {
  static createTemplate() {
    return new DefaultTemplate();
  }
}
