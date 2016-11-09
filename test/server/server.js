"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const conf = require("./conf");

const upackInitial = fs.readFileSync(path.join(__dirname, "..", "data", "pkg.upack"));

const header = {
    "Content-Type": "application/json",
    "Cache-Control": "private"
};

let instance = null;

class Server {
    constructor() {
        if (!instance) {
            instance = this;

            this.port = conf.testPort;
            this.lastFileInfo = {};
            this.started = false;
            this.server = http.createServer(this.router);
        }

        return instance;
    }

    static extractUserPassword(request) {
        let auth = request.headers.authorization.replace("Basic ", "");
        let decrypt = (new Buffer(auth, "base64")).toString().split(":");

        let user = decrypt[0];
        let password = decrypt[1];

        return {user, password};
    }

    /**
     * Route the request to their methods
     *
     * @param request - The client request
     * @param response - The server response
     */
    router(request, response) {
        let auth = Server.extractUserPassword(request);

        if (auth.user === "testUser" && auth.password === "testP4ssw0rd") {
            if (request.method === "POST" && request.url === "/upack/testFeed/upload") {
                instance.responseToUpload(request, response);
            } else {
                response.writeHead(404, header);
                response.end(`Can't found the requested url ${request.url}`);
            }
        } else {
            response.writeHead(403, header);
            response.end("Unauthorized access!");
        }
    }

    /**
     * Download the test zip package
     *
     * @param request - The client request
     * @param response - The server response
     */
    responseToUpload(request, response) {
        response.writeHead(200, header);

        let bufs = [];

        request.on("data", function (d) {
            bufs.push(d);
        });

        request.on("end", function () {
            let buf = Buffer.concat(bufs);

            if (buf.compare(upackInitial) === 0) {
                instance.lastFileInfo = {
                    same: true,
                    name: request.headers.name
                };
                response.end();
            } else {
                instance.lastFileInfo = {
                    same: false,
                    name: request.headers.name
                };
                response.end();
            }
        });
    }

    /**
     * Request to start the server
     *
     * @param callback - The method to call after the execution
     */
    startServer(callback) {
        if (!instance.started) {
            instance.started = true;

            instance.server.listen(instance.port, () => {
                callback();
            });
        } else {
            callback();
        }
    }

    /**
     * Request to close the server
     *
     * @param callback - The method to call after the execution
     */
    stopServer(callback) {
        if (instance.started) {
            instance.started = false;

            instance.server.close(()=> {
                callback();
            });
        } else {
            callback();
        }
    }
}

module.exports = Server;
