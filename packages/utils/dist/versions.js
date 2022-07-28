"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidSnapVersionRange = exports.resolveVersion = exports.getTargetVersion = exports.satifiesVersionRange = exports.gtVersion = exports.DEFAULT_REQUESTED_SNAP_VERSION = void 0;
const semver_1 = require("semver");
exports.DEFAULT_REQUESTED_SNAP_VERSION = '*';
/**
 * Checks whether a SemVer version is greater than another.
 *
 * @param version1 - The left-hand version.
 * @param version2 - The right-hand version.
 * @returns `version1 > version2`.
 */
function gtVersion(version1, version2) {
    return (0, semver_1.gt)(version1, version2, { includePrerelease: true });
}
exports.gtVersion = gtVersion;
/**
 * Returns whether a SemVer version satisfies a SemVer range.
 *
 * @param version - The SemVer version to check.
 * @param versionRange - The SemVer version range to check against.
 * @returns Whether the version satisfied the version range.
 */
function satifiesVersionRange(version, versionRange) {
    return (0, semver_1.satisfies)(version, versionRange, {
        includePrerelease: true,
    });
}
exports.satifiesVersionRange = satifiesVersionRange;
/**
 * Return the highest version in the list that satisfies the range, or `null` if
 * none of them do. For the satisfaction check, pre-release versions will only
 * be checked if no satisfactory non-prerelease version is found first.
 *
 * @param versions - The list of version to check.
 * @param versionRange - The SemVer version range to check against.
 * @returns The highest version in the list that satisfies the range,
 * or `null` if none of them do.
 */
function getTargetVersion(versions, versionRange) {
    const maxSatisfyingNonPreRelease = (0, semver_1.maxSatisfying)(versions, versionRange);
    // By default don't use pre-release versions
    if (maxSatisfyingNonPreRelease) {
        return maxSatisfyingNonPreRelease;
    }
    // If no satisfying release version is found by default, try pre-release versions
    return (0, semver_1.maxSatisfying)(versions, versionRange, {
        includePrerelease: true,
    });
}
exports.getTargetVersion = getTargetVersion;
/**
 * Parse a version received by some subject attempting to access a snap.
 *
 * @param version - The received version value.
 * @returns `*` if the version is `undefined` or `latest", otherwise returns
 * the specified version.
 */
function resolveVersion(version) {
    if (version === undefined || version === 'latest') {
        return exports.DEFAULT_REQUESTED_SNAP_VERSION;
    }
    return version;
}
exports.resolveVersion = resolveVersion;
/**
 * Checks whether a SemVer version range is valid.
 *
 * @param versionRange - A potential version range.
 * @returns `true` if the version range is valid, and `false` otherwise.
 */
function isValidSnapVersionRange(versionRange) {
    return Boolean(typeof versionRange === 'string' &&
        (0, semver_1.validRange)(versionRange, { includePrerelease: true }) !== null);
}
exports.isValidSnapVersionRange = isValidSnapVersionRange;
//# sourceMappingURL=versions.js.map