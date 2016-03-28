var
	kind = require('enyo/kind'),
	logger = require('enyo/logger');

logger.warn('moonstone-extra/VideoInfoHeader has been deprecated as part of an updated VideoPlayer'
	+ ' design. Please update your code.');

/**
* Temporary proxy for {@link module:moonstone/VideoInfoHeader}
*
* @deprecated
* @module moonstone-extra/VideoInfoHeader
*/
module.exports = kind({
	name: 'moon.VideoInfoHeader'
});