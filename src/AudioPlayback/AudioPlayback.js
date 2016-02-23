var logger = require('enyo/logger');
logger.warn('moonstone-extra/AudioPlayback has moved to "moonstone". Please update your code.');

/**
* Temporary proxy for {@link module:moonstone/AudioPlayback}
*
* @deprecated
* @module moonstone-extra/AudioPlayback
*/
module.exports = require('moonstone/AudioPlayback');