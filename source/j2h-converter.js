var J2HConverter = function(sourceJson, container) { 
    this.sourceJson = sourceJson.trim();
    this.container = container;
    this.attributes = null;
}

J2HConverter.prototype = {

    convert: function() {
        var jsonStr = this._jsonObjToArray(this.sourceJson);
        var data = JSON.parse(jsonStr);
        var table = this._createTable(data);
        if (table) {
            this._setAttributes(table, this.attributes);
            document.querySelector('#' + this.container).innerHTML = '';
            document.querySelector('#' + this.container).appendChild(table);
        }
    },

    _createTable: function(jsonData) {
        var jsonStruct = this._getJsonStructure(jsonData);
        if (jsonStruct == this._jsonStruct.unknown)
            throw 'JSON structure not supported. Root object must be an array.';

        var keys = [];
        if (jsonStruct == this._jsonStruct.stringArray) keys.push('item');
        else if (jsonStruct == this._jsonStruct.objectArray) keys = this._getKeys(jsonData);

        if (keys.length > 0) {
            var table = document.createElement('table');
            this._setHeader(table, keys);
            this._setBody(table, keys, jsonData, jsonStruct);
            return table;
        }
        return null;
    },

    _getJsonStructure: function(parsedJson) {
        if(parsedJson && parsedJson.length > 0) {
            if (typeof parsedJson[0] == 'string') return this._jsonStruct.stringArray;
            else if (typeof parsedJson[0] == 'object') return this._jsonStruct.objectArray;
        }
        return this._jsonStruct.unknown;
    },

    _setAttributes: function(srcTable, attributes) {
        if (attributes) {
            for(var key in attributes)
                srcTable.setAttribute(key, attributes[key]);
        }
        else {
            srcTable.border = '1';
            srcTable.style.borderCollapse = 'collapse';
        }
    },

    _setHeader: function(srcTable, colData) {
        var header = srcTable.createTHead();
        var headerRow = header.insertRow(0);
        colData.forEach(function(colDataItem, colDataItemIdx) {
            var cell = headerRow.insertCell(colDataItemIdx);
            cell.textContent = colDataItem;
        });
    },

    _setBody: function(srcTable, colData, rowData, jsonStruct) {
        var body = srcTable.createTBody();
        var row, cell;
        rowData.forEach(function(rowDataItem, rowDataItemIdx) {
            row = body.insertRow(rowDataItemIdx);
            colData.forEach(function(colDataItem, colDataItemIdx) {
                cell = row.insertCell(colDataItemIdx);
                if (jsonStruct == this._jsonStruct.stringArray)
                    cell.textContent = rowDataItem;
                else if (jsonStruct == this._jsonStruct.objectArray) {
                    if(rowDataItem.hasOwnProperty(colDataItem)) {
                        var colDataStr = this._jsonObjToArray(JSON.stringify(rowDataItem[colDataItem]));
                        var colDataJson = JSON.parse(colDataStr);
                        var colDataStruct = this._getJsonStructure(colDataJson);
                        if (colDataStruct == this._jsonStruct.unknown || colDataStruct == this._jsonStruct.stringArray) {
                            cell.textContent = colDataJson; // Show as-is
                        }
                        else {
                            var info = document.createElement('a');
                            info.innerHTML = '&#43;';
                            info.href = '#';
                            info.style.fontWeight = 'bold';
                            info.style.textDecoration = 'none';
                            info.args = {
                                srcTable: srcTable,
                                srcColumn: colDataItem,
                                rowData: colDataJson,
                                processRowData: true,
                                colState: 'collapsed'
                            };
                            info.addEventListener('click', this._toggleDetail.bind(this), false);
                            cell.appendChild(info);
                        }
                    }
                }
            }, this);
        }, this);
    },

    _toggleDetail: function(e) {
        var srcTable = e.target.args.srcTable;
        var srcColumn = e.target.args.srcColumn;
        var rowData = e.target.args.rowData;
        var parentRowIdx, trHeading, trDetail;

        if(e.target.args.colState == 'collapsed') {
            if(e.target.args.processRowData) { // Create table only for the first time
                parentRowIdx = e.target.parentElement.parentElement.rowIndex;

                trHeading = srcTable.tBodies[0].insertRow(parentRowIdx);
                trHeading.id = 'trh_' + parentRowIdx + '_' + srcColumn;
                var tdHeading = trHeading.insertCell(0);
                tdHeading.colSpan = srcTable.rows[parentRowIdx].cells.length.toString();
                tdHeading.style.fontWeight = 'bold';
                tdHeading.textContent = srcColumn;

                trDetail = srcTable.tBodies[0].insertRow(parentRowIdx + 1);
                trDetail.id = 'trd_' + parentRowIdx + '_' + srcColumn;
                var tdDetail = trDetail.insertCell(0);
                tdDetail.colSpan = srcTable.rows[parentRowIdx].cells.length.toString();

                var table = this._createTable(rowData);
                if (table) tdDetail.appendChild(table);

                e.target.args.processRowData = false;
                e.target.args.parentRowIdx = parentRowIdx;
            }
            else { // Just display on subsequent toggles
                parentRowIdx = e.target.args.parentRowIdx;
                trHeading = srcTable.tBodies[0].querySelector('#trh_' + parentRowIdx + '_' + srcColumn);
                trDetail = srcTable.tBodies[0].querySelector('#trd_' + parentRowIdx + '_' + srcColumn);
                trHeading.style.display = 'table-row';
                trDetail.style.display = 'table-row';
            }
            e.target.args.colState = 'expanded';
            e.target.innerHTML = '&ndash;';
        }
        else if (e.target.args.colState == 'expanded') { // Hide
            parentRowIdx = e.target.args.parentRowIdx;
            trHeading = srcTable.tBodies[0].querySelector('#trh_' + parentRowIdx + '_' + srcColumn);
            trDetail = srcTable.tBodies[0].querySelector('#trd_' + parentRowIdx + '_' + srcColumn);
            trHeading.style.display = 'none';
            trDetail.style.display = 'none';
            e.target.args.colState = 'collapsed';
            e.target.innerHTML = '&#43;';
        }
    },

    _getKeys: function(json) {
    	var keys = [];
    	json.forEach(function(item) {
        	for(var key in item) {
        		if(keys.indexOf(key) > -1)
        			continue;
        		keys.push(key);
        	}
        });
        return keys;
    },

    _jsonObjToArray: function(jsonStr) {
        if (jsonStr.startsWith('{') && jsonStr.endsWith('}'))
            return '[' + jsonStr + ']'; // Change to array of single object
        else
            return jsonStr;
    },

    _jsonStruct: {
        stringArray: 'JSON_AS_STRING_ARRAY',
        objectArray: 'JSON_AS_OBJECT_ARRAY',
        unknown: 'JSON_STRUCTURE_UNKNOWN'
    }
}