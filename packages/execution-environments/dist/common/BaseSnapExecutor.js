"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSnapExecutor = void 0;
const providers_1 = require("@metamask/providers");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const openrpc_json_1 = __importDefault(require("../openrpc.json"));
const openrpc_guard_1 = require("../__GENERATED__/openrpc.guard");
const endowments_1 = require("./endowments");
const commands_1 = require("./commands");
const globalEvents_1 = require("./globalEvents");
const sortParams_1 = require("./sortParams");
const utils_1 = require("./utils");
const fallbackError = {
    code: eth_rpc_errors_1.errorCodes.rpc.internal,
    message: 'Execution Environment Error',
};
class BaseSnapExecutor {
    constructor(commandStream, rpcStream) {
        this.snapData = new Map();
        this.commandStream = commandStream;
        this.commandStream.on('data', this.onCommandRequest.bind(this));
        this.rpcStream = rpcStream;
        this.methods = (0, commands_1.getCommandMethodImplementations)(this.startSnap.bind(this), (target, origin, request) => {
            var _a;
            const data = this.snapData.get(target);
            if (((_a = data === null || data === void 0 ? void 0 : data.exports) === null || _a === void 0 ? void 0 : _a.onRpcRequest) === undefined) {
                throw new Error(`No onRpcRequest handler exported for snap "${target}`);
            }
            // We're capturing the handler in case someone modifies the data object before the call
            const handler = data.exports.onRpcRequest;
            return this.executeInSnapContext(target, () => handler({ origin, request }));
        }, this.onTerminate.bind(this));
    }
    errorHandler(error, data) {
        const constructedError = (0, utils_1.constructError)(error);
        const serializedError = (0, eth_rpc_errors_1.serializeError)(constructedError, {
            fallbackError,
            shouldIncludeStack: false,
        });
        this.notify({
            method: 'UnhandledError',
            params: {
                error: Object.assign(Object.assign({}, serializedError), { data: Object.assign(Object.assign({}, data), { stack: constructedError === null || constructedError === void 0 ? void 0 : constructedError.stack }) }),
            },
        });
    }
    async onCommandRequest(message) {
        if (!(0, openrpc_guard_1.isJsonRpcRequest)(message)) {
            throw new Error('Command stream received a non Json Rpc Request');
        }
        const { id, method, params } = message;
        if (id === undefined) {
            throw new Error('Notifications not supported');
        }
        if (method === 'rpc.discover') {
            this.respond(id, {
                result: openrpc_json_1.default,
            });
            return;
        }
        const methodObject = openrpc_json_1.default.methods.find((m) => m.name === method);
        if (!methodObject || !this.methods[method]) {
            this.respond(id, {
                error: eth_rpc_errors_1.ethErrors.rpc
                    .methodNotFound({
                    data: {
                        method,
                    },
                })
                    .serialize(),
            });
            return;
        }
        // support params by-name and by-position
        const paramsAsArray = (0, sortParams_1.sortParamKeys)(methodObject, params);
        try {
            const result = await this.methods[method](...paramsAsArray);
            this.respond(id, { result });
        }
        catch (e) {
            this.respond(id, {
                error: (0, eth_rpc_errors_1.serializeError)(e, {
                    fallbackError,
                }),
            });
        }
    }
    notify(requestObject) {
        this.commandStream.write(Object.assign(Object.assign({}, requestObject), { jsonrpc: '2.0' }));
    }
    respond(id, responseObj) {
        this.commandStream.write(Object.assign(Object.assign({}, responseObj), { id, jsonrpc: '2.0' }));
    }
    /**
     * Attempts to evaluate a snap in SES. Generates APIs for the snap. May throw
     * on errors.
     *
     * @param snapName - The name of the snap.
     * @param sourceCode - The source code of the snap, in IIFE format.
     * @param _endowments - An array of the names of the endowments.
     */
    async startSnap(snapName, sourceCode, _endowments) {
        console.log(`starting snap '${snapName}' in worker`);
        if (this.snapPromiseErrorHandler) {
            (0, globalEvents_1.removeEventListener)('unhandledrejection', this.snapPromiseErrorHandler);
        }
        if (this.snapErrorHandler) {
            (0, globalEvents_1.removeEventListener)('error', this.snapErrorHandler);
        }
        this.snapErrorHandler = (error) => {
            this.errorHandler(error.error, { snapName });
        };
        this.snapPromiseErrorHandler = (error) => {
            this.errorHandler(error instanceof Error ? error : error.reason, {
                snapName,
            });
        };
        const wallet = this.createSnapProvider();
        // We specifically use any type because the Snap can modify the object any way they want
        const snapModule = { exports: {} };
        try {
            const { endowments, teardown: endowmentTeardown } = (0, endowments_1.createEndowments)(wallet, _endowments);
            // !!! Ensure that this is the only place the data is being set.
            // Other methods access the object value and mutate its properties.
            this.snapData.set(snapName, {
                idleTeardown: endowmentTeardown,
                runningEvaluations: new Set(),
                exports: {},
            });
            (0, globalEvents_1.addEventListener)('unhandledRejection', this.snapPromiseErrorHandler);
            (0, globalEvents_1.addEventListener)('error', this.snapErrorHandler);
            const compartment = new Compartment(Object.assign(Object.assign({}, endowments), { module: snapModule, exports: snapModule.exports, window: Object.assign({}, endowments), self: Object.assign({}, endowments) }));
            await this.executeInSnapContext(snapName, () => {
                compartment.evaluate(sourceCode);
                this.registerSnapExports(snapName, snapModule);
            });
        }
        catch (err) {
            this.removeSnap(snapName);
            throw new Error(`Error while running snap '${snapName}': ${err.message}`);
        }
    }
    /**
     * Cancels all running evaluations of all snaps and clears all snap data.
     * NOTE:** Should only be called in response to the `terminate` RPC command.
     */
    onTerminate() {
        // `stop()` tears down snap endowments.
        // Teardown will also be run for each snap as soon as there are
        // no more running evaluations for that snap.
        this.snapData.forEach((data) => data.runningEvaluations.forEach((evaluation) => evaluation.stop()));
        this.snapData.clear();
    }
    registerSnapExports(snapName, snapModule) {
        var _a;
        if (typeof ((_a = snapModule === null || snapModule === void 0 ? void 0 : snapModule.exports) === null || _a === void 0 ? void 0 : _a.onRpcRequest) === 'function') {
            const data = this.snapData.get(snapName);
            // Somebody deleted the Snap before we could register
            if (data !== undefined) {
                console.log('Worker: Registering RPC message handler', snapModule.exports.onRpcRequest);
                data.exports = Object.assign(Object.assign({}, data.exports), { onRpcRequest: snapModule.exports.onRpcRequest });
            }
        }
    }
    /**
     * Instantiates a snap provider object (i.e. `globalThis.wallet`).
     *
     * @returns The snap provider object.
     */
    createSnapProvider() {
        const provider = new providers_1.MetaMaskInpageProvider(this.rpcStream, {
            shouldSendMetadata: false,
        });
        const originalRequest = provider.request;
        provider.request = async (args) => {
            this.notify({ method: 'OutboundRequest' });
            try {
                return await originalRequest(args);
            }
            finally {
                this.notify({ method: 'OutboundResponse' });
            }
        };
        return provider;
    }
    /**
     * Removes the snap with the given name.
     *
     * @param snapName - The name of the snap to remove.
     */
    removeSnap(snapName) {
        this.snapData.delete(snapName);
    }
    /**
     * Calls the specified executor function in the context of the specified snap.
     * Essentially, this means that the operation performed by the executor is
     * counted as an evaluation of the specified snap. When the count of running
     * evaluations of a snap reaches zero, its endowments are torn down.
     *
     * @param snapName - The name of the snap whose context to execute in.
     * @param executor - The function that will be executed in the snap's context.
     * @returns The executor's return value.
     * @template Result - The return value of the executor.
     */
    async executeInSnapContext(snapName, executor) {
        const data = this.snapData.get(snapName);
        if (data === undefined) {
            throw new Error(`Tried to execute in context of unknown snap: "${snapName}".`);
        }
        let stop;
        const stopPromise = new Promise((_, reject) => (stop = () => reject(
        // TODO(rekmarks): Specify / standardize error code for this case.
        eth_rpc_errors_1.ethErrors.rpc.internal(`The snap "${snapName}" has been terminated during execution.`))));
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const evaluationData = { stop: stop };
        try {
            data.runningEvaluations.add(evaluationData);
            // Notice that we have to await this executor.
            // If we didn't, we would decrease the amount of running evaluations
            // before the promise actually resolves
            return await Promise.race([executor(), stopPromise]);
        }
        finally {
            data.runningEvaluations.delete(evaluationData);
            if (data.runningEvaluations.size === 0) {
                await data.idleTeardown();
            }
        }
    }
}
exports.BaseSnapExecutor = BaseSnapExecutor;
//# sourceMappingURL=BaseSnapExecutor.js.map