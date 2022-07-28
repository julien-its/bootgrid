class FormToObject{

    constructor(elements, checkValid) {
        return this.formToJSON(elements, checkValid);
    }

    formToJSON(elements, checkValid) {
        const self = this;
        return [].reduce.call(elements, (data, element) => {

            // Make sure the element has the required properties and should be added.
            if ((!checkValid || self.isValidElement(element)) && self.isValidValue(element)) {
                /*
                 * Some fields allow for more than one value, so we need to check if this
                 * is one of those fields and, if so, store the values as an array.
                 */
                if (self.isCheckbox(element)) {
                    data[element.name] = (data[element.name] || []).concat(element.value);
                } else if (self.isMultiSelect(element)) {
                    data[element.name] = self.getSelectValues(element);
                } else {
                    data[element.name] = element.value;
                }
            }
            return data;

        }, {})
    }


    /**
     * Checks that an element has a non-empty `name` and `value` property.
     * @param  {Element} element  the element to check
     * @return {Bool}             true if the element is an input, false if not
     */
    isValidElement(element) {
        return element.name && element.value;
    }

    /**
     * Checks if an element’s value can be saved (e.g. not an unselected checkbox).
     * @param  {Element} element  the element to check
     * @return {Boolean}          true if the value should be added, false if not
     */
    isValidValue(element){
        return (!['checkbox', 'radio'].includes(element.type) || element.checked);
    }

    /**
     * Checks if an input is a checkbox, because checkboxes allow multiple values.
     * @param  {Element} element  the element to check
     * @return {Boolean}          true if the element is a checkbox, false if not
     */
    isCheckbox(element){
        return element.type === 'checkbox';
    }

    /**
     * Checks if an input is a `select` with the `multiple` attribute.
     * @param  {Element} element  the element to check
     * @return {Boolean}          true if the element is a multiselect, false if not
     */
    isMultiSelect(element){
        return element.options && element.multiple;
    }

    /**
     * Retrieves the selected options from a multi-select as an array.
     * @param  {HTMLOptionsCollection} options  the options for the select
     * @return {Array}                          an array of selected option values
     */
    getSelectValues(options){
        return [].reduce.call(options, (values, option) => {
            return option.selected ? values.concat(option.value) : values;
        }, [])
    };

}
export default FormToObject;