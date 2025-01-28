import {FrameworkParser} from "./FrameworkParser";
import {TestResult} from "../models/TestResult";
import {TestCaseResult} from "../models/TestCaseResult";

export class JUnitParser extends FrameworkParser {
  parse(filepath) {
    const fs = require('fs');
    const convert = require('xml-js');
    const filenames = fs.readdirSync(filepath);
    const testCaseResults = filenames
      .map(filename => {
        const testResultXMLFormat = fs.readFileSync(`${filepath}/${filename}`, this.defaultEncodingType);
        return JSON.parse(convert.xml2json(testResultXMLFormat));
      })
      .map(testResultJSONFromFile => {
        const testResult = testResultJSONFromFile.elements[0];
        const packageName = testResult.attributes.name;
        const totalSpendTime = testResult.attributes.time;
        const totalTestCount = testResult.attributes.tests;

        return testResult.elements
          .filter(testCaseResult => testCaseResult.name === 'testcase' && this.#isFailureCase(testCaseResult))
          .map(testCaseResult => {
            const testCaseName = testCaseResult.attributes.name;
            // const failMessage = testCaseResult.elements[0].elements[0].text;
            const failMessage = testCaseResult.elements[0].attributes.message;
            return new TestCaseResult(packageName, testCaseName, failMessage);
          });
      });

    return new TestResult([].concat(...testCaseResults));
  }


  /**
   * Checks if the current test case is a failure case
   * Returns true if the test case contains a failure element, indicating a failed test
   * 
   * @param testCaseResult {JSON} Test case result in JSON format
   * @return {boolean} return true if test case is a failure case, false otherwise
   */
  #isFailureCase(testCaseResult) {
    const elements = testCaseResult.elements;
    if (!elements) {
      return false;
    }
    return elements[0].name === 'failure';
  }
}
