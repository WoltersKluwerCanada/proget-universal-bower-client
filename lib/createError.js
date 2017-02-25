"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorN_1 = require("./ErrorN");
const createError = (msg, code, props) => {
    const err = new ErrorN_1.default(msg);
    err.code = code;
    if (props) {
        Object.assign(err, props);
    }
    return err;
};
exports.default = createError;
//# sourceMappingURL=createError.js.map