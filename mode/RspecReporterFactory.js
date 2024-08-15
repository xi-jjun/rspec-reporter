import {DefaultReporterFactory, DefaultTemplateFactory} from "./default/DefaultFactory";
import {
  OnlyPRFilesReporterFactory,
  OnlyPRFilesTemplateFactory
} from "./onlyPullRequestFiles/OnlyPRFilesFactory";

const reporters = {
  DefaultReporterFactory,
  OnlyPRFilesReporterFactory
};

const templates = {
  DefaultTemplateFactory,
  OnlyPRFilesTemplateFactory
};

const modes = {
  default: {
    reporterFactoryName: "DefaultReporterFactory",
    templateFactoryName: "DefaultTemplateFactory"
  },
  onlyPRFiles: {
    reporterFactoryName: "OnlyPRFilesReporterFactory",
    templateFactoryName: "OnlyPRFilesTemplateFactory"
  }
};

export class RspecReporterFactory {
  /**
   * create reporter by mode
   *
   * @param mode {string} report mode
   * @param gitHubApi {GitHubApi} GitHub API module class. For using GitHub API.
   * @returns {Reporter} return reporter object by specific mode
   * @throws {Error} if mode is not matched, then raise error
   */
  static create(mode, gitHubApi) {
    const {reporterFactoryName, templateFactoryName} = modes[mode];
    if (!reporterFactoryName || !templateFactoryName) {
      throw new Error(`Invalid mode : ${mode}`);
    }

    const reporterFactory = reporters[reporterFactoryName];
    const templateFactory = templates[templateFactoryName];

    const template = templateFactory.createTemplate();

    return reporterFactory.createReporter(template, gitHubApi);
  }
}
