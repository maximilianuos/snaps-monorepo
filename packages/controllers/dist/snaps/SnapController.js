"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapController = exports.SnapStatusEvent = exports.SnapStatus = exports.AppKeyType = exports.SNAP_APPROVAL_UPDATE = exports.SNAP_PREFIX_REGEX = exports.controllerName = void 0;
const controllers_1 = require("@metamask/controllers");
const utils_1 = require("@metamask/utils");
const browser_passworder_1 = __importDefault(require("@metamask/browser-passworder"));
const eth_rpc_errors_1 = require("eth-rpc-errors");
const nanoid_1 = require("nanoid");
const snap_utils_1 = require("@metamask/snap-utils");
const utils_2 = require("../utils");
const utils_3 = require("./utils");
const endowments_1 = require("./endowments");
const RequestQueue_1 = require("./RequestQueue");
const Timer_1 = require("./Timer");
exports.controllerName = 'SnapController';
exports.SNAP_PREFIX_REGEX = new RegExp(`^${snap_utils_1.SNAP_PREFIX}`, 'u');
exports.SNAP_APPROVAL_UPDATE = 'wallet_updateSnap';
const TRUNCATED_SNAP_PROPERTIES = new Set([
    'initialPermissions',
    'id',
    'permissionName',
    'version',
]);
var AppKeyType;
(function (AppKeyType) {
    AppKeyType["stateEncryption"] = "stateEncryption";
})(AppKeyType = exports.AppKeyType || (exports.AppKeyType = {}));
const defaultState = {
    snapErrors: {},
    snaps: {},
    snapStates: {},
};
var SnapStatus;
(function (SnapStatus) {
    SnapStatus["installing"] = "installing";
    SnapStatus["running"] = "running";
    SnapStatus["stopped"] = "stopped";
    SnapStatus["crashed"] = "crashed";
})(SnapStatus = exports.SnapStatus || (exports.SnapStatus = {}));
var SnapStatusEvent;
(function (SnapStatusEvent) {
    SnapStatusEvent["start"] = "start";
    SnapStatusEvent["stop"] = "stop";
    SnapStatusEvent["crash"] = "crash";
    SnapStatusEvent["update"] = "update";
})(SnapStatusEvent = exports.SnapStatusEvent || (exports.SnapStatusEvent = {}));
/**
 * Guard transitioning when the snap is disabled.
 *
 * @param serializedSnap - The snap metadata.
 * @returns A boolean signalling whether the passed snap is enabled or not.
 */
const disabledGuard = (serializedSnap) => {
    return serializedSnap.enabled;
};
/**
 * The state machine configuration for a snaps `status` state.
 * Using a state machine for a snaps `status` ensures that the snap transitions to a valid next lifecycle state.
 * Supports a very minimal subset of XState conventions outlined in `_transitionSnapState`.
 */
const snapStatusStateMachineConfig = {
    initial: SnapStatus.installing,
    states: {
        [SnapStatus.installing]: {
            on: {
                [SnapStatusEvent.start]: {
                    target: SnapStatus.running,
                    cond: disabledGuard,
                },
            },
        },
        [SnapStatus.running]: {
            on: {
                [SnapStatusEvent.stop]: SnapStatus.stopped,
                [SnapStatusEvent.crash]: SnapStatus.crashed,
            },
        },
        [SnapStatus.stopped]: {
            on: {
                [SnapStatusEvent.start]: {
                    target: SnapStatus.running,
                    cond: disabledGuard,
                },
                [SnapStatusEvent.update]: SnapStatus.installing,
            },
        },
        [SnapStatus.crashed]: {
            on: {
                [SnapStatusEvent.start]: {
                    target: SnapStatus.running,
                    cond: disabledGuard,
                },
            },
        },
    },
};
const name = 'SnapController';
/*
 * A snap is initialized in three phases:
 * - Add: Loads the snap from a remote source and parses it.
 * - Authorize: Requests the snap's required permissions from the user.
 * - Start: Initializes the snap in its SES realm with the authorized permissions.
 */
class SnapController extends controllers_1.BaseControllerV2 {
    constructor({ closeAllConnections, messenger, state, getAppKey, environmentEndowmentPermissions = [], npmRegistryUrl, idleTimeCheckInterval = (0, utils_1.inMilliseconds)(5, utils_1.Duration.Second), checkBlockList, maxIdleTime = (0, utils_1.inMilliseconds)(30, utils_1.Duration.Second), maxRequestTime = (0, utils_1.inMilliseconds)(60, utils_1.Duration.Second), fetchFunction = globalThis.fetch.bind(globalThis), featureFlags = {}, }) {
        super({
            messenger,
            metadata: {
                snapErrors: {
                    persist: false,
                    anonymous: false,
                },
                snapStates: {
                    persist: true,
                    anonymous: false,
                },
                snaps: {
                    persist: (snaps) => {
                        return Object.values(snaps)
                            .map((snap) => {
                            return Object.assign(Object.assign({}, snap), { 
                                // At the time state is rehydrated, no snap will be running.
                                status: SnapStatus.stopped });
                        })
                            .reduce((memo, snap) => {
                            memo[snap.id] = snap;
                            return memo;
                        }, {});
                    },
                    anonymous: false,
                },
            },
            name,
            state: Object.assign(Object.assign({}, defaultState), state),
        });
        this._closeAllConnections = closeAllConnections;
        this._environmentEndowmentPermissions = environmentEndowmentPermissions;
        this._featureFlags = featureFlags;
        this._fetchFunction = fetchFunction;
        this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
        this._getAppKey = getAppKey;
        this._idleTimeCheckInterval = idleTimeCheckInterval;
        this._checkSnapBlockList = checkBlockList;
        this._maxIdleTime = maxIdleTime;
        this._maxRequestTime = maxRequestTime;
        this._npmRegistryUrl = npmRegistryUrl;
        this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
        this._onOutboundRequest = this._onOutboundRequest.bind(this);
        this._onOutboundResponse = this._onOutboundResponse.bind(this);
        this._snapsRuntimeData = new Map();
        this._pollForLastRequestStatus();
        this.messagingSystem.subscribe('ExecutionService:unhandledError', this._onUnhandledSnapError);
        this.messagingSystem.subscribe('ExecutionService:outboundRequest', this._onOutboundRequest);
        this.messagingSystem.subscribe('ExecutionService:outboundResponse', this._onOutboundResponse);
        this.registerMessageHandlers();
    }
    /**
     * Constructor helper for registering the controller's messaging system
     * actions.
     */
    registerMessageHandlers() {
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:add`, (...args) => this.add(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:clearSnapState`, (...args) => this.clearSnapState(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:get`, (...args) => this.get(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:getSnapState`, (...args) => this.getSnapState(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:handleRpcRequest`, (...args) => this.handleRpcRequest(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:has`, (...args) => this.has(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:updateBlockedSnaps`, () => this.updateBlockedSnaps());
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:updateSnapState`, (...args) => this.updateSnapState(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:enable`, (...args) => this.enableSnap(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:disable`, (...args) => this.disableSnap(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:remove`, (...args) => this.removeSnap(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:getSnaps`, (...args) => this.getPermittedSnaps(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:install`, (...args) => this.installSnaps(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:removeSnapError`, (...args) => this.removeSnapError(...args));
    }
    _pollForLastRequestStatus() {
        this._timeoutForLastRequestStatus = setTimeout(async () => {
            await this._stopSnapsLastRequestPastMax();
            this._pollForLastRequestStatus();
        }, this._idleTimeCheckInterval);
    }
    /**
     * Checks all installed snaps against the block list and
     * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
     * for more information.
     */
    async updateBlockedSnaps() {
        const blockedSnaps = await this._checkSnapBlockList(Object.values(this.state.snaps).reduce((blockListArg, snap) => {
            blockListArg[snap.id] = snap.version;
            return blockListArg;
        }, {}));
        await Promise.all(Object.entries(blockedSnaps).map((_a) => {
            var [snapId, _b] = _a, { blocked } = _b, blockData = __rest(_b, ["blocked"]);
            if (blocked) {
                return this._blockSnap(snapId, blockData);
            }
            return this._unblockSnap(snapId);
        }));
    }
    /**
     * Blocks an installed snap and prevents it from being started again. Emits
     * {@link SnapBlocked}. Does nothing if the snap is not installed.
     *
     * @param snapId - The snap to block.
     * @param blockedSnapInfo - Information detailing why the snap is blocked.
     */
    async _blockSnap(snapId, blockedSnapInfo) {
        if (!this.has(snapId)) {
            return;
        }
        try {
            this.update((state) => {
                state.snaps[snapId].blocked = true;
                state.snaps[snapId].blockInformation = blockedSnapInfo;
            });
            await this.disableSnap(snapId);
        }
        catch (error) {
            console.error(`Encountered error when stopping blocked snap "${snapId}".`, error);
        }
        this.messagingSystem.publish(`${exports.controllerName}:snapBlocked`, snapId, blockedSnapInfo);
    }
    /**
     * Unblocks a snap so that it can be enabled and started again. Emits
     * {@link SnapUnblocked}. Does nothing if the snap is not installed or already
     * unblocked.
     *
     * @param snapId - The id of the snap to unblock.
     */
    async _unblockSnap(snapId) {
        if (!this.has(snapId) || !this.state.snaps[snapId].blocked) {
            return;
        }
        this.update((state) => {
            state.snaps[snapId].blocked = false;
            delete state.snaps[snapId].blockInformation;
        });
        this.messagingSystem.publish(`${exports.controllerName}:snapUnblocked`, snapId);
    }
    /**
     * Checks the block list to determine whether a version of a snap is blocked.
     *
     * @param snapId - The snap id to check.
     * @param version - The version of the snap to check.
     * @returns Whether the version of the snap is blocked or not.
     */
    async isBlocked(snapId, version) {
        const result = await this._checkSnapBlockList({ [snapId]: version });
        return result[snapId].blocked;
    }
    /**
     * Asserts that a version of a snap is not blocked. Succeeds automatically
     * if {@link SnapController._checkSnapBlockList} is undefined.
     *
     * @param snapId - The id of the snap to check.
     * @param version - The version to check.
     */
    async _assertIsUnblocked(snapId, version) {
        if (await this.isBlocked(snapId, version)) {
            throw new Error(`Cannot install version "${version}" of snap "${snapId}": the version is blocked.`);
        }
    }
    async _stopSnapsLastRequestPastMax() {
        const entries = [...this._snapsRuntimeData.entries()];
        return Promise.all(entries
            .filter(([_snapId, runtime]) => runtime.pendingInboundRequests.length === 0 &&
            // lastRequest should always be set here but TypeScript wants this check
            runtime.lastRequest &&
            this._maxIdleTime &&
            (0, utils_1.timeSince)(runtime.lastRequest) > this._maxIdleTime)
            .map(([snapId]) => this.stopSnap(snapId, SnapStatusEvent.stop)));
    }
    async _onUnhandledSnapError(snapId, error) {
        await this.stopSnap(snapId, SnapStatusEvent.crash);
        this.addSnapError(error);
    }
    async _onOutboundRequest(snapId) {
        const runtime = this._getSnapRuntimeData(snapId);
        // Ideally we would only pause the pending request that is making the outbound request
        // but right now we don't have a way to know which request initiated the outbound request
        runtime.pendingInboundRequests.forEach((pendingRequest) => pendingRequest.timer.pause());
        runtime.pendingOutboundRequests += 1;
    }
    async _onOutboundResponse(snapId) {
        const runtime = this._getSnapRuntimeData(snapId);
        runtime.pendingOutboundRequests -= 1;
        if (runtime.pendingOutboundRequests === 0) {
            runtime.pendingInboundRequests.forEach((pendingRequest) => pendingRequest.timer.resume());
        }
    }
    /**
     * Transitions between states using `snapStatusStateMachineConfig` as the template to figure out the next state.
     * This transition function uses a very minimal subset of XState conventions:
     * - supports initial state
     * - .on supports raw event target string
     * - .on supports {target, cond} object
     * - the arguments for `cond` is the `SerializedSnap` instead of Xstate convention of `(event, context) => boolean`
     *
     * @param snapId - The id of the snap to transition.
     * @param event - The event enum to use to transition.
     */
    _transitionSnapState(snapId, event) {
        var _a;
        const snapStatus = this.state.snaps[snapId].status;
        let nextStatus = (_a = snapStatusStateMachineConfig.states[snapStatus].on[event]) !== null && _a !== void 0 ? _a : snapStatus;
        if (nextStatus.cond) {
            const cond = nextStatus.cond(this.state.snaps[snapId]);
            if (cond === false) {
                throw new Error(`Condition failed for state transition "${snapId}" with event "${event}".`);
            }
        }
        if (nextStatus.target) {
            nextStatus = nextStatus.target;
        }
        if (nextStatus === snapStatus) {
            return;
        }
        this.update((state) => {
            state.snaps[snapId].status = nextStatus;
        });
    }
    /**
     * Starts the given snap. Throws an error if no such snap exists
     * or if it is already running.
     *
     * @param snapId - The id of the Snap to start.
     */
    async startSnap(snapId) {
        const snap = this.get(snapId);
        if (!snap) {
            throw new Error(`Snap "${snapId}" not found.`);
        }
        if (this.state.snaps[snapId].enabled === false) {
            throw new Error(`Snap "${snapId}" is disabled.`);
        }
        await this._startSnap({
            snapId,
            sourceCode: snap.sourceCode,
        });
    }
    /**
     * Enables the given snap. A snap can only be started if it is enabled. A snap
     * can only be enabled if it isn't blocked.
     *
     * @param snapId - The id of the Snap to enable.
     */
    enableSnap(snapId) {
        if (!this.has(snapId)) {
            throw new Error(`Snap "${snapId}" not found.`);
        }
        if (this.state.snaps[snapId].blocked) {
            throw new Error(`Snap "${snapId}" is blocked and cannot be enabled.`);
        }
        this.update((state) => {
            state.snaps[snapId].enabled = true;
        });
    }
    /**
     * Disables the given snap. A snap can only be started if it is enabled.
     *
     * @param snapId - The id of the Snap to disable.
     * @returns A promise that resolves once the snap has been disabled.
     */
    disableSnap(snapId) {
        if (!this.has(snapId)) {
            throw new Error(`Snap "${snapId}" not found.`);
        }
        this.update((state) => {
            state.snaps[snapId].enabled = false;
        });
        if (this.isRunning(snapId)) {
            return this.stopSnap(snapId, SnapStatusEvent.stop);
        }
        return Promise.resolve();
    }
    /**
     * Stops the given snap, removes all hooks, closes all connections, and
     * terminates its worker.
     *
     * @param snapId - The id of the Snap to stop.
     * @param statusEvent - The Snap status event that caused the snap to be
     * stopped.
     */
    async stopSnap(snapId, statusEvent = SnapStatusEvent.stop) {
        const runtime = this._getSnapRuntimeData(snapId);
        if (!runtime) {
            return;
        }
        // Reset request tracking
        runtime.lastRequest = null;
        runtime.pendingInboundRequests = [];
        runtime.pendingOutboundRequests = 0;
        try {
            if (this.isRunning(snapId)) {
                this._closeAllConnections(snapId);
                await this.terminateSnap(snapId);
            }
        }
        finally {
            if (this.isRunning(snapId)) {
                this._transitionSnapState(snapId, statusEvent);
            }
        }
    }
    /**
     * Terminates the specified snap and emits the `snapTerminated` event.
     *
     * @param snapId - The snap to terminate.
     */
    async terminateSnap(snapId) {
        await this.messagingSystem.call('ExecutionService:terminateSnap', snapId);
        this.messagingSystem.publish('SnapController:snapTerminated', this.getTruncated(snapId));
    }
    /**
     * Returns whether the given snap is running.
     * Throws an error if the snap doesn't exist.
     *
     * @param snapId - The id of the Snap to check.
     * @returns `true` if the snap is running, otherwise `false`.
     */
    isRunning(snapId) {
        const snap = this.get(snapId);
        if (!snap) {
            throw new Error(`Snap "${snapId}" not found.`);
        }
        return snap.status === SnapStatus.running;
    }
    /**
     * Returns whether the given snap has been added to state.
     *
     * @param snapId - The id of the Snap to check for.
     * @returns `true` if the snap exists in the controller state, otherwise `false`.
     */
    has(snapId) {
        return Boolean(this.get(snapId));
    }
    /**
     * Gets the snap with the given id if it exists, including all data.
     * This should not be used if the snap is to be serializable, as e.g.
     * the snap sourceCode may be quite large.
     *
     * @param snapId - The id of the Snap to get.
     * @returns The entire snap object from the controller state.
     */
    get(snapId) {
        return this.state.snaps[snapId];
    }
    /**
     * Gets the snap with the given id if it exists, excluding any
     * non-serializable or expensive-to-serialize data.
     *
     * @param snapId - The id of the Snap to get.
     * @returns A truncated version of the snap state, that is less expensive to serialize.
     */
    getTruncated(snapId) {
        const snap = this.get(snapId);
        return snap
            ? Object.keys(snap).reduce((serialized, key) => {
                if (TRUNCATED_SNAP_PROPERTIES.has(key)) {
                    serialized[key] = snap[key];
                }
                return serialized;
            }, {})
            : null;
    }
    /**
     * Updates the own state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be updated.
     * @param newSnapState - The new state of the snap.
     */
    async updateSnapState(snapId, newSnapState) {
        const encrypted = await this.encryptSnapState(snapId, newSnapState);
        this.update((state) => {
            state.snapStates[snapId] = encrypted;
        });
    }
    /**
     * Clears the state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be cleared.
     */
    async clearSnapState(snapId) {
        this.update((state) => {
            delete state.snapStates[snapId];
        });
    }
    /**
     * Adds error from a snap to the SnapController state.
     *
     * @param snapError - The error to store on the SnapController.
     */
    addSnapError(snapError) {
        this.update((state) => {
            const id = (0, nanoid_1.nanoid)();
            state.snapErrors[id] = Object.assign(Object.assign({}, snapError), { internalID: id });
        });
    }
    /**
     * Removes an error by internalID from a the SnapControllers state.
     *
     * @param internalID - The internal error ID to remove on the SnapController.
     */
    async removeSnapError(internalID) {
        this.update((state) => {
            delete state.snapErrors[internalID];
        });
    }
    /**
     * Clears all errors from the SnapControllers state.
     *
     */
    async clearSnapErrors() {
        this.update((state) => {
            state.snapErrors = {};
        });
    }
    /**
     * Gets the own state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state to get.
     * @returns A promise that resolves with the decrypted snap state or null if no state exists.
     * @throws If the snap state decryption fails.
     */
    async getSnapState(snapId) {
        const state = this.state.snapStates[snapId];
        return state ? this.decryptSnapState(snapId, state) : null;
    }
    async getEncryptionKey(snapId) {
        return this._getAppKey(snapId, AppKeyType.stateEncryption);
    }
    async encryptSnapState(snapId, state) {
        const appKey = await this.getEncryptionKey(snapId);
        return browser_passworder_1.default.encrypt(appKey, state);
    }
    async decryptSnapState(snapId, encrypted) {
        const appKey = await this.getEncryptionKey(snapId);
        try {
            return await browser_passworder_1.default.decrypt(appKey, encrypted);
        }
        catch (err) {
            throw new Error('Failed to decrypt snap state, the state must be corrupted.');
        }
    }
    /**
     * Completely clear the controller's state: delete all associated data,
     * handlers, event listeners, and permissions; tear down all snap providers.
     */
    clearState() {
        const snapIds = Object.keys(this.state.snaps);
        snapIds.forEach((snapId) => {
            this._closeAllConnections(snapId);
        });
        this.messagingSystem.call('ExecutionService:terminateAllSnaps');
        snapIds.forEach(this.revokeAllSnapPermissions);
        this.update((state) => {
            state.snaps = {};
            state.snapStates = {};
        });
    }
    /**
     * Removes the given snap from state, and clears all associated handlers
     * and listeners.
     *
     * @param snapId - The id of the Snap.
     * @returns A promise that resolves once the snap has been removed.
     */
    async removeSnap(snapId) {
        return this.removeSnaps([snapId]);
    }
    /**
     * Stops the given snaps, removes them from state, and clears all associated
     * permissions, handlers, and listeners.
     *
     * @param snapIds - The ids of the Snaps.
     */
    async removeSnaps(snapIds) {
        if (!Array.isArray(snapIds)) {
            throw new Error('Expected array of snap ids.');
        }
        await Promise.all(snapIds.map(async (snapId) => {
            const truncated = this.getTruncated(snapId);
            // Disable the snap and revoke all of its permissions before deleting
            // it. This ensures that the snap will not be restarted or otherwise
            // affect the host environment while we are deleting it.
            await this.disableSnap(snapId);
            this.revokeAllSnapPermissions(snapId);
            const permissionName = (0, snap_utils_1.getSnapPermissionName)(snapId);
            // Revoke all subjects access to the snap
            this.messagingSystem.call('PermissionController:revokePermissionForAllSubjects', permissionName);
            this._snapsRuntimeData.delete(snapId);
            this.update((state) => {
                delete state.snaps[snapId];
                delete state.snapStates[snapId];
            });
            this.messagingSystem.publish(`SnapController:snapRemoved`, truncated);
        }));
    }
    /**
     * Safely revokes all permissions granted to a Snap.
     *
     * @param snapId - The snap ID.
     */
    async revokeAllSnapPermissions(snapId) {
        if (await this.messagingSystem.call('PermissionController:hasPermissions', snapId)) {
            this.messagingSystem.call('PermissionController:revokeAllPermissions', snapId);
        }
    }
    /**
     * Gets the serialized permitted snaps of the given origin, if any.
     *
     * @param origin - The origin whose permitted snaps to retrieve.
     * @returns The serialized permitted snaps for the origin.
     */
    async getPermittedSnaps(origin) {
        var _a;
        return Object.values((_a = (await this.messagingSystem.call('PermissionController:getPermissions', origin))) !== null && _a !== void 0 ? _a : {}).reduce((permittedSnaps, perm) => {
            if (perm.parentCapability.startsWith(snap_utils_1.SNAP_PREFIX)) {
                const snapId = perm.parentCapability.replace(exports.SNAP_PREFIX_REGEX, '');
                const snap = this.getTruncated(snapId);
                permittedSnaps[snapId] = snap || {
                    error: (0, eth_rpc_errors_1.serializeError)(new Error('Snap permitted but not installed.')),
                };
            }
            return permittedSnaps;
        }, {});
    }
    /**
     * Installs the snaps requested by the given origin, returning the snap
     * object if the origin is permitted to install it, and an authorization error
     * otherwise.
     *
     * @param origin - The origin that requested to install the snaps.
     * @param requestedSnaps - The snaps to install.
     * @returns An object of snap ids and snap objects, or errors if a
     * snap couldn't be installed.
     */
    async installSnaps(origin, requestedSnaps) {
        const result = {};
        await Promise.all(Object.entries(requestedSnaps).map(async ([snapId, { version: rawVersion }]) => {
            const version = (0, snap_utils_1.resolveVersion)(rawVersion);
            const permissionName = (0, snap_utils_1.getSnapPermissionName)(snapId);
            if (!(0, snap_utils_1.isValidSnapVersionRange)(version)) {
                result[snapId] = {
                    error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`The "version" field must be a valid SemVer version range if specified. Received: "${version}".`),
                };
                return;
            }
            if (await this.messagingSystem.call('PermissionController:hasPermission', origin, permissionName)) {
                // Attempt to install and run the snap, storing any errors that
                // occur during the process.
                result[snapId] = Object.assign({}, (await this.processRequestedSnap(origin, snapId, version)));
            }
            else {
                // only allow the installation of permitted snaps
                result[snapId] = {
                    error: eth_rpc_errors_1.ethErrors.provider.unauthorized(`Not authorized to install snap "${snapId}". Request the permission for the snap before attempting to install it.`),
                };
            }
        }));
        return result;
    }
    /**
     * Adds, authorizes, and runs the given snap with a snap provider.
     * Results from this method should be efficiently serializable.
     *
     * @param origin - The origin requesting the snap.
     * @param _snapId - The id of the snap.
     * @param versionRange - The semver range of the snap to install.
     * @returns The resulting snap object, or an error if something went wrong.
     */
    async processRequestedSnap(origin, _snapId, versionRange) {
        try {
            this.validateSnapId(_snapId);
        }
        catch (err) {
            return {
                error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`"${_snapId}" is not a valid snap id.`),
            };
        }
        const snapId = _snapId;
        const existingSnap = this.getTruncated(snapId);
        // For devX we always re-install local snaps.
        if (existingSnap && (0, snap_utils_1.getSnapPrefix)(snapId) !== snap_utils_1.SnapIdPrefixes.local) {
            if ((0, snap_utils_1.satifiesVersionRange)(existingSnap.version, versionRange)) {
                return existingSnap;
            }
            if (this._featureFlags.dappsCanUpdateSnaps === true) {
                try {
                    const updateResult = await this.updateSnap(origin, snapId, versionRange);
                    if (updateResult === null) {
                        return {
                            error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`Snap "${snapId}@${existingSnap.version}" is already installed, couldn't update to a version inside requested "${versionRange}" range.`),
                        };
                    }
                    return updateResult;
                }
                catch (err) {
                    return { error: (0, eth_rpc_errors_1.serializeError)(err) };
                }
            }
            else {
                return {
                    error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`Version mismatch with already installed snap. ${snapId}@${existingSnap.version} doesn't satisfy requested version ${versionRange}`),
                };
            }
        }
        // Existing snaps must be stopped before overwriting
        if (existingSnap && this.isRunning(snapId)) {
            await this.stopSnap(snapId, SnapStatusEvent.stop);
        }
        try {
            const { sourceCode } = await this.add({
                origin,
                id: snapId,
                versionRange,
            });
            await this.authorize(snapId);
            await this._startSnap({
                snapId,
                sourceCode,
            });
            const truncated = this.getTruncated(snapId);
            this.messagingSystem.publish(`SnapController:snapInstalled`, truncated);
            return truncated;
        }
        catch (err) {
            console.error(`Error when adding snap.`, err);
            if (this.has(snapId)) {
                this.removeSnap(snapId);
            }
            return { error: (0, eth_rpc_errors_1.serializeError)(err) };
        }
    }
    /**
     * Updates an installed snap. The flow is similar to
     * {@link SnapController.installSnaps}. The user will be asked if they want
     * to update, then approve any permission changes, and finally the snap will
     * be restarted.
     *
     * The update will fail if the user rejects any prompt or if the new version
     * of the snap is blocked.
     *
     * If the original version of the snap was blocked and the update succeeded,
     * the snap will be unblocked and enabled before it is restarted.
     *
     * @param origin - The origin requesting the snap update.
     * @param snapId - The id of the Snap to be updated.
     * @param newVersionRange - A semver version range in which the maximum version will be chosen.
     * @returns The snap metadata if updated, `null` otherwise.
     */
    async updateSnap(origin, snapId, newVersionRange = snap_utils_1.DEFAULT_REQUESTED_SNAP_VERSION) {
        const snap = this.get(snapId);
        if (snap === undefined) {
            throw new Error(`Could not find snap ${snapId}. Install the snap before attempting to update it.`);
        }
        if (!(0, snap_utils_1.isValidSnapVersionRange)(newVersionRange)) {
            throw new Error(`Received invalid snap version range: "${newVersionRange}".`);
        }
        const newSnap = await this._fetchSnap(snapId, newVersionRange);
        const newVersion = newSnap.manifest.version;
        if (!(0, snap_utils_1.gtVersion)(newVersion, snap.version)) {
            console.warn(`Tried updating snap "${snapId}" within "${newVersionRange}" version range, but newer version "${newVersion}" is already installed`);
            return null;
        }
        await this._assertIsUnblocked(snapId, newVersion);
        const { newPermissions, unusedPermissions, approvedPermissions } = await this.calculatePermissionsChange(snapId, newSnap.manifest.initialPermissions);
        const isApproved = await this.messagingSystem.call('ApprovalController:addRequest', {
            origin,
            type: exports.SNAP_APPROVAL_UPDATE,
            requestData: {
                // First two keys mirror installation params
                metadata: { id: (0, nanoid_1.nanoid)(), origin: snapId, dappOrigin: origin },
                permissions: newPermissions,
                snapId,
                newVersion: newSnap.manifest.version,
                newPermissions,
                approvedPermissions,
                unusedPermissions,
            },
        }, true);
        if (!isApproved) {
            return null;
        }
        if (this.isRunning(snapId)) {
            await this.stopSnap(snapId, SnapStatusEvent.stop);
        }
        this._transitionSnapState(snapId, SnapStatusEvent.update);
        this._set({
            origin,
            id: snapId,
            manifest: newSnap.manifest,
            sourceCode: newSnap.sourceCode,
            versionRange: newVersionRange,
        });
        const unusedPermissionsKeys = Object.keys(unusedPermissions);
        if ((0, utils_1.isNonEmptyArray)(unusedPermissionsKeys)) {
            await this.messagingSystem.call('PermissionController:revokePermissions', {
                [snapId]: unusedPermissionsKeys,
            });
        }
        if ((0, utils_1.isNonEmptyArray)(Object.keys(newPermissions))) {
            await this.messagingSystem.call('PermissionController:grantPermissions', {
                approvedPermissions: newPermissions,
                subject: { origin: snapId },
            });
        }
        await this._startSnap({ snapId, sourceCode: newSnap.sourceCode });
        const truncatedSnap = this.getTruncated(snapId);
        this.messagingSystem.publish('SnapController:snapUpdated', truncatedSnap, snap.version);
        return truncatedSnap;
    }
    /**
     * Returns a promise representing the complete installation of the requested snap.
     * If the snap is already being installed, the previously pending promise will be returned.
     *
     * @param args - Object containing the snap id and either the URL of the snap's manifest,
     * or the snap's manifest and source code. The object may also optionally contain a target version.
     * @returns The resulting snap object.
     */
    async add(args) {
        const { id: _snapId } = args;
        this.validateSnapId(_snapId);
        const snapId = _snapId;
        if (!args ||
            !('origin' in args) ||
            !('id' in args) ||
            (!('manifest' in args) && 'sourceCode' in args) ||
            ('manifest' in args && !('sourceCode' in args))) {
            throw new Error(`Invalid add snap args for snap "${snapId}".`);
        }
        const runtime = this._getSnapRuntimeData(snapId);
        if (!runtime.installPromise) {
            console.info(`Adding snap: ${snapId}`);
            // If fetching and setting the snap succeeds, this property will be set
            // to null in the authorize() method.
            runtime.installPromise = (async () => {
                if ('manifest' in args && 'sourceCode' in args) {
                    return this._set(Object.assign(Object.assign({}, args), { id: snapId }));
                }
                const fetchedSnap = await this._fetchSnap(snapId, args.versionRange);
                await this._assertIsUnblocked(snapId, fetchedSnap.manifest.version);
                return this._set(Object.assign(Object.assign(Object.assign({}, args), fetchedSnap), { id: snapId }));
            })();
        }
        try {
            return await runtime.installPromise;
        }
        catch (error) {
            // Reset promise so users can retry installation in case the problem is
            // temporary.
            runtime.installPromise = null;
            throw error;
        }
    }
    validateSnapId(snapId) {
        if (!snapId || typeof snapId !== 'string') {
            throw new Error(`Invalid snap id: Not a string. Received "${snapId}"`);
        }
        for (const prefix of Object.values(snap_utils_1.SnapIdPrefixes)) {
            if (snapId.startsWith(prefix) && snapId.replace(prefix, '').length > 0) {
                return;
            }
        }
        throw new Error(`Invalid snap id. Received: "${snapId}"`);
    }
    async _startSnap(snapData) {
        const { snapId } = snapData;
        if (this.isRunning(snapId)) {
            throw new Error(`Snap "${snapId}" is already started.`);
        }
        try {
            const result = await this._executeWithTimeout(snapId, this.messagingSystem.call('ExecutionService:executeSnap', Object.assign(Object.assign({}, snapData), { endowments: await this._getEndowments(snapId) })));
            this._transitionSnapState(snapId, SnapStatusEvent.start);
            return result;
        }
        catch (err) {
            await this.terminateSnap(snapId);
            throw err;
        }
    }
    /**
     * Gets the names of all endowments that will be added to the Snap's
     * Compartment when it executes. These should be the names of global
     * JavaScript APIs accessible in the root realm of the execution environment.
     *
     * Throws an error if the endowment getter for a permission returns a truthy
     * value that is not an array of strings.
     *
     * @param snapId - The id of the snap whose SES endowments to get.
     * @returns An array of the names of the endowments.
     */
    async _getEndowments(snapId) {
        let allEndowments = [];
        for (const permissionName of this._environmentEndowmentPermissions) {
            if (await this.messagingSystem.call('PermissionController:hasPermission', snapId, permissionName)) {
                const endowments = await this.messagingSystem.call('PermissionController:getEndowments', snapId, permissionName);
                if (endowments) {
                    // We don't have any guarantees about the type of the endowments
                    // value, so we have to guard at runtime.
                    if (!Array.isArray(endowments) ||
                        endowments.some((value) => typeof value !== 'string')) {
                        throw new Error('Expected an array of string endowment names.');
                    }
                    allEndowments = allEndowments.concat(endowments);
                }
            }
        }
        const dedupedEndowments = [
            ...new Set([...snap_utils_1.DEFAULT_ENDOWMENTS, ...allEndowments]),
        ];
        if (dedupedEndowments.length <
            snap_utils_1.DEFAULT_ENDOWMENTS.length + allEndowments.length) {
            console.error('Duplicate endowments found. Default endowments should not be requested.', allEndowments);
        }
        return dedupedEndowments;
    }
    /**
     * Sets a snap in state. Called when a snap is installed or updated. Performs
     * various validation checks on the received arguments, and will throw if
     * validation fails.
     *
     * The snap will be enabled and unblocked by the time this method returns,
     * regardless of its previous state.
     *
     * See {@link SnapController.add} and {@link SnapController.updateSnap} for
     * usage.
     *
     * @param args - The add snap args.
     * @returns The resulting snap object.
     */
    _set(args) {
        var _a;
        const { id: snapId, origin, manifest, sourceCode, svgIcon, versionRange = snap_utils_1.DEFAULT_REQUESTED_SNAP_VERSION, } = args;
        (0, snap_utils_1.validateSnapJsonFile)(snap_utils_1.NpmSnapFileNames.Manifest, manifest);
        const { version } = manifest;
        if (!(0, snap_utils_1.satifiesVersionRange)(version, versionRange)) {
            throw new Error(`Version mismatch. Manifest for "${snapId}" specifies version "${version}" which doesn't satisfy requested version range "${versionRange}"`);
        }
        if (typeof sourceCode !== 'string' || sourceCode.length === 0) {
            throw new Error(`Invalid source code for snap "${snapId}".`);
        }
        const initialPermissions = manifest === null || manifest === void 0 ? void 0 : manifest.initialPermissions;
        if (!initialPermissions ||
            typeof initialPermissions !== 'object' ||
            Array.isArray(initialPermissions)) {
            throw new Error(`Invalid initial permissions for snap "${snapId}".`);
        }
        const snapsState = this.state.snaps;
        const existingSnap = snapsState[snapId];
        const previousVersionHistory = (_a = existingSnap === null || existingSnap === void 0 ? void 0 : existingSnap.versionHistory) !== null && _a !== void 0 ? _a : [];
        const versionHistory = [
            ...previousVersionHistory,
            {
                version,
                date: Date.now(),
                origin,
            },
        ];
        const snap = Object.assign(Object.assign({}, existingSnap), { 
            // Note that the snap will be unblocked and enabled, regardless of its
            // previous state.
            blocked: false, enabled: true, 
            // So we can easily correlate the snap with its permission
            permissionName: (0, snap_utils_1.getSnapPermissionName)(snapId), id: snapId, initialPermissions,
            manifest,
            sourceCode, status: snapStatusStateMachineConfig.initial, version,
            versionHistory });
        // If the snap was blocked, it isn't any longer
        delete snap.blockInformation;
        // store the snap back in state
        this.update((state) => {
            state.snaps[snapId] = snap;
        });
        this.messagingSystem.publish(`SnapController:snapAdded`, snap, svgIcon);
        return snap;
    }
    /**
     * Fetches the manifest and source code of a snap.
     *
     * @param snapId - The id of the Snap.
     * @param versionRange - The SemVer version of the Snap to fetch.
     * @returns A tuple of the Snap manifest object and the Snap source code.
     */
    async _fetchSnap(snapId, versionRange = snap_utils_1.DEFAULT_REQUESTED_SNAP_VERSION) {
        try {
            const snapPrefix = (0, snap_utils_1.getSnapPrefix)(snapId);
            switch (snapPrefix) {
                case snap_utils_1.SnapIdPrefixes.local:
                    return this._fetchLocalSnap(snapId.replace(snap_utils_1.SnapIdPrefixes.local, ''));
                case snap_utils_1.SnapIdPrefixes.npm:
                    return this._fetchNpmSnap(snapId.replace(snap_utils_1.SnapIdPrefixes.npm, ''), versionRange);
                /* istanbul ignore next */
                default:
                    // This whill fail to compile if the above switch is not fully exhaustive
                    return (0, utils_2.assertExhaustive)(snapPrefix);
            }
        }
        catch (error) {
            throw new Error(`Failed to fetch Snap "${snapId}": ${error.message}`);
        }
    }
    async _fetchNpmSnap(packageName, versionRange) {
        if (!(0, snap_utils_1.isValidSnapVersionRange)(versionRange)) {
            throw new Error(`Received invalid Snap version range: "${versionRange}".`);
        }
        const { manifest, sourceCode, svgIcon } = await (0, utils_3.fetchNpmSnap)(packageName, versionRange, this._npmRegistryUrl, this._fetchFunction);
        return { manifest, sourceCode, svgIcon };
    }
    /**
     * Fetches the manifest and source code of a local snap.
     *
     * @param localhostUrl - The localhost URL to download from.
     * @returns The validated manifest and the source code.
     */
    async _fetchLocalSnap(localhostUrl) {
        // Local snaps are mostly used for development purposes. Fetches were cached in the browser and were not requested
        // afterwards which lead to confusing development where old versions of snaps were installed.
        // Thus we disable caching
        const fetchOptions = { cache: 'no-cache' };
        const manifestUrl = new URL(snap_utils_1.NpmSnapFileNames.Manifest, localhostUrl);
        if (!snap_utils_1.LOCALHOST_HOSTNAMES.has(manifestUrl.hostname)) {
            throw new Error(`Invalid URL: Locally hosted Snaps must be hosted on localhost. Received URL: "${manifestUrl.toString()}"`);
        }
        const _manifest = await (await this._fetchFunction(manifestUrl.toString(), fetchOptions)).json();
        (0, snap_utils_1.validateSnapJsonFile)(snap_utils_1.NpmSnapFileNames.Manifest, _manifest);
        const manifest = _manifest;
        const { source: { location: { npm: { filePath, iconPath }, }, }, } = manifest;
        const [sourceCode, svgIcon] = await Promise.all([
            (await this._fetchFunction(new URL(filePath, localhostUrl).toString(), fetchOptions)).text(),
            iconPath
                ? (await this._fetchFunction(new URL(iconPath, localhostUrl).toString(), fetchOptions)).text()
                : undefined,
        ]);
        (0, snap_utils_1.validateSnapShasum)(manifest, sourceCode);
        return { manifest, sourceCode, svgIcon };
    }
    /**
     * Initiates a request for the given snap's initial permissions.
     * Must be called in order. See processRequestedSnap.
     *
     * @param snapId - The id of the Snap.
     * @returns The snap's approvedPermissions.
     */
    async authorize(snapId) {
        console.info(`Authorizing snap: ${snapId}`);
        const snapsState = this.state.snaps;
        const snap = snapsState[snapId];
        const { initialPermissions } = snap;
        try {
            if ((0, utils_1.isNonEmptyArray)(Object.keys(initialPermissions))) {
                const [approvedPermissions] = await this.messagingSystem.call('PermissionController:requestPermissions', { origin: snapId }, initialPermissions);
                return Object.values(approvedPermissions).map((perm) => perm.parentCapability);
            }
            return [];
        }
        finally {
            const runtime = this._getSnapRuntimeData(snapId);
            runtime.installPromise = null;
        }
    }
    destroy() {
        super.destroy();
        if (this._timeoutForLastRequestStatus) {
            clearTimeout(this._timeoutForLastRequestStatus);
        }
        this.messagingSystem.unsubscribe('ExecutionService:unhandledError', this._onUnhandledSnapError);
        this.messagingSystem.unsubscribe('ExecutionService:outboundRequest', this._onOutboundRequest);
        this.messagingSystem.unsubscribe('ExecutionService:outboundResponse', this._onOutboundResponse);
    }
    /**
     * Passes a JSON-RPC request object to the RPC handler function of a snap.
     *
     * @param snapId - The ID of the recipient snap.
     * @param origin - The origin of the RPC request.
     * @param request - The JSON-RPC request object.
     * @returns The result of the JSON-RPC request.
     */
    async handleRpcRequest(snapId, origin, request) {
        const handler = await this.getRpcRequestHandler(snapId);
        if (!handler) {
            throw new Error(`Snap RPC message handler not found for snap "${snapId}".`);
        }
        return handler(origin, request);
    }
    /**
     * Gets the RPC message handler for the given snap.
     *
     * @param snapId - The id of the Snap whose message handler to get.
     * @returns The RPC handler for the given snap.
     */
    async getRpcRequestHandler(snapId) {
        const runtime = this._getSnapRuntimeData(snapId);
        const existingHandler = runtime === null || runtime === void 0 ? void 0 : runtime.rpcHandler;
        if (existingHandler) {
            return existingHandler;
        }
        const requestQueue = new RequestQueue_1.RequestQueue(5);
        // We need to set up this promise map to map snapIds to their respective startPromises,
        // because otherwise we would lose context on the correct startPromise.
        const startPromises = new Map();
        const rpcHandler = async (origin, request) => {
            if (this.state.snaps[snapId].enabled === false) {
                throw new Error(`Snap "${snapId}" is disabled.`);
            }
            if (this.state.snaps[snapId].status === SnapStatus.installing) {
                throw new Error(`Snap "${snapId}" is currently being installed. Please try again later.`);
            }
            if (this.isRunning(snapId) === false) {
                let localStartPromise = startPromises.get(snapId);
                if (!localStartPromise) {
                    localStartPromise = this.startSnap(snapId);
                    startPromises.set(snapId, localStartPromise);
                }
                else if (requestQueue.get(origin) >= requestQueue.maxQueueSize) {
                    throw new Error('Exceeds maximum number of requests waiting to be resolved, please try again.');
                }
                requestQueue.increment(origin);
                try {
                    await localStartPromise;
                }
                finally {
                    requestQueue.decrement(origin);
                    // Only delete startPromise for a snap if its value hasn't changed
                    if (startPromises.get(snapId) === localStartPromise) {
                        startPromises.delete(snapId);
                    }
                }
            }
            let _request = request;
            if (!(0, utils_1.hasProperty)(request, 'jsonrpc')) {
                _request = Object.assign(Object.assign({}, request), { jsonrpc: '2.0' });
            }
            else if (request.jsonrpc !== '2.0') {
                throw eth_rpc_errors_1.ethErrors.rpc.invalidRequest({
                    message: 'Invalid "jsonrpc" property. Must be "2.0" if provided.',
                    data: request.jsonrpc,
                });
            }
            const timer = new Timer_1.Timer(this._maxRequestTime);
            this._recordSnapRpcRequestStart(snapId, request.id, timer);
            const handleRpcRequestPromise = this.messagingSystem.call('ExecutionService:handleRpcRequest', snapId, origin, _request);
            // This will either get the result or reject due to the timeout.
            try {
                const result = await this._executeWithTimeout(snapId, handleRpcRequestPromise, timer);
                this._recordSnapRpcRequestFinish(snapId, request.id);
                return result;
            }
            catch (err) {
                await this.stopSnap(snapId, SnapStatusEvent.crash);
                throw err;
            }
        };
        runtime.rpcHandler = rpcHandler;
        return rpcHandler;
    }
    /**
     * Awaits the specified promise and rejects if the promise doesn't resolve
     * before the timeout.
     *
     * @param snapId - The snap id.
     * @param promise - The promise to await.
     * @param timer - An optional timer object to control the timeout.
     * @returns The result of the promise or rejects if the promise times out.
     * @template PromiseValue - The value of the Promise.
     */
    async _executeWithTimeout(snapId, promise, timer) {
        const isLongRunning = await this.messagingSystem.call('PermissionController:hasPermission', snapId, endowments_1.LONG_RUNNING_PERMISSION);
        // Long running snaps have timeouts disabled
        if (isLongRunning) {
            return promise;
        }
        const result = await (0, utils_2.withTimeout)(promise, timer !== null && timer !== void 0 ? timer : this._maxRequestTime);
        if (result === utils_2.hasTimedOut) {
            throw new Error('The request timed out.');
        }
        return result;
    }
    _recordSnapRpcRequestStart(snapId, requestId, timer) {
        const runtime = this._getSnapRuntimeData(snapId);
        runtime.pendingInboundRequests.push({ requestId, timer });
        runtime.lastRequest = null;
    }
    _recordSnapRpcRequestFinish(snapId, requestId) {
        const runtime = this._getSnapRuntimeData(snapId);
        runtime.pendingInboundRequests = runtime.pendingInboundRequests.filter((r) => r.requestId !== requestId);
        if (runtime.pendingInboundRequests.length === 0) {
            runtime.lastRequest = Date.now();
        }
    }
    _getSnapRuntimeData(snapId) {
        if (!this._snapsRuntimeData.has(snapId)) {
            this._snapsRuntimeData.set(snapId, {
                lastRequest: null,
                rpcHandler: null,
                installPromise: null,
                pendingInboundRequests: [],
                pendingOutboundRequests: 0,
            });
        }
        return this._snapsRuntimeData.get(snapId);
    }
    async calculatePermissionsChange(snapId, desiredPermissionsSet) {
        var _a;
        const oldPermissions = (_a = (await this.messagingSystem.call('PermissionController:getPermissions', snapId))) !== null && _a !== void 0 ? _a : {};
        const newPermissions = (0, utils_2.setDiff)(desiredPermissionsSet, oldPermissions);
        // TODO(ritave): The assumption that these are unused only holds so long as we do not
        //               permit dynamic permission requests.
        const unusedPermissions = (0, utils_2.setDiff)(oldPermissions, desiredPermissionsSet);
        // It's a Set Intersection of oldPermissions and desiredPermissionsSet
        // oldPermissions ∖ (oldPermissions ∖ desiredPermissionsSet) ⟺ oldPermissions ∩ desiredPermissionsSet
        const approvedPermissions = (0, utils_2.setDiff)(oldPermissions, unusedPermissions);
        return { newPermissions, unusedPermissions, approvedPermissions };
    }
}
exports.SnapController = SnapController;
//# sourceMappingURL=SnapController.js.map