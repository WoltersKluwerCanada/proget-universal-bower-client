"use strict";

import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import testPort from "./conf";

const upackInitial = fs.readFileSync(path.join(__dirname, "..", "data", "pkg.upack"));

const header = {
    "Cache-Control": "private",
    "Content-Type": "application/json"
};

let instance = null;

class Server {
    public static extractUserPassword(request) {
        const auth = request.headers.authorization.replace("Basic ", "");
        const decrypt = (new Buffer(auth, "base64")).toString().split(":");

        const user = decrypt[0];
        const password = decrypt[1];

        return {user, password};
    }

    public port: string = testPort;
    public lastFileInfo: {name: string, same: boolean};
    public started: boolean = false;
    public server = http.createServer(this.router);

    constructor() {
        if (!instance) {
            instance = this;
        }

        return instance;
    }

    /**
     * Route the request to their methods
     *
     * @param request - The client request
     * @param response - The server response
     */
    public router(request, response) {
        const auth = Server.extractUserPassword(request);

        if (request.url === "/upack/unableToAuth/upload") {
            response.writeHead(401, header);
            response.end("Unauthorized access!");
        } else if (auth.user === "testUser" && auth.password === "testP4ssw0rd") {
            if (request.method === "POST" && request.url === "/upack/testFeed/upload") {
                instance.responseToUpload(request, response);
            } else {
                response.writeHead(404, header);
                response.end(`Can't found the requested url ${request.url}`);
            }
        } else {
            response.writeHead(403, header);
            response.end("Forbidden access!");
        }
    }

    /**
     * Download the test zip package
     *
     * @param request - The client request
     * @param response - The server response
     */
    public responseToUpload(request, response) {
        response.writeHead(200, header);

        const bufs = [];

        request.on("data", function(d) {
            bufs.push(d);
        });

        request.on("end", function() {
            const buf = Buffer.concat(bufs);

            if (buf.compare(upackInitial) === 0) {
                instance.lastFileInfo = {
                    name: request.headers.name,
                    same: true
                };
                response.end();
            } else {
                instance.lastFileInfo = {
                    name: request.headers.name,
                    same: false
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
    public startServer(callback) {
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
    public stopServer(callback) {
        if (instance.started) {
            instance.started = false;

            instance.server.close(() => {
                callback();
            });
        } else {
            callback();
        }
    }
}

export default Server;
