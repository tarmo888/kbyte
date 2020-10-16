var WebSocket;
if (typeof window !== 'undefined') {
    // @ts-ignore
    WebSocket = window.WebSocket;
}
else {
    WebSocket = require('ws');
}
var wait = function (ws, cb) {
    setTimeout(function () {
        if (ws.readyState === 1) {
            if (cb !== null)
                cb();
        }
        else {
            wait(ws, cb);
        }
    }, 5);
};
var Client = /** @class */ (function () {
    function Client(address) {
        var _this = this;
        this.address = address;
        this.ws = new WebSocket(address);
        this.queue = {};
        this.notifications = [];
        this.open = false;
        this.ws.addEventListener('message', function (payload) {
            var message = JSON.parse(payload.data);
            if (!message || !Array.isArray(message) || message.length !== 2)
                return;
            if (_this.queue[message[1].tag]) {
                var error = message[1].response.error || null;
                var result = error ? null : message[1].response;
                var callback = _this.queue[message[1].tag];
                delete _this.queue[message[1].tag]; // cleanup
                callback(error, result);
            }
            else {
                _this.notifications.forEach(function (n) { return n(message); });
            }
        });
        this.ws.addEventListener('open', function () {
            _this.open = true;
        });
        this.ws.addEventListener('close', function () {
            _this.open = false;
        });
    }
    Client.prototype.subscribe = function (cb) {
        this.notifications.push(cb);
    };
    Client.prototype.send = function (message) {
        var _this = this;
        wait(this.ws, function () {
            _this.ws.send(JSON.stringify(message));
        });
    };
    Client.prototype.request = function (command, params, cb) {
        var tag = Math.random().toString(36).substring(7);
        var request = { command: command, params: params, tag: tag };
        this.queue[request.tag] = cb;
        this.send(['request', request]);
    };
    Client.prototype.respond = function (command, tag, message) {
        var respond = { command: command, tag: tag };
        if (typeof message !== 'undefined')
            respond['response'] = message;
        this.send(['response', respond]);
    };
    Client.prototype.error = function (command, tag, message) {
        this.respond(command, tag, { error: message });
    };
    Client.prototype.justsaying = function (subject, body) {
        var justsaying = { subject: subject, body: body };
        this.send(['justsaying', justsaying]);
    };
    return Client;
}());

var main = { Client: Client };

export default main;
