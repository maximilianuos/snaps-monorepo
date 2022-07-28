"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMockEndowments = exports.isConstructor = exports.ALL_APIS = void 0;
const events_1 = __importDefault(require("events"));
const crypto_1 = __importDefault(require("crypto"));
const snap_utils_1 = require("@metamask/snap-utils");
const NETWORK_APIS = ['fetch', 'WebSocket'];
exports.ALL_APIS = [...snap_utils_1.DEFAULT_ENDOWMENTS, ...NETWORK_APIS];
/**
 * Get a mock snap provider, that always returns `true` for requests.
 *
 * @returns A mocked snap provider.
 */
function getMockSnapProvider() {
    const mockProvider = new events_1.default();
    mockProvider.request = async () => true;
    return mockProvider;
}
/**
 * Check if a value is a constructor.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a constructor, or `false` otherwise.
 */
const isConstructor = (value) => { var _a, _b; return Boolean(typeof ((_b = (_a = value === null || value === void 0 ? void 0 : value.prototype) === null || _a === void 0 ? void 0 : _a.constructor) === null || _b === void 0 ? void 0 : _b.name) === 'string'); };
exports.isConstructor = isConstructor;
/**
 * A function that always returns `true`.
 *
 * @returns `true`.
 */
const mockFunction = () => true;
class MockClass {
}
const handler = {
    construct(Target, args) {
        return new Proxy(new Target(...args), handler);
    },
    get(_target, _prop) {
        return mockFunction;
    },
};
/**
 * Generate a mock class for a given value. The value is wrapped in a Proxy, and
 * all methods are replaced with a mock function.
 *
 * @param value - The value to mock.
 * @returns A mock class.
 */
const generateMockClass = (value) => {
    return new Proxy(value, handler);
};
// Things not currently auto-mocked because of NodeJS, by adding them here we have types for them and can use that to generate mocks if needed
const mockWindow = {
    WebSocket: MockClass,
    crypto: crypto_1.default,
    SubtleCrypto: MockClass,
};
/**
 * Generate a mock endowment for a certain class or function on the `globalThis`
 * object.
 *
 * @param key - The key to generate the mock endowment for.
 * @returns A mocked class or function. If the key is part of the default
 * endowments, the original value is returned.
 */
const generateMockEndowment = (key) => {
    const globalValue = globalThis[key];
    // Default exposed APIs don't need to be mocked
    if (globalValue && snap_utils_1.DEFAULT_ENDOWMENTS.includes(key)) {
        return globalValue;
    }
    // Fall back to mockWindow for certain APIs not exposed in global in Node.JS
    const globalOrMocked = globalValue !== null && globalValue !== void 0 ? globalValue : mockWindow[key];
    const type = typeof globalOrMocked;
    const isFunction = type === 'function';
    if (isFunction && (0, exports.isConstructor)(globalOrMocked)) {
        return generateMockClass(globalOrMocked);
    }
    else if (isFunction || !globalOrMocked) {
        // Fall back to function mock for now
        return mockFunction;
    }
    return globalOrMocked;
};
/**
 * Generate mock endowments for all the APIs as defined in {@link ALL_APIS}.
 *
 * @returns A map of endowments.
 */
const generateMockEndowments = () => {
    return exports.ALL_APIS.reduce((acc, cur) => (Object.assign(Object.assign({}, acc), { [cur]: generateMockEndowment(cur) })), { wallet: getMockSnapProvider() });
};
exports.generateMockEndowments = generateMockEndowments;
//# sourceMappingURL=mock.js.map