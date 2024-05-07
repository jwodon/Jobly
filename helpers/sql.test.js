const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

describe('sqlForPartialUpdate', () => {
    test('works: generates SQL and values', () => {
        const result = sqlForPartialUpdate(
            { firstName: 'Aliya', lastName: 'Smith' },
            { firstName: 'first_name', lastName: 'last_name' }
        );
        expect(result).toEqual({
            setCols: '"first_name"=$1, "last_name"=$2',
            values: ['Aliya', 'Smith'],
        });
    });

    test('throws error if no data', () => {
        expect(() => {
            sqlForPartialUpdate({}, { firstName: 'first_name' });
        }).toThrow(BadRequestError);
    });

    test('correctly uses default column names if no mapping provided', () => {
        const result = sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, { firstName: 'first_name' });
        expect(result).toEqual({
            setCols: '"first_name"=$1, "age"=$2',
            values: ['Aliya', 32],
        });
    });
});
