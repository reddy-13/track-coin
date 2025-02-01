import jwt from 'jsonwebtoken';

const apiKey =  '679cbd53af72b10001518523';
const apiSecret = 'f143ee01-9fd8-4d73-a50b-309bfc5879e1';
const apiPassphrase = '8J06V/52mlraoNK6+LGOb0ljsy7EIg0';

export const generateKuCoinToken = () => {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
        sub: apiKey,
        nonce: now,
    };

    const token = jwt.sign(payload, apiSecret, { algorithm: 'HS256' });
    return token;
};