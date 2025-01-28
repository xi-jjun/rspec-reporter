import {NotImplementedException} from "../exceptions/NotImplementedException";

export class FrameworkParser {
  constructor() {
    this.defaultEncodingType = 'utf8';
  }

  /**
   * A method that parses a test result file.
   *
   * @param filepath {string} Path to the test result file generated from user's test execution
   * @return {TestResult} parsing result for reporting test result
   */
  parse(filepath) {
    throw new NotImplementedException('You should implement this in child class');
  }
}
