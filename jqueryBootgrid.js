/*
 Version: 2.0.0
  Author: Julien Gustin
 Website: https://julien-gustin.be
 */

import { Bootgrid } from './bootgrid';

const JqueryBootgrid = (($) => {

    const NAME  = 'bootgrid';
    const DATA_KEY  = 'jits.bootgrid';

    class jqueryBootgrid extends Bootgrid {

        constructor(element, params) {
            super(element, params);
        };

        // Static
        static _jQueryInterface(config) {
            const defauts  =
                {
                    select: false,
                    getFilters: () => { return {} },
                    pageRendered: () => { return {} }
                };
            let params = $.extend(defauts, config);
            return this.each(function () {
                const $element = $(this);
                let data = $element.data(DATA_KEY);
                if (!data) {
                    data = new jqueryBootgrid(this, params);
                    $element.data(DATA_KEY, data);
                }
            })
        }
    }

    /**
     * ------------------------------------------------------------------------
     * jQuery
     * ------------------------------------------------------------------------
     */

    $.fn[NAME]             = jqueryBootgrid._jQueryInterface;
    $.fn[NAME].Constructor = jqueryBootgrid;
    $.fn[NAME].noConflict  = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return jqueryBootgrid._jQueryInterface
    };
    return jqueryBootgrid;
})($);

export default JqueryBootgrid