/**
 * The various log modes
 */
export type LogType = 'base' | 'command' | 'mongoexport' | 'expectedCollections' | 'actualCollections';
/**
 * An array of [[LogType]]
 */
export type LogTypes = LogType[];

/**
 * The options about what will be logged during the function execution
 */
export interface LogOptions {
    /**
     * If nothing will be logged.
     * 
     * Default: false
     */
    silent?: boolean;
    /**
     * The log modes. If there are more than on modes, they must be specified in an array.
     * 
     * Possible values:
     * - 'base': During exporting, the databases and collections are shown with a spinner.
     * - 'command': Logs the mongoexport command
     * - 'mongoexport': Logs the mongoexport log
     * - 'expectedCollections': Logs the object containing the collections expected to be exported
     * - 'actualCollections': Logs the object containing the collections that have actually been exported
     * 
     * Default: ['base']
     */
    log?: LogTypes | LogType;
}