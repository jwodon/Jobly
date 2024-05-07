'use strict';

const { query } = require('express');
const db = require('../db');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
     *
     * data should be { handle, name, description, numEmployees, logoUrl }
     *
     * Returns { handle, name, description, numEmployees, logoUrl }
     * */

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title,
                                 salary,
                                 equity,
                                 company_handle)
               VALUES ($1, $2, $3, $4)
               RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [data.title, data.salary, data.equity, data.companyHandle]
        );
        let job = result.rows[0];

        return job;
    }

    /** Find all jobs.
     *
     * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
     * */

    static async findAll(minSalary, hasEquity, title) {
        const query = `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM jobs`;
        // Initialize an array to store query parameters
        const queryValues = [];
        // Initialize an array to store query conditions
        const conditions = [];

        // Check if minSalary parameter is provided and append condition
        if (minSalary) {
            queryValues.push(minSalary);
            conditions.push(`salary >= $${queryValues.length}`);
        }

        if (hasEquity === true) {
            queryValues.push(maxEmployees);
            conditions.push(`equity > 0`);
        }

        if (title) {
            queryValues.push(`%${title}%`);
            conditions.push(`title ILIKE $${queryValues.length}`);
        }

        // If there are conditions, append them to the query
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Append ORDER BY clause to sort by title
        query += ' ORDER BY title';

        // Execute the query with the parameters
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;
    }

    /** Given a job id, return data about job.
     *
     * Returns { id, title, salary, equity, companyHandle, company }
     *   where company is { handle, name, description, numEmployees, logoUrl }
     *
     * Throws NotFoundError if not found.
     **/

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`,
            [id]
        );

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        const companiesRes = await db.query(
            `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`,
            [job.companyHandle]
        );

        delete job.companyHandle;
        job.company = companiesRes.rows[0];

        return job;
    }

    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain
     * all the fields; this only changes provided ones.
     *
     * Data can include: { title, salary, equity }
     *
     * Returns { id, title, salary, equity, companyHandle }
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const idVarIdx = '$' + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if company not found.
     **/

    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
            [id]
        );
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;
