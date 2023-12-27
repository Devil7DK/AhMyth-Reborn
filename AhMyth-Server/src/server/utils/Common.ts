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
