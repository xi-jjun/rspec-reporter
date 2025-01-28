import {NotImplementedException} from "../exceptions/NotImplementedException";

export class FrameworkParser {
  constructor() {
    this.defaultEncodingType = 'utf8';
  }

  /**
   * A method that parses a test result file.
   *
   * @param testResult {string} Output file string for each test framework's test result.
   * @return {TestResult} parsing result for reporting test result
   */
  parse(testResult) {
    throw new NotImplementedException('You should implement this in child class');
  }
}
