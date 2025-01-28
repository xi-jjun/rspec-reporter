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
            const failMessage = testCaseResult.elements[0].elements[0].text;
            return new TestCaseResult(packageName, testCaseName, failMessage);
          });
      });

    return new TestResult([].concat(...testCaseResults));
  }


  /**
   * @param testCaseResult {JSON}
   * @return {boolean} return if test case is failure case
   */
  #isFailureCase(testCaseResult) {
    const elements = testCaseResult.elements;
    if (!elements) {
      return false;
    }
    return elements[0].name === 'failure';
  }
}
