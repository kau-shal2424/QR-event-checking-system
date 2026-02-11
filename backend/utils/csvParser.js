const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Parse CSV buffer to JSON array
 * @param {Buffer} buffer - CSV file buffer
 * @returns {Promise<Array>} Parsed data array
 */
const parseCSV = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = Readable.from(buffer);

        stream
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

/**
 * Validate CSV data has required fields
 * @param {Array} data - Parsed CSV data
 * @returns {object} { valid, errors }
 */
const validateCSVData = (data) => {
    const errors = [];
    const requiredFields = ['name', 'email', 'studentId'];

    if (!data || data.length === 0) {
        return { valid: false, errors: ['CSV file is empty'] };
    }

    // Check first row for required fields
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => !(field in firstRow));

    if (missingFields.length > 0) {
        errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
        requiredFields.forEach(field => {
            if (!row[field] || row[field].trim() === '') {
                errors.push(`Row ${index + 1}: Missing ${field}`);
            }
        });

        // Validate email format
        if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) {
            errors.push(`Row ${index + 1}: Invalid email format`);
        }
    });

    return {
        valid: errors.length === 0,
        errors
    };
};

module.exports = {
    parseCSV,
    validateCSVData
};
