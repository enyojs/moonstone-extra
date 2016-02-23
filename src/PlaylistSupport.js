var logger = require('enyo/logger');
logger.warn('moonstone-extra/PlaylistSupport has moved to "moonstone". Please update your code.');

/**
* Temporary proxy for {@link module:moonstone/PlaylistSupport}
*
* @deprecated
* @module moonstone-extra/PlaylistSupport
*/
require('enyo/logger').warn('This module has moved to "moonstone". Please update your code.');
module.exports = require('moonstone/PlaylistSupport');