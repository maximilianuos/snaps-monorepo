declare type WebSocketCallback = (this: WebSocket, ev: any) => any;
declare const endowmentModule: {
    names: readonly ["fetch", "WebSocket"];
    factory: () => {
        fetch: typeof fetch;
        WebSocket: {
            new (url: string | URL, protocols?: string | string[] | undefined): {
                onclose: WebSocketCallback | null;
                onerror: ((this: WebSocket, ev: Event) => any) | null;
                onmessage: ((this: WebSocket, ev: MessageEvent<any>) => any) | null;
                onopen: ((this: WebSocket, ev: Event) => any) | null;
                close(code?: number | undefined, reason?: string | undefined): void;
                send(data: string | Blob | ArrayBufferView | ArrayBufferLike): void;
                readonly CLOSED: number;
                readonly CLOSING: number;
                readonly CONNECTING: number;
                readonly OPEN: number;
                binaryType: BinaryType;
                readonly bufferedAmount: number;
                readonly extensions: string;
                readonly protocol: string;
                readonly readyState: number;
                readonly url: string;
                addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
                addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
                removeEventListener<K_1 extends keyof WebSocketEventMap>(type: K_1, listener: (this: WebSocket, ev: WebSocketEventMap[K_1]) => any, options?: boolean | EventListenerOptions | undefined): void;
                removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
                dispatchEvent(event: Event): boolean;
                "__#641@#teardownClose"(): Promise<void>;
                "__#641@#createWrapped"(listener: WebSocketCallback): WebSocketCallback;
                "__#641@#createWrapped"(listener: null): null;
                "__#641@#createWrapped"(listener: WebSocketCallback | null): WebSocketCallback | null;
                "__#641@#socket": WebSocket;
                /**
                 * After this is set to true, no new event listeners can be added
                 */
                "__#641@#isTornDown": boolean;
                "__#641@#events": Record<string, Map<WebSocketCallback, WebSocketCallback>>;
                "__#641@#onopenOriginal": WebSocketCallback | null;
                "__#641@#onmessageOriginal": WebSocketCallback | null;
                "__#641@#onerrorOriginal": WebSocketCallback | null;
                "__#641@#oncloseOriginal": WebSocketCallback | null;
            };
        };
        teardownFunction: () => Promise<void>;
    };
};
export default endowmentModule;
