import { NpmSnapFileNames } from '../types';
export { NpmSnapPackageJson } from './NpmSnapPackageJson';
export { SnapManifest } from './SnapManifest';
/**
 * Validates a Snap JSON file. Throws a human-readable list of errors if
 * validation fails.
 *
 * @param fileName - The name of Snap JSON file to validate.
 * @param content - The contents of the file.
 */
export declare function validateSnapJsonFile(fileName: NpmSnapFileNames, content: unknown): void;
