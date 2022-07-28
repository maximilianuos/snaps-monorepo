"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a `Buffer` endowment. This mainly exists so that our build system
 * will reliably inline a `Buffer` implementation when targeting browser
 * environments.
 *
 * @returns An object with a cross-platform `Buffer` property.
 */
const createBuffer = () => {
    return { Buffer };
};
const endowmentModule = {
    names: ['Buffer'],
    factory: createBuffer,
};
exports.default = endowmentModule;
//# sourceMappingURL=buffer.js.map