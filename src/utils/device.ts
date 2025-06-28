export const GetPlatformFromUserAgent = (userAgent: string = ''): string => {
    const ua = userAgent.toLowerCase();

    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('android')) return 'android';
    if (ua.includes('windows')) return 'windows';
    if (ua.includes('macintosh')) return 'macos';
    if (ua.includes('linux')) return 'linux';

    return 'web';
};