/*
 Version: 2.0.0
  Author: Julien Gustin
 Website: https://julien-gustin.be
 */

import { Tooltip } from 'bootstrap';

class Bootgrid {

    constructor(element, params) {

        this._element = element;
        this._params = params;
        this._selected = [];

        this.bootgrid();
        this.initControls();
        this.initHeaderToolTips();

        return this;
    }

    bootgrid()
    {
        const self = this;
        $(self._element).data('page', 1);
        self.loadPage();
    }

    initControls()
    {
        this.initSortHeader();
        this.initRowCountSelector();
        this.initPrevNextPage();
        this.initAutoSubmit();
        this.setSortDirectionIndicator();
        this.initExport();
    }

    initHeaderToolTips()
    {
        const self = this;
        $('thead a[data-bs-toggle="tooltip"]', $(self._element)).each((index, el) => {
            new Tooltip(el)
        });
    }

    initBodyToolTips()
    {
        const self = this;
        $('tbody [data-bs-toggle="tooltip"]', $(self._element)).each((index, el) => {
            new Tooltip(el)
        });
    }

    /**
     * Init select functionality, manage check/uncheck input checkbox col of data-column-type="select"
     * Param select should be true
     */
    initSelect()
    {
        const self = this;
        if(!self._params.select){
            return;
        }

        $('.table-bootgrid-input-check ', $(self._element)).click((e) => {
            const $input = $(e.currentTarget);
            const value = $input.val();
            const isChecked = $input.prop('checked');
            if(isChecked){
                // Add item to selected
                if(!self._selected.includes(value)){
                    self._selected.push(value);
                }
            }else{
                // Remove item from selected
                self._selected = self._selected.filter(function(item) {
                    return item !== value
                })
            }
        })
    }

    initSortHeader()
    {
        const self = this;
        $('thead th a', $(self._element)).click((e) => {
            e.preventDefault();
            const $link = $(e.currentTarget);
            const $col = $link.parent('th');
            const sortColumn = $col.data('sort-column');
            if(sortColumn == undefined){
                return;
            }
            const currentSortColumn = self.getSortColumn();
            const currentSortDirection = self.getSortDirection();
            if(currentSortColumn == sortColumn){
                $(self._element).data('sort-direction', currentSortDirection == "asc" ? "desc" : "asc");
            }else{
                $(self._element).data('sort-direction', "asc");
            }
            $(self._element).data('sort-column', sortColumn);
            self.setSortDirectionIndicator();
            self.loadPage();
        });
    }

    getSortDirection()
    {
        const self = this;
        const sortDirection = $(self._element).data('sort-direction');
        return sortDirection == undefined ? null : sortDirection;
    }

    getSortColumn()
    {
        const self = this;
        const sortColumn = $(self._element).data('sort-column');
        return sortColumn == undefined ? null : sortColumn;
    }

    initRowCountSelector()
    {
        const self = this;

        const initialCountRow = $(self._element).data('row-count');
        if(initialCountRow != undefined){
            $('.rowCount',  $(self._element)).html(initialCountRow);
        }

        $('.row-count-selector a', $(self._element)).click((e) => {
            const $link = $(e.currentTarget);
            e.preventDefault();
            const rowCount = $link.data('row-count');
            $('.rowCount',  $(self._element)).html(rowCount);
            $(self._element).data('row-count', rowCount);
            $(self._element).data('page', 1);
            self.loadPage();
        })
    }

    initPrevNextPage()
    {
        const self = this;
        $('.js-prev-page').click((e) => {
            e.preventDefault();
            let page = $(self._element).data('page');
            $(self._element).data('page', page-1);
            self.loadPage();
        })
        $('.js-next-page', $(self._element)).click((e) => {
            e.preventDefault();
            let page = $(self._element).data('page');
            $(self._element).data('page', page+1);
            self.loadPage();
        })
    }

    // Auto submit
    initAutoSubmit()
    {
        const self = this;

        // Select
        $('select', $(self._element)).change(() => {
            $(self._element).data('page', 1);
            self.loadPage();
        })

        // Fulltext search
        $('input[type=text]', $(self._element)).keyup(() => {
            clearTimeout(self.keyupInterval);
            self.keyupInterval = setTimeout(() => {
                $(self._element).data('page', 1);
                self.loadPage();
            }, 500);
        });

        // Date picker
        $('.table-search-header-filters-advanced .datepicker', $(self._element)).on('apply.daterangepicker', function (ev, picker) {
            $(self._element).data('page', 1);
            self.loadPage();
        });

        // Radio || checkbox
        $('input[type=radio], input[type=checkbox]', $(self._element)).change(() => {
            $(self._element).data('page', 1);
            self.loadPage();
        })
    }

    loadPage()
    {
        const self = this;
        $("table tbody", $(self._element)).css({opacity: 0.4});
        const formFilters = self._params.getFilters();
        $.ajax({
            url: $(self._element).data('url'),
            cache:false,
            data: Object.assign(
            {
                    page: $(self._element).data('page'),
                    rowCount: $(self._element).data('row-count'),
                }, formFilters
                , self.getSortData()
            ),
            context: document.body
        }).done((result) => {
            $("table tbody", $(self._element)).css({opacity: 1});
            $("table tbody tr", $(self._element)).remove();
            if(result){
                self.writeRows(result.rows);
                self.writeCurrentPageOf(result)
                self.showHidePrevNextLinks(result)
                self.initBodyToolTips();
                self.initSelect();
                self._params.pageRendered();
            }else{

            }
        });
    }

    getSortData()
    {
        const sortData = {};
        if(this.getSortColumn() != null){
            sortData.sortColumn = this.getSortColumn();
        }
        if(this.getSortDirection() != null){
            sortData.sortDirection = this.getSortDirection();
        }
        return sortData;
    }

    setSortDirectionIndicator()
    {
        // <i class="far fa-arrow-up"></i>
        const self = this;
        if(self.getSortDirection() == null){
            return;
        };
        $('thead th .far', $(self._element)).remove();
        if(self.getSortDirection() == "asc"){
            $("thead th[data-sort-column='"+self.getSortColumn()+"'] a", $(self._element)).prepend('<i class="far fa-arrow-down"></i> ')
        }else{
            $("thead th[data-sort-column='"+self.getSortColumn()+"'] a", $(self._element)).prepend('<i class="far fa-arrow-up"></i> ')
        }
    }

    writeCurrentPageOf(result)
    {
        const start = (result.page-1) * result.rowCount + 1;
        let end = (result.page) * result.rowCount;
        if(end > result.total){
            end = result.total;
        }
        $('.current-page-of', $(this._element)).html(start + "-"+end+" of " + result.total);
    }

    showHidePrevNextLinks(result)
    {
        const self = this;
        if(result.page > 1){
            $('.js-prev-page', $(self._element)).show();
        }else{
            $('.js-prev-page', $(self._element)).hide();
        }
        let end = (result.page) * result.rowCount;

        if(end < result.total){
            $('.js-next-page', $(self._element)).show();
        }else{
            $('.js-next-page', $(self._element)).hide();
        }
    }

    writeRows(rows)
    {
        const self = this;
        const cols = $("thead th", $(self._element));
        $.each(rows, (index, row) => {
            var tr = document.createElement("tr");

            // Add row class if defined
            if(row['extra'] != undefined){
                if(row['extra']['rowClass'] != undefined){
                    $(tr).addClass(row['extra']['rowClass']);
                }
            }

            // Write all column defined with column-id
            $.each(cols, (index, col) => {
                const colColumnId = $(col).data('column-id');
                const colColumnClass = $(col).data('column-class');
                const colColumnType = $(col).data('column-type') ?? "text";

                if(colColumnId != undefined && colColumnId != "" ){

                    const rowCol = document.createElement("td");

                    switch(colColumnType){
                        case 'img':
                            const img = document.createElement("img");
                            $(img).attr('src', row[colColumnId].src);
                            $(img).attr('style', row[colColumnId].style);
                            rowCol.appendChild(img);
                            break;
                        case 'html':
                            if(row[colColumnId] != null){
                                $(rowCol).html(row[colColumnId]);
                            }
                            break;
                        case 'select':
                            const isSelected = self._selected.includes(row['id'].toString());
                            const checkedAttr = isSelected ? 'checked="checked"' : '';
                            const input = `<input type="checkbox" class="table-bootgrid-input-check" value="${row['id']}" ${checkedAttr} />`;
                            $(rowCol).html(input);
                            break;
                        case 'commands':
                            $(rowCol).addClass('text-end');
                            $.each(row.commands, (index, commandInfo) => {
                                const command = document.createElement("a");
                                $(command).html(commandInfo.title)
                                $(command).addClass(commandInfo.class).attr('href', commandInfo.link);
                                if(commandInfo.target != undefined){
                                    $(command).attr('target', commandInfo.target);
                                }
                                rowCol.appendChild(command);
                            });
                            break;
                        default:
                            if(row[colColumnId] != null) {
                                $(rowCol).html(row[colColumnId]);
                            }
                    }

                    tr.appendChild(rowCol);

                    if(colColumnClass != undefined && colColumnClass != ""){
                        const classesArray = colColumnClass.split(" ");
                        classesArray.forEach(function (classItem, index) {
                            rowCol.classList.add(classItem);
                        });
                    }
                }
            });

            $("tbody", $(self._element)).get(0).appendChild(tr);
        });
    }

    initExport()
    {
        const self = this;
        $('.js-export', $(self._element)).click((e) => {
            e.preventDefault();
            const $link = $(e.currentTarget);
            document.location.href = $link.data('export-url') + "?" + self.objectAsQueryString(self.getFormDataAsObject($('.form-data-adv-search', $(self._element)).get(0)));
        });
    }

    setOrPush(target, val) {
        var result = val;
        if (target) {
            result = [target];
            result.push(val);
        }
        return result;
    }

    objectAsQueryString(obj, prefix) {
        var str = [],
            p;
        for (p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p,
                    v = obj[p];
                str.push((v !== null && typeof v === "object") ?
                    serialize(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    }

    getFormDataAsObject(formElement) {
        const self = this;
        var formElements = formElement.elements;
        var formParams = {};
        var i = 0;
        var elem = null;
        for (i = 0; i < formElements.length; i += 1) {
            elem = formElements[i];
            switch (elem.type) {
                case 'submit':
                    break;
                case 'radio':
                    if (elem.checked) {
                        formParams[elem.name] = elem.value;
                    }
                    break;
                case 'checkbox':
                    if (elem.checked) {
                        formParams[elem.name] = self.setOrPush(formParams[elem.name], elem.value);
                    }
                    break;
                default:
                    formParams[elem.name] = self.setOrPush(formParams[elem.name], elem.value);
            }
        }
        return formParams;
    }


    // **************************************************************
    // Public methods
    // **************************************************************
    getSelected()
    {
        return this._selected;
    }
}

export { Bootgrid };