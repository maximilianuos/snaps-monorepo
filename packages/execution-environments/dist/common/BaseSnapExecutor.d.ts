/// <reference types="node" />
/// <reference types="ses" />
import { Duplex } from 'stream';
import { JsonRpcNotification } from '@metamask/utils';
import { Endowments, JSONRPCID } from '../__GENERATED__/openrpc';
export declare class BaseSnapExecutor {
    private snapData;
    private commandStream;
    private rpcStream;
    private methods;
    private snapErrorHandler?;
    private snapPromiseErrorHandler?;
    protected constructor(commandStream: Duplex, rpcStream: Duplex);
    private errorHandler;
    private onCommandRequest;
    protected notify(requestObject: Omit<JsonRpcNotification<Record<string, unknown> | unknown[]>, 'jsonrpc'>): void;
    protected respond(id: JSONRPCID, responseObj: Record<string, unknown>): void;
    /**
     * Attempts to evaluate a snap in SES. Generates APIs for the snap. May throw
     * on errors.
     *
     * @param snapName - The name of the snap.
     * @param sourceCode - The source code of the snap, in IIFE format.
     * @param _endowments - An array of the names of the endowments.
     */
    protected startSnap(snapName: string, sourceCode: string, _endowments?: Endowments): Promise<void>;
    /**
     * Cancels all running evaluations of all snaps and clears all snap data.
     * NOTE:** Should only be called in response to the `terminate` RPC command.
     */
    protected onTerminate(): void;
    private registerSnapExports;
    /**
     * Instantiates a snap provider object (i.e. `globalThis.wallet`).
     *
     * @returns The snap provider object.
     */
    private createSnapProvider;
    /**
     * Removes the snap with the given name.
     *
     * @param snapName - The name of the snap to remove.
     */
    private removeSnap;
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
    private executeInSnapContext;
}
