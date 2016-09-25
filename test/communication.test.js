"use strict";

const path = require("path");

const communication = require("../lib/communication");

describe.skip("communication", () => {
    let pkgFolder = path.join(__dirname, "data", "pkg.upack");

    it("send a file to ProGet", (done) => {
        // TODO create a fake server here because now we testing on the real one
        communication(pkgFolder, "http://<proget>/upack/<feed>/upload", "<user>", new Buffer("<apssword>").toString("base64"), (err) => {
            done(err);
        });
    });
});