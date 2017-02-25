"use strict";
/**
 * CreateError module.
 * @module createError
 */
import ErrorN from "./ErrorN";

/**
 * Create an error
 */
const createError = (msg: string, code: string, props?: Object): ErrorN => {
    const err: ErrorN = new ErrorN(msg);
    err.code = code;

    if (props) {
        Object.assign(err, props);
    }

    return err;
};

export default createError;
