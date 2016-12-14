'use strict';

var Jii = require('../../../BaseJii');
var BaseObject = require('../../../base/Object');
class PluginInterface extends BaseObject {

    preInit() {
        /**
     * @type {Jii.comet.client.Client}
     */
        this.comet = null;
        super.preInit(...arguments);
    }

}
module.exports = PluginInterface;