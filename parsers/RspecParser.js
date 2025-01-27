import {FrameworkParser} from "./FrameworkParser";

export class RspecParser extends FrameworkParser {
  /**
   * A method that parses a test result of rspec(JSON file)
   *
   * @param filepath {string} rspec result file path
   * @return {Object} rspec result js object
   */
  parse(filepath) {
    const fs = require('fs');
    const file = fs.readFileSync(filepath, this.defaultEncodingType);
    const rspecResult = JSON.parse(file);

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
