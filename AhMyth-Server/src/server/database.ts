import { resolve } from 'path';
import Container from 'typedi';
import { DataSource } from 'typeorm';

import { config } from './config';
import * as entities from './entities';
import { logger, TypeORMLogger } from './logger';

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: resolve(process.cwd(), config.SQLITE_FILE),
    entities: Object.values(entities),
    logger: new TypeORMLogger(),
    synchronize: true,
});

Container.set(DataSource, AppDataSource);

export const setupDatabase = async (): Promise<DataSource | null> => {
    try {
        logger.verbose('Setting up database...', {
            label: 'server',
            action: 'start',
        });

        const dataSource = await AppDataSource.initialize();

        logger.info('Database setup complete!', {
            label: 'server',
            action: 'start',
        });

        return dataSource;
    } catch (error) {
        logger.error('Database setup failed!', {
            label: 'server',
            action: 'start',
            error,
        });
    }

    return null;
};
