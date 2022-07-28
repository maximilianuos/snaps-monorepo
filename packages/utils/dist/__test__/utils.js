"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageJson = exports.getSnapManifest = exports.getDefaultRepository = exports.DEFAULT_SNAP_ICON = exports.DEFAULT_SNAP_SHASUM = exports.DEFAULT_SNAP_BUNDLE = void 0;
// A fake Snap source and its shasum.
exports.DEFAULT_SNAP_BUNDLE = 'console.log("Hello, world!");';
exports.DEFAULT_SNAP_SHASUM = 'O4sADgTDj5EP86efVtOEI76NkKZeoKHRzQIlB1j48Lg=';
exports.DEFAULT_SNAP_ICON = '<svg />';
/**
 * Get the default package repository, in a format compatible with
 * `package.json`.
 *
 * @returns The default package repository.
 */
const getDefaultRepository = () => {
    return {
        type: 'git',
        url: 'https://github.com/MetaMask/example-snap.git',
    };
};
exports.getDefaultRepository = getDefaultRepository;
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
const getSnapManifest = ({ version = '1.0.0', description = 'The test example snap!', proposedName = '@metamask/example-snap', initialPermissions = { snap_confirm: {} }, shasum = exports.DEFAULT_SNAP_SHASUM, filePath = 'dist/bundle.js', packageName = '@metamask/example-snap', repository = (0, exports.getDefaultRepository)(), iconPath = 'images/icon.svg', } = {}) => {
    return {
        version,
        description,
        proposedName,
        repository,
        source: {
            shasum,
            location: {
                npm: {
                    filePath,
                    packageName,
                    registry: 'https://registry.npmjs.org',
                    iconPath,
                },
            },
        },
        initialPermissions,
        manifestVersion: '0.1',
    };
};
exports.getSnapManifest = getSnapManifest;
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
const getPackageJson = ({ name = '@metamask/example-snap', version = '1.0.0', description = 'The test example snap!', main = 'src/index.js', repository = (0, exports.getDefaultRepository)(), } = {}) => {
    return Object.entries({
        name,
        version,
        description,
        main,
        repository,
    }).reduce((packageJson, [key, value]) => {
        if (value) {
            packageJson[key] = value;
        }
        return packageJson;
    }, {});
};
exports.getPackageJson = getPackageJson;
//# sourceMappingURL=utils.js.map