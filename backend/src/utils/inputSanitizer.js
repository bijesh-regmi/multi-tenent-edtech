export const sanitize = (str) => {
    if (typeof str !== "string") return str;
    return str
        .replace(/\0/g, "") // Remove null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
        .normalize("NFC") // Normalize Unicode
        .trim();
};

export const sanitizeUsername = (username) => {
    if (typeof username !== "string") return username;
    const cleaned = sanitize(username);
    return cleaned.toLowerCase();
};
export const validUsername = (username) => {
    if (typeof username !== "string") return null;
    const userRegex = /^[a-zA-Z0-9_-]+$/;
    return userRegex.test(username) ? username.toLowerCase() : null;
};

export const sanitizeEmail = (email) => {
    if (typeof email !== "string") return null;
    const cleaned = sanitize(email);
    return cleaned.toLowerCase();
};

export const validEmail = (email) => {
    if (typeof email !== "string") return null;
    const emailRegex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length < 254;
};
