"use strict";

/* tslint:disable:only-arrow-functions no-unused-expression */

import {expect} from "chai";
import * as path from "path";
import Authentication from "../../src/Authentication";

// Test the CreateError module methods
describe("Authentication", function() {
    // Test with only the minimal information
    it("with local .npmrc and auth information", function() {
        try {
            const auth = Authentication.getInstance();

            auth.addPossibleConfigFolder(path.join(__dirname, "..", "data"));

            expect(auth.getCredentialsByURI("http://localhost/npm/"))
                .eql({password: "testP4ssw0rd", username: "testUser"});
        } catch (e) {
            throw e;
        }
    });
});
