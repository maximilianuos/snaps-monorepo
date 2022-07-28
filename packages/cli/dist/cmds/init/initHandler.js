"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManifestShasum = exports.initHandler = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const snap_utils_1 = require("@metamask/snap-utils");
const mkdirp_1 = __importDefault(require("mkdirp"));
const utils_1 = require("../../utils");
const init_template_json_1 = __importDefault(require("./init-template.json"));
const initUtils_1 = require("./initUtils");
/**
 * Creates a new snap package, based on one of the provided templates. This
 * creates all the necessary files, like `package.json`, `snap.config.js`, etc.
 * to start developing a snap.
 *
 * @param argv - The Yargs arguments object.
 * @returns The Yargs arguments augmented with the new `dist`, `outfileName` and
 * `src` properties.
 * @throws If initialization of the snap package failed.
 */
async function initHandler(argv) {
    console.log(`MetaMask Snaps: Initialize\n`);
    const packageJson = await (0, initUtils_1.asyncPackageInit)(argv);
    await (0, initUtils_1.prepareWorkingDirectory)();
    console.log(`\nInit: Building '${snap_utils_1.NpmSnapFileNames.Manifest}'...\n`);
    const [snapManifest, _newArgs] = await (0, initUtils_1.buildSnapManifest)(argv, packageJson);
    const newArgs = Object.keys(_newArgs)
        .sort()
        .reduce((sorted, key) => {
        sorted[key] = _newArgs[key];
        return sorted;
    }, {});
    const isTypeScript = (0, initUtils_1.isTemplateTypescript)(argv.template);
    try {
        await fs_1.promises.writeFile(snap_utils_1.NpmSnapFileNames.Manifest, `${JSON.stringify(snapManifest, null, 2)}\n`);
    }
    catch (err) {
        (0, utils_1.logError)(`Init Error: Failed to write '${snap_utils_1.NpmSnapFileNames.Manifest}'.`, err);
        throw err;
    }
    console.log(`\nInit: Created '${snap_utils_1.NpmSnapFileNames.Manifest}'.`);
    // Write main .js entry file
    const { src } = newArgs;
    try {
        if (path_1.default.basename(src) !== src) {
            await (0, mkdirp_1.default)(path_1.default.dirname(src));
        }
        await fs_1.promises.writeFile(src, isTypeScript ? init_template_json_1.default.typescriptSource : init_template_json_1.default.source);
        console.log(`Init: Created '${src}'.`);
    }
    catch (err) {
        (0, utils_1.logError)(`Init Error: Failed to write '${src}'.`, err);
        throw err;
    }
    // Write index.html
    try {
        await fs_1.promises.writeFile('index.html', isTypeScript ? init_template_json_1.default.typescriptHtml : init_template_json_1.default.html);
        console.log(`Init: Created 'index.html'.`);
    }
    catch (err) {
        (0, utils_1.logError)(`Init Error: Failed to write 'index.html'.`, err);
        throw err;
    }
    // Write tsconfig.json
    if (isTypeScript) {
        try {
            await fs_1.promises.writeFile('tsconfig.json', init_template_json_1.default.typescriptConfig);
            console.log(`Init: Created 'tsconfig.json'.`);
        }
        catch (err) {
            (0, utils_1.logError)(`Init Error: Failed to write 'tsconfig.json'.`, err);
            throw err;
        }
    }
    // Write config file
    try {
        const defaultConfig = {
            cliOptions: newArgs,
        };
        const defaultConfigFile = `module.exports = ${JSON.stringify(defaultConfig, null, 2)}
    `;
        await fs_1.promises.writeFile(utils_1.CONFIG_FILE, defaultConfigFile);
        console.log(`Init: Wrote '${utils_1.CONFIG_FILE}' config file`);
    }
    catch (err) {
        (0, utils_1.logError)(`Init Error: Failed to write '${utils_1.CONFIG_FILE}'.`, err);
        throw err;
    }
    // Write icon
    const iconPath = 'images/icon.svg';
    try {
        if (path_1.default.basename(iconPath) !== iconPath) {
            await (0, mkdirp_1.default)(path_1.default.dirname(iconPath));
        }
        await fs_1.promises.writeFile(iconPath, init_template_json_1.default.icon);
        console.log(`Init: Created '${iconPath}'.`);
    }
    catch (err) {
        (0, utils_1.logError)(`Init Error: Failed to write '${iconPath}'.`, err);
        throw err;
    }
    (0, utils_1.closePrompt)();
    return Object.assign(Object.assign({}, argv), newArgs);
}
exports.initHandler = initHandler;
/**
 * This updates the Snap shasum value of the manifest after building the Snap
 * during the init command.
 */
async function updateManifestShasum() {
    const manifest = await (0, snap_utils_1.readJsonFile)(snap_utils_1.NpmSnapFileNames.Manifest);
    const bundleContents = await fs_1.promises.readFile(manifest.source.location.npm.filePath, 'utf8');
    manifest.source.shasum = (0, snap_utils_1.getSnapSourceShasum)(bundleContents);
    await fs_1.promises.writeFile(snap_utils_1.NpmSnapFileNames.Manifest, JSON.stringify((0, snap_utils_1.getWritableManifest)(manifest), null, 2));
}
exports.updateManifestShasum = updateManifestShasum;
//# sourceMappingURL=initHandler.js.map