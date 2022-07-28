"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serve = void 0;
const http_1 = __importDefault(require("http"));
const serve_handler_1 = __importDefault(require("serve-handler"));
const utils_1 = require("../../utils");
const serveUtils_1 = require("./serveUtils");
/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 *
 * @param argv - Arguments as an object generated by Yargs.
 * @param argv.root - The root directory path string.
 * @param argv.port - The server port.
 */
async function serve(argv) {
    const { port, root: rootDir } = argv;
    await (0, utils_1.validateDirPath)(rootDir, true);
    console.log(`\nStarting server...`);
    const server = http_1.default.createServer(async (req, res) => {
        await (0, serve_handler_1.default)(req, res, {
            public: rootDir,
            headers: [
                {
                    source: '**/*',
                    headers: [
                        {
                            key: 'Cache-Control',
                            value: 'no-cache',
                        },
                        {
                            key: 'Access-Control-Allow-Origin',
                            value: '*',
                        },
                    ],
                },
            ],
        });
    });
    server.listen({ port }, () => (0, serveUtils_1.logServerListening)(port));
    server.on('request', (request) => (0, serveUtils_1.logRequest)(request));
    server.on('error', (error) => {
        (0, serveUtils_1.logServerError)(error, argv.port);
        process.exitCode = 1;
    });
    server.on('close', () => {
        console.log('Server closed');
        process.exitCode = 1;
    });
}
exports.serve = serve;
//# sourceMappingURL=serveHandler.js.map