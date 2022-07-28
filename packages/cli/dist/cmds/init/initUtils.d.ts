import { SnapManifest, NpmSnapPackageJson } from '@metamask/snap-utils';
import { Arguments } from 'yargs';
import { YargsArgs } from '../../types/yargs';
import { TemplateType } from '../../builders';
/**
 * Initializes a `package.json` file for a Snap project. Will attempt to read
 * and parse the existing file if it already exists, otherwise will intialize
 * a brand new one.
 *
 * @param argv - Yargs arguments object.
 * @returns The contents of the `package.json` file.
 */
export declare function asyncPackageInit(argv: YargsArgs): Promise<Readonly<NpmSnapPackageJson>>;
/**
 * Interactively constructs a Snap manifest file by prompting the user.
 *
 * @param argv - The `yargs` `argv` object.
 * @param packageJson - The `package.json` object.
 * @returns A tuple of the resulting Snap manifest object and a new `argv`
 * object with properties to match the manifest.
 */
export declare function buildSnapManifest(argv: YargsArgs, packageJson: NpmSnapPackageJson): Promise<[SnapManifest, {
    dist: string;
    outfileName: string;
    src: string;
}]>;
/**
 * Checks whether any files in the current working directory will be overwritten
 * by the initialization process, and asks the user whether to continue if so.
 */
export declare function prepareWorkingDirectory(): Promise<void>;
/**
 * In case when TypeScript version is used, default source file
 * will be updated if previous was not correct.
 *
 * @param yargsArgv - The Yargs arguments object.
 * @returns Modified Yargs arguments object.
 */
export declare function correctDefaultArgs(yargsArgv: Arguments): Arguments;
/**
 * Check if template argument is TemplateType.TypeScript.
 *
 * @param templateType - TemplateType value of the template argument passed from CLI.
 * @returns True or false.
 */
export declare function isTemplateTypescript(templateType: TemplateType): boolean;
