import { NpmSnapPackageJson, SnapManifest } from '../json-schemas';
declare type GetSnapManifestOptions = Partial<Omit<SnapManifest, 'source'>> & {
    shasum?: string;
    filePath?: string;
    packageName?: string;
    registry?: string;
    iconPath?: string;
};
export declare const DEFAULT_SNAP_BUNDLE = "console.log(\"Hello, world!\");";
export declare const DEFAULT_SNAP_SHASUM = "O4sADgTDj5EP86efVtOEI76NkKZeoKHRzQIlB1j48Lg=";
export declare const DEFAULT_SNAP_ICON = "<svg />";
/**
 * Get the default package repository, in a format compatible with
 * `package.json`.
 *
 * @returns The default package repository.
 */
export declare const getDefaultRepository: () => {
    type: "git";
    url: string;
};
/**
 * Get a mock snap manifest, based on the provided options. This is useful for
 * quickly generating a manifest file, while being able to override any of the
 * values.
 *
 * @param manifest - The optional manifest overrides.
 * @param manifest.version - The version of the snap.
 * @param manifest.description - The description of the snap.
 * @param manifest.proposedName - The proposed name of the snap.
 * @param manifest.initialPermissions - The initial permissions of the snap.
 * @param manifest.shasum - The shasum of the snap.
 * @param manifest.filePath - The path to the snap.
 * @param manifest.packageName - The name of the snap.
 * @param manifest.repository - The repository of the snap.
 * @param manifest.iconPath - The path to the icon of the snap.
 * @returns The snap manifest.
 */
export declare const getSnapManifest: ({ version, description, proposedName, initialPermissions, shasum, filePath, packageName, repository, iconPath, }?: GetSnapManifestOptions) => SnapManifest;
declare type PartialOrNull<T> = {
    [P in keyof T]?: T[P] | undefined | null;
};
/**
 * Get a mock `package.json`, based on the provided options. This is useful for
 * quickly generating a `package.json` file, while being able to override any of
 * the values.
 *
 * @param package - The optional `package.json` overrides.
 * @param package.name - The name of the package.
 * @param package.version - The version of the package.
 * @param package.description - The description of the package.
 * @param package.main - The entry point of the package.
 * @param package.repository - The repository of the package.
 * @returns The `package.json` object.
 */
export declare const getPackageJson: ({ name, version, description, main, repository, }?: PartialOrNull<NpmSnapPackageJson>) => NpmSnapPackageJson;
export {};
