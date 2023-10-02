export const evaluateRegex = (text: string, pattern: any): boolean => {
    const re = new RegExp(pattern);
    return re.test(text);
}

export const cleanText = (text: string): string => {
    return text.toString().trim();
}