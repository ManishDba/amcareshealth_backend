/**
 * App Configuration Manager
 * Provides a simple interface to access environment variables.
 */
class AppConfig {
  /**
   * Get a string value from environment variables.
   * @param {string} key
   * @param {string} defaultValue
   * @returns {string}
   */
  string(key, defaultValue = "") {
    const value = process.env[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return value;
  }

  /**
   * Get a number value from environment variables.
   * @param {string} key
   * @param {number} defaultValue
   * @returns {number}
   */
  number(key, defaultValue = 0) {
    const value = process.env[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return Number(value);
  }

  /**
   * Get a boolean value from environment variables.
   * @param {string} key
   * @param {boolean} defaultValue
   * @returns {boolean}
   */
  boolean(key, defaultValue = false) {
    const value = process.env[key];
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return value.toLowerCase() === "true";
  }
}

const appConfig = new AppConfig();
module.exports = { appConfig };
