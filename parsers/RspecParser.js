import {FrameworkParser} from "./FrameworkParser";
import {TestResult} from "../models/TestResult";
import {TestCaseResult} from "../models/TestCaseResult";

export class RspecParser extends FrameworkParser {
  /**
   * A method that parses a test result of rspec(JSON file)
   *
   * @param filepath {string} rspec result file path
   * @return {TestResult} rspec result js object
   */
  parse(filepath) {
    const fs = require('fs');
    const file = fs.readFileSync(filepath, this.defaultEncodingType);
    const rspecResult = JSON.parse(file);

    const testCaseResults = rspecResult.examples
      .filter(rspecCaseResult => rspecCaseResult.status === 'failed')
      .map(rspecCaseResult => {
        // TODO : rspecCaseResult.run_time (spend time)
        return new TestCaseResult(
          rspecCaseResult.file_path,
          rspecCaseResult.full_description,
          rspecCaseResult.exception.message
        );
      });

    return new TestResult(testCaseResults);
  }
}
