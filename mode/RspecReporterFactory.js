import {DefaultReporterFactory, DefaultTemplateFactory} from "./default/DefaultFactory";
import {
  OnlyPRFilesReporterFactory,
  OnlyPRFilesTemplateFactory
} from "./onlyPullRequestFiles/OnlyPRFilesFactory";
import {GitHubApi} from "../modules/GitHubApi";

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
   * @param octokit {InstanceType<typeof GitHub>} for using GitHub API.
   * @param githubContext {InstanceType<typeof Context.Context>} github context object. It contains issue number, repo info etc...
   * @returns {Reporter} return reporter object by specific mode
   * @throws {Error} if mode is not matched, then raise error
   */
  static create(mode, octokit, githubContext) {
    const {reporterFactoryName, templateFactoryName} = modes[mode];
    if (!reporterFactoryName || !templateFactoryName) {
      throw new Error(`Invalid mode : ${mode}`);
    }

    const reporterFactory = reporters[reporterFactoryName];
    const templateFactory = templates[templateFactoryName];

    const gitHubApi = new GitHubApi(octokit, githubContext);
    const template = templateFactory.createTemplate();

    return reporterFactory.createReporter(template, gitHubApi);
  }
}
