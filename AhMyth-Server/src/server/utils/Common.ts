import { existsSync } from 'fs';
import { join } from 'path';

import { config } from '../config';

export function timeConversion(duration: number): string {
    const portions = [];

    const hours = Math.trunc(duration / 3600000);
    if (hours > 0) {
        portions.push(hours + 'h');
        duration = duration - hours * 3600000;
    }

    const minutes = Math.trunc(duration / 60000);
    if (minutes > 0) {
        portions.push(minutes + 'm');
        duration = duration - minutes * 60000;
    }

    const seconds = duration / 1000;
    if (seconds > 0) {
        portions.push(seconds.toFixed(2) + 's');
    }

    return portions.join(' ');
}

/**
 * Parse size string to bytes
 *
 * @param size Size string e.g. 1.5GB, 1 GB, 1mb, 2kb, 3b
 */
export function parseSize(size: string): number {
    const sizeRegex = /^(\d+(?:\.\d+)?)\s*([a-z]*)$/i;
    const sizeMatch = sizeRegex.exec(size);

    if (sizeMatch === null) {
        throw new Error('Invalid size');
    }

    const sizeValue = parseFloat(sizeMatch[1]);
    const sizeUnit = sizeMatch[2].toLowerCase();

    const sizeUnits: Record<string, number> = {
        b: 1,
        kb: 1024,
        mb: 1024 * 1024,
        gb: 1024 * 1024 * 1024,
    };

    if (sizeUnits[sizeUnit] === undefined) {
        throw new Error('Invalid size unit');
    }

    return sizeValue * sizeUnits[sizeUnit];
}

/**
 * Parse duration string to milliseconds
 *
 * @param duration Duration string e.g. 1h 30m 10s, 1h 30m, 1h, 30m, 10s
 */
export function parseDuration(duration: string): number {
    const durationRegex = /(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i;
    const durationMatch = durationRegex.exec(duration);

    if (durationMatch === null) {
        throw new Error('Invalid duration');
    }

    const hours =
        durationMatch[1] === undefined ? 0 : parseInt(durationMatch[1]);
    const minutes =
        durationMatch[2] === undefined ? 0 : parseInt(durationMatch[2]);
    const seconds =
        durationMatch[3] === undefined ? 0 : parseInt(durationMatch[3]);

    return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

export function getPublicDir(): string {
    const publicDirs = [
        join(process.cwd(), 'dist', 'public'),
        join(__dirname, '..', 'public'),
        join(process.cwd(), 'public'),
    ];

    for (let i = 0; i < publicDirs.length; i++) {
        if (existsSync(join(publicDirs[i], 'index.html'))) {
            return publicDirs[i];
        }
    }

    return config.isProduction
        ? join(process.cwd(), 'public')
        : join(process.cwd(), 'dist', 'public');
}
