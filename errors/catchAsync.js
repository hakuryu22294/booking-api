/**
 * Wraps an asynchronous middleware function with error handling.
 * @param {Function} fn - The asynchronous function to be executed.
 * @returns {Function} - A middleware function that executes the provided asynchronous function and catches errors.
 */

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
