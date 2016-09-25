// This file is here to contain global JsDoc definitions

// Global callback doc
/**
 * This callback is displayed as a global member.
 * @callback requestCallback
 * @param {?Error} err
 * @param {?string|Array|{}} data
 */

/**
 * This callback is displayed as a global member.
 * @callback requestCallbackCred
 * @param {?Error} err
 * @param {?{usr: string, pass: string}} data
 */

/**
 * This callback is displayed as a global member.
 * @callback requestCallbackStatus
 * @param {?Error} err
 */

/**
 * This callback is displayed as a global member.
 * @callback requestCallbackBowerRc
 * @param {?Error} err
 * @param {?bowerrc} data
 */

// Global program doc
/**
 * @typedef {{}} program
 * @property {?string} outputDirectory - The repository to output the created package to.
 * @property {?boolean} force - If the command pack must be force.
 * @property {?string} push - The path to the archive to push.
 * @property {?boolean|string} pack - Pack the current folder.
 * @property {?string} deploy - The path to the archive to deploy.
 * @property {?string|boolean} Version - The new version of the package.
 * @property {?string|boolean} Feed - The new feed of the package.
 * @property {?string} source - The address to the server to push to.
 */

// Global ignore doc
/**
 * @typedef {{}} ignore
 * @property {function} add - Add a pattern to ignore.
 * @property {function} filter - Filters the given array of path names, and returns the filtered array.
 * @property {function} createFilter - Creates a filter function which could filter an array of paths with Array.prototype.filter.
 */

// Global bowerrc doc
/**
 * @typedef {{}} bowerrc
 * @property {{}} proget
 * @property {string} proget.server
 * @property {string|Number} proget.feed
 * @property {boolean} proget.secure
 */

// Global zip doc
/**
 * @typedef {module.exports} zip
 * @property {function} getEntries - Output an array of ZipEntry records
 * @property {function} readAsText - Outputs the content of the specified file
 * @property {function} extractEntryTo - Extracts the specified file to the specified location
 * @property {function} extractAllTo - Extracts everything
 * @property {function} addFile - Add file directly
 * @property {function} addLocalFile - Add local file
 * @property {function} willSendthis - Get everything as a buffer
 * @property {function} writeZip - Write everything to disk
 */