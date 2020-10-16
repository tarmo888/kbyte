export default class Client {
    private readonly address;
    private readonly ws;
    private readonly queue;
    private notifications;
    private open;
    constructor(address: string);
    subscribe(cb: any): void;
    send(message: any): void;
    request(command: string, params: any, cb?: any): void;
    respond(command: string, tag: string, message?: any): void;
    error(command: string, tag: string, message: string): void;
    justsaying(subject: string, body?: any): void;
}
