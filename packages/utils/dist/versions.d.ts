import { Json } from '@metamask/utils';
export declare const DEFAULT_REQUESTED_SNAP_VERSION = "*";
/**
 * Checks whether a SemVer version is greater than another.
 *
 * @param version1 - The left-hand version.
 * @param version2 - The right-hand version.
 * @returns `version1 > version2`.
 */
export declare function gtVersion(version1: string, version2: string): boolean;
/**
 * Returns whether a SemVer version satisfies a SemVer range.
 *
 * @param version - The SemVer version to check.
 * @param versionRange - The SemVer version range to check against.
 * @returns Whether the version satisfied the version range.
 */
export declare function satifiesVersionRange(version: string, versionRange: string): boolean;
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
export declare function getTargetVersion(versions: string[], versionRange: string): string | null;
/**
 * Parse a version received by some subject attempting to access a snap.
 *
 * @param version - The received version value.
 * @returns `*` if the version is `undefined` or `latest", otherwise returns
 * the specified version.
 */
export declare function resolveVersion(version?: Json): Json;
/**
 * Checks whether a SemVer version range is valid.
 *
 * @param versionRange - A potential version range.
 * @returns `true` if the version range is valid, and `false` otherwise.
 */
export declare function isValidSnapVersionRange(versionRange: unknown): versionRange is string;
