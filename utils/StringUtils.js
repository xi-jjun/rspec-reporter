/**
 * trim each lines and join.<br>
 * Each line's prefix must be trimmed; otherwise, it will not be displayed correctly in the pull request comments.
 *
 * @param str {string} target string.
 * @param splitChar {string} split character. default value is `\n`.
 * @param joinChar {string} join character. default value is `\n`.
 * @returns {string}
 */
export const trimEachLines = (str, splitChar = "\n", joinChar = "\n") => {
  return str.split(splitChar)
    .map(line => line.trim())
    .join(joinChar);
};
