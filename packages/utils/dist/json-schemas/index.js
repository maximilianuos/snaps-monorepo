"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSnapJsonFile = void 0;
const types_1 = require("../types");
const validateNpmSnapPackageJson_js_1 = __importDefault(require("./validateNpmSnapPackageJson.js"));
const validateSnapManifest_js_1 = __importDefault(require("./validateSnapManifest.js"));
/**
 * Validates a Snap JSON file. Throws a human-readable list of errors if
 * validation fails.
 *
 * @param fileName - The name of Snap JSON file to validate.
 * @param content - The contents of the file.
 */
function validateSnapJsonFile(fileName, content) {
    let errors;
    switch (fileName) {
        case types_1.NpmSnapFileNames.Manifest:
            if (content && typeof content === 'object' && !Array.isArray(content)) {
                if (content.repository === undefined) {
                    // We do this to allow consumers to omit this field. We cannot omit
                    // it internally due to TS@<4.4 limitations.
                    content.repository = null;
                }
            }
            errors = (0, validateSnapManifest_js_1.default)(content);
            break;
        case types_1.NpmSnapFileNames.PackageJson:
            errors = (0, validateNpmSnapPackageJson_js_1.default)(content);
            break;
        default:
            throw new Error(`Unrecognized file name "${fileName}".`);
    }
    if (errors && errors.length !== 0) {
        throw new Error(`${errors
            .reduce((allErrors, errorObject = {}) => {
            const { instancePath, message = 'unknown error' } = errorObject;
            const currentString = instancePath
                ? `\t${instancePath}\n\t${message}\n\n`
                : `\t${message}\n\n`;
            return `${allErrors}${currentString}`;
        }, '')
            .replace(/\n$/u, '')}`);
    }
}
exports.validateSnapJsonFile = validateSnapJsonFile;
//# sourceMappingURL=index.js.map