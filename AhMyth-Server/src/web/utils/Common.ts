export function bufferToDataUrl(
    buffer: Buffer,
    mime: string = 'image/jpeg',
): string {
    return `data:${mime};base64,${buffer.toString('base64')}`;
}
