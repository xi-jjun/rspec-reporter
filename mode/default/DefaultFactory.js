import {DefaultReporter} from "./DefaultReporter";
import {DefaultTemplate} from "./DefaultTemplate";

export class DefaultReporterFactory {
  static createReporter(octokit, template, githubContext) {
    return new DefaultReporter(octokit, template, githubContext);
  }
}

export class DefaultTemplateFactory {
  static createTemplate() {
    return new DefaultTemplate();
  }
}
