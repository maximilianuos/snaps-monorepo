"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDirPath = exports.validateFilePath = exports.validateOutfileName = exports.getOutfilePath = void 0;
const path_1 = __importDefault(require("path"));
const snap_utils_1 = require("@metamask/snap-utils");
/**
 * Gets the complete out file path from an output file name and parent
 * directory path.
 *
 * @param outDir - The path to the out file's parent directory.
 * @param outFileName - The out file's name.
 * @returns The complete path to the out file.
 */
function getOutfilePath(outDir, outFileName) {
    return path_1.default.join(outDir, outFileName || 'bundle.js');
}
exports.getOutfilePath = getOutfilePath;
/**
 * Ensures that the outfile name is just a `.js` file name.
 * Throws on validation failure.
 *
 * @param filename - The file name to validate.
 * @returns `true` if validation succeeded.
 * @throws If the file name is invalid.
 */
function validateOutfileName(filename) {
    if (!filename.endsWith('.js') ||
        filename === '.js' ||
        filename.indexOf('/') !== -1) {
        throw new Error(`Invalid outfile name: ${filename}. Must be a .js file`);
    }
    return true;
}
exports.validateOutfileName = validateOutfileName;
/**
 * Validates a file path. Throws on validation failure.
 *
 * @param filePath - The file path to validate.
 * @returns `true` if validation succeeded.
 * @throws If the path does not resolve to a file.
 */
async function validateFilePath(filePath) {
    const exists = await (0, snap_utils_1.isFile)(filePath);
    if (!exists) {
        throw new Error(`Invalid params: '${filePath}' is not a file or does not exist.`);
    }
    return true;
}
exports.validateFilePath = validateFilePath;
/**
 * Validates a directory path. Throws on validation failure.
 *
 * @param dirPath - The directory path to validate.
 * @param createDir - Whether to create the directory if it doesn't exist.
 * @returns `true` if validation succeeded or the directory was created.
 * @throws If the directory does not exist or could not be created.
 */
async function validateDirPath(dirPath, createDir) {
    const exists = await (0, snap_utils_1.isDirectory)(dirPath, createDir);
    if (!exists) {
        throw new Error(`Invalid params: '${dirPath}' is not a directory or could not be created.`);
    }
    return true;
}
exports.validateDirPath = validateDirPath;
//# sourceMappingURL=validate-fs.js.map