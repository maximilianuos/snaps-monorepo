"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWritableManifest = exports.getSnapSourceCode = exports.fixManifest = exports.checkManifest = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const npm_1 = require("./npm");
const types_1 = require("./types");
const fs_2 = require("./fs");
const snaps_1 = require("./snaps");
const deep_clone_1 = require("./deep-clone");
const MANIFEST_SORT_ORDER = {
    version: 1,
    description: 2,
    proposedName: 3,
    repository: 4,
    source: 5,
    initialPermissions: 6,
    manifestVersion: 7,
};
/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param writeManifest - Whether to write the fixed manifest to disk.
 * @returns Whether the manifest was updated, and an array of warnings that
 * were encountered during processing of the manifest files.
 */
async function checkManifest(basePath, writeManifest = true) {
    var _a, _b, _c;
    const warnings = [];
    const errors = [];
    let updated = false;
    const unvalidatedManifest = await (0, fs_2.readSnapJsonFile)(basePath, types_1.NpmSnapFileNames.Manifest);
    const iconPath = unvalidatedManifest && typeof unvalidatedManifest === 'object'
        ? /* istanbul ignore next */
            (_c = (_b = (_a = unvalidatedManifest.source) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.npm) === null || _c === void 0 ? void 0 : _c.iconPath
        : /* istanbul ignore next */
            undefined;
    const snapFiles = {
        manifest: unvalidatedManifest,
        packageJson: await (0, fs_2.readSnapJsonFile)(basePath, types_1.NpmSnapFileNames.PackageJson),
        sourceCode: await getSnapSourceCode(basePath, unvalidatedManifest),
        svgIcon: iconPath &&
            (await fs_1.promises.readFile(path_1.default.join(basePath, iconPath), 'utf8')),
    };
    let manifest;
    try {
        ({ manifest } = (0, npm_1.validateNpmSnap)(snapFiles));
    }
    catch (error) {
        if (error instanceof snaps_1.ProgrammaticallyFixableSnapError) {
            errors.push(error.message);
            // If we get here, the files at least have the correct shape.
            const partiallyValidatedFiles = snapFiles;
            let isInvalid = true;
            let currentError = error;
            const maxAttempts = Object.keys(types_1.SnapValidationFailureReason).length;
            // Attempt to fix all fixable validation failure reasons. All such reasons
            // are enumerated by the `SnapValidationFailureReason` enum, so we only
            // attempt to fix the manifest the same amount of times as there are
            // reasons in the enum.
            for (let attempts = 1; isInvalid && attempts <= maxAttempts; attempts++) {
                manifest = fixManifest(manifest
                    ? Object.assign(Object.assign({}, partiallyValidatedFiles), { manifest }) : partiallyValidatedFiles, currentError);
                try {
                    (0, npm_1.validateNpmSnapManifest)(Object.assign(Object.assign({}, partiallyValidatedFiles), { manifest }));
                    isInvalid = false;
                }
                catch (nextValidationError) {
                    currentError = nextValidationError;
                    /* istanbul ignore next: this should be impossible */
                    if (!(nextValidationError instanceof snaps_1.ProgrammaticallyFixableSnapError) ||
                        (attempts === maxAttempts && !isInvalid)) {
                        throw new Error(`Internal error: Failed to fix manifest. This is a bug, please report it. Reason:\n${error.message}`);
                    }
                    errors.push(currentError.message);
                }
            }
            updated = true;
        }
        else {
            throw error;
        }
    }
    // TypeScript doesn't see that the 'manifest' variable must be of type
    // SnapManifest at this point, so we cast it.
    const validatedManifest = manifest;
    // Check presence of recommended keys
    const recommendedFields = ['repository'];
    const missingRecommendedFields = recommendedFields.filter((key) => !validatedManifest[key]);
    if (missingRecommendedFields.length > 0) {
        warnings.push(`Missing recommended package.json properties:\n${missingRecommendedFields.reduce((allMissing, currentField) => {
            return `${allMissing}\t${currentField}\n`;
        }, '')}`);
    }
    if (writeManifest) {
        try {
            await fs_1.promises.writeFile(path_1.default.join(basePath, types_1.NpmSnapFileNames.Manifest), `${JSON.stringify(getWritableManifest(validatedManifest), null, 2)}\n`);
        }
        catch (error) {
            // Note: This error isn't pushed to the errors array, because it's not an
            // error in the manifest itself.
            throw new Error(`Failed to update snap.manifest.json: ${error.message}`);
        }
    }
    return { manifest: validatedManifest, updated, warnings, errors };
}
exports.checkManifest = checkManifest;
/**
 * Given the relevant Snap files (manifest, `package.json`, and bundle) and a
 * Snap manifest validation error, fixes the fault in the manifest that caused
 * the error.
 *
 * @param snapFiles - The contents of all Snap files.
 * @param error - The {@link ProgrammaticallyFixableSnapError} that was thrown.
 * @returns A copy of the manifest file where the cause of the error is fixed.
 */
function fixManifest(snapFiles, error) {
    const { manifest, packageJson, sourceCode } = snapFiles;
    const manifestCopy = (0, deep_clone_1.deepClone)(manifest);
    switch (error.reason) {
        case types_1.SnapValidationFailureReason.NameMismatch:
            manifestCopy.source.location.npm.packageName = packageJson.name;
            break;
        case types_1.SnapValidationFailureReason.VersionMismatch:
            manifestCopy.version = packageJson.version;
            break;
        case types_1.SnapValidationFailureReason.RepositoryMismatch:
            manifestCopy.repository = packageJson.repository
                ? (0, deep_clone_1.deepClone)(packageJson.repository)
                : null;
            break;
        case types_1.SnapValidationFailureReason.ShasumMismatch:
            manifestCopy.source.shasum = (0, snaps_1.getSnapSourceShasum)(sourceCode);
            break;
        /* istanbul ignore next */
        default:
            // eslint-disable-next-line no-case-declarations
            const failureReason = error.reason;
            throw new Error(`Unrecognized validation failure reason: '${failureReason}'`);
    }
    return manifestCopy;
}
exports.fixManifest = fixManifest;
/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * bundle source file location and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @returns The contents of the bundle file, if any.
 */
async function getSnapSourceCode(basePath, manifest) {
    var _a, _b, _c;
    if (manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
        const sourceFilePath = (_c = (_b = (_a = manifest.source) === null || _a === void 0 ? void 0 : _a.location) === null || _b === void 0 ? void 0 : _b.npm) === null || _c === void 0 ? void 0 : _c.filePath;
        try {
            return sourceFilePath
                ? await fs_1.promises.readFile(path_1.default.join(basePath, sourceFilePath), 'utf8')
                : undefined;
        }
        catch (error) {
            throw new Error(`Failed to read Snap bundle file: ${error.message}`);
        }
    }
    return undefined;
}
exports.getSnapSourceCode = getSnapSourceCode;
/**
 * Sorts the given manifest in our preferred sort order and removes the
 * `repository` field if it is falsy (it may be `null`).
 *
 * @param manifest - The manifest to sort and modify.
 * @returns The disk-ready manifest.
 */
function getWritableManifest(manifest) {
    const { repository } = manifest, remaining = __rest(manifest, ["repository"]);
    const keys = Object.keys(repository ? Object.assign(Object.assign({}, remaining), { repository }) : remaining);
    return keys
        .sort((a, b) => MANIFEST_SORT_ORDER[a] - MANIFEST_SORT_ORDER[b])
        .reduce((result, key) => (Object.assign(Object.assign({}, result), { [key]: manifest[key] })), {});
}
exports.getWritableManifest = getWritableManifest;
//# sourceMappingURL=manifest.js.map