import { Arguments } from 'yargs';
export declare const permRequestKeys: string[];
export declare const CONFIG_FILE = "snap.config.js";
/**
 * Sets global variable snaps which tracks user settings:
 * watch mode activation, verbose errors messages, and whether to suppress
 * warnings.
 *
 * @param argv - Arguments as an object generated by `yargs`.
 */
export declare function setSnapGlobals(argv: Arguments): void;
/**
 * Attempts to convert a string to a boolean and throws if the value is invalid.
 *
 * @param value - The value to convert to a boolean.
 * @returns `true` if the value is the string `"true"`, `false` if it is the
 * string `"false"`, the value if it is already a boolean, or an error
 * otherwise.
 */
export declare function booleanStringToBoolean(value: unknown): boolean;
/**
 * Sanitizes inputs. Currently normalizes "./" paths to ".".
 * Yargs handles other path normalization as specified in builders.
 *
 * @param argv - Arguments as an object generated by yargs.
 */
export declare function sanitizeInputs(argv: Arguments): void;
/**
 * Logs an error message to console. Logs original error if it exists and
 * the verboseErrors global is true.
 *
 * @param msg - The error message.
 * @param err - The original error.
 */
export declare function logError(msg: string, err?: Error): void;
/**
 * Logs a warning message to console.
 *
 * @param msg - The warning message.
 * @param error - The original error.
 */
export declare function logWarning(msg: string, error?: Error): void;
/**
 * Logs an error, attempts to unlink the destination file, and kills the
 * process.
 *
 * @param prefix - The message prefix.
 * @param msg - The error message.
 * @param err - The original error.
 * @param destFilePath - The output file path.
 */
export declare function writeError(prefix: string, msg: string, err: Error, destFilePath?: string): Promise<void>;
/**
 * Trims leading and trailing periods "." and forward slashes "/" from the
 * given path string.
 *
 * @param pathString - The path string to trim.
 * @returns The trimmed path string.
 */
export declare function trimPathString(pathString: string): string;
