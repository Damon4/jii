/**
 * @author Vladimir Kozhin <affka@affka.ru>
 * @license MIT
 */

'use strict';

const Jii = require('../BaseJii');
const Event = require('../base/Event');

class FetchEvent extends Event {

    preInit() {
        /**
         * @type {boolean}
         */
        this.isLoading = false;

        super.preInit(...arguments);
    }

}
module.exports = FetchEvent;