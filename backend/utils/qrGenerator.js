const QRCode = require('qrcode');

/**
 * Generate QR Code as Data URL (base64)
 * @param {string} text - Text to encode
 * @returns {Promise<string>} Data URL
 */
const generateQRDataURL = async (text) => {
    try {
        return await QRCode.toDataURL(text);
    } catch (err) {
        console.error('Error generating QR Data URL:', err);
        throw err;
    }
};

/**
 * Generate QR Code as Buffer (PNG)
 * @param {string} text - Text to encode
 * @returns {Promise<Buffer>} Image Buffer
 */
const generateQRBuffer = async (text) => {
    try {
        return await QRCode.toBuffer(text);
    } catch (err) {
        console.error('Error generating QR Buffer:', err);
        throw err;
    }
};

module.exports = {
    generateQRDataURL,
    generateQRBuffer
};
