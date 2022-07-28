"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommandMethodImplementations = void 0;
const openrpc_guard_1 = require("../__GENERATED__/openrpc.guard");
/**
 * Gets an object mapping internal, "command" JSON-RPC method names to their
 * implementations.
 *
 * @param startSnap - A function that starts a snap.
 * @param invokeSnapRpc - A function that invokes the RPC method handler of a
 * snap.
 * @param onTerminate - A function that will be called when this executor is
 * terminated in order to handle cleanup tasks.
 * @returns An object containing the "command" method implementations.
 */
function getCommandMethodImplementations(startSnap, invokeSnapRpc, onTerminate) {
    return {
        ping: async () => {
            return 'OK';
        },
        terminate: async () => {
            onTerminate();
            return 'OK';
        },
        executeSnap: async (snapName, sourceCode, endowments) => {
            if (typeof snapName !== 'string') {
                throw new Error('snapName is not a string');
            }
            if (typeof sourceCode !== 'string') {
                throw new Error('sourceCode is not a string');
            }
            if (endowments !== undefined) {
                if (!(0, openrpc_guard_1.isEndowments)(endowments)) {
                    throw new Error('endowment is not a proper Endowments object');
                }
            }
            await startSnap(snapName, sourceCode, endowments);
            return 'OK';
        },
        snapRpc: async (target, origin, request) => {
            var _a;
            if (typeof target !== 'string') {
                throw new Error('target is not a string');
            }
            if (typeof origin !== 'string') {
                throw new Error('origin is not a string');
            }
            if (!(0, openrpc_guard_1.isJsonRpcRequest)(request)) {
                throw new Error('request is not a proper JSON RPC Request');
            }
            return (_a = (await invokeSnapRpc(target, origin, request))) !== null && _a !== void 0 ? _a : null;
        },
    };
}
exports.getCommandMethodImplementations = getCommandMethodImplementations;
//# sourceMappingURL=commands.js.map