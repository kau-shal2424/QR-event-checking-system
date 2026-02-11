const crypto = require('crypto');

/**
 * Generate secure QR token using HMAC
 * Formula: eventId + participantId + nonce
 * @param {string} eventId 
 * @param {string} participantId 
 * @returns {object} { token, hash }
 */
const generateSecureToken = (eventId, participantId) => {
    const secret = process.env.HMAC_SECRET || 'default_secret'; // Fallback for dev (should be in .env)
    const nonce = crypto.randomBytes(16).toString('hex');

    // Create payload
    const payload = `${eventId}.${participantId}.${nonce}`;

    // Sign payload
    const signature = crypto.createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    // Combine to form full token
    const token = `${payload}.${signature}`;

    // Hash token for database storage
    const hash = crypto.createHash('sha256')
        .update(token)
        .digest('hex');

    return {
        token, // Send this to user (contains all info needed + signature)
        hash   // Store this in DB (cannot reverse to get token)
    };
};

module.exports = {
    generateSecureToken
};
