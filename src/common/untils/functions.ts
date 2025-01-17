export const createSlug = (text: string) => {
    return text
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
}
export const randomId = () => {
    return Math.random().toString(36).substring(2);
}