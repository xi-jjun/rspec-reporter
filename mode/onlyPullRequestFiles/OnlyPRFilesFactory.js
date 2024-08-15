import {OnlyPRFilesReporter} from "./OnlyPRFilesReporter";
import {OnlyPRFilesTemplate} from "./OnlyPRFilesTemplate";

export class OnlyPRFilesReporterFactory {
  static createReporter(octokit, template, githubContext) {
    return new OnlyPRFilesReporter(octokit, template, githubContext);
  }
}

export class OnlyPRFilesTemplateFactory {
  static createTemplate() {
    return new OnlyPRFilesTemplate();
  }
}
