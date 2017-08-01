"use strict";

import ErrorN from "./ErrorN";

const createError = (msg: string, code: string, props?: object): ErrorN => {
    const err: ErrorN = new ErrorN(msg);
    err.code = code;

    if (props) {
        Object.assign(err, props);
    }

    return err;
};

export default createError;
