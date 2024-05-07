const { BadRequestError } = require('../expressError');

/**
 * Generates a partial SQL update query based on the provided data.
 *
 * This function is used to create a part of an SQL UPDATE statement. It generates
 * a string for setting column values based on keys in `dataToUpdate` object, mapping
 * keys to column names as defined in `jsToSql`. It helps in avoiding SQL injection
 * by parameterizing the values.
 *
 * @param {Object} dataToUpdate - Object containing the data fields to update.
 *                               Example: {firstName: 'Aliya', age: 32}
 * @param {Object} jsToSql - Maps JavaScript style camelCase variables to database
 *                           column names which are typically snake_case.
 *                           Example: {firstName: "first_name", lastName: "last_name"}
 * @returns {Object} An object containing:
 *                   - setCols: A string part of the SQL query that sets columns.
 *                              Example: '"first_name"=$1, "age"=$2'
 *                   - values: An array of values corresponding to the placeholders.
 *                             Example: ['Aliya', 32]
 * @throws {BadRequestError} If no data is provided for updating.
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
    const keys = Object.keys(dataToUpdate);
    if (keys.length === 0) throw new BadRequestError('No data');

    // Construct array of parameterized column assignments for the SQL update query
    const cols = keys.map((colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`);

    return {
        setCols: cols.join(', '),
        values: Object.values(dataToUpdate),
    };
}

module.exports = { sqlForPartialUpdate };
