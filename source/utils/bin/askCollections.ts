import enquirer from 'enquirer';
import { ScanOptions, MongoScanner, ListDatabasesError, ListCollectionsError } from 'mongo-scanner';

import { ExportedOptions } from '../../interfaces/options';
import { DetailedExportSchema } from '../../interfaces/result';
import { ConnectionParameters } from '../../interfaces/connection';
import { Logger } from '../logger';
import { purgeExportingOptions } from '../getParsedCollections/purgeExportingOptions';

function getWarnMessage(options: ExportedOptions, logger: Logger) {
    if (options.warnIfLackOfPermissions) {
        return (db: string, error: ListDatabasesError | ListCollectionsError) => {
            let message = error instanceof ListCollectionsError 
                ? `MongoBack: cannot list collections of ${db}`
                : 'MongoBack: cannot list databases';
            logger.warn(message, error);
        };
    }
    else {
        return undefined;
    }
}

export async function askCollections(options: ExportedOptions, dbParams: ConnectionParameters, defaultCollections: DetailedExportSchema, logger: Logger, askCollections: boolean): Promise<DetailedExportSchema> {
    if (askCollections) {
        const result: DetailedExportSchema = {};

        const mongoScannerOptions: ScanOptions = {
            useCache: true, 
            excludeSystem: !options.systemCollections,
            ignoreLackOfPermissions: !options.throwIfLackOfPermissions,
            onLackOfPermissions: getWarnMessage(options, logger)
        };
        const mongoScanner = new MongoScanner(dbParams.uri, dbParams.options, mongoScannerOptions);
        const rootOptions = purgeExportingOptions(options);

        const initialDatabases = Object.keys(defaultCollections);
        const allDatabases = (await mongoScanner.listDatabases()).sort();
        const selectedDatabases: string[] = (await enquirer.prompt({
            type: 'autocomplete',
            name: 'databases',
            message: 'Select the databases that you want to export',
            choices: allDatabases,
            initial: initialDatabases,
            multiple: true
        } as any))['databases'];
        
        for (const db of selectedDatabases) {
            const initialCollections = defaultCollections[db] ? defaultCollections[db] : [];
            const allCollections = (await mongoScanner.listCollections(db)).sort();
            const selectedCollections: string[] = (await enquirer.prompt({
                type: 'autocomplete',
                name: 'collections',
                message: `Select the collections of ${db} that you want to export`,
                choices: allCollections,
                initial: initialCollections.map(collection => collection.name),
                multiple: true
            } as any))['collections'];
            
            result[db] = selectedCollections
                .map(name => initialCollections.find(collection => collection.name === name) || { name, ...rootOptions });
        }

        return result;
    }
    else {
        return defaultCollections;
    }    
}