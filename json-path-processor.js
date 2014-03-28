/*jslint node:true */
'use strict';

var lodash = require('lodash'),
    debug = require('debug')('json-path-processor'),
    jsonpath = function (obj, path, assign) {
        var P = path ? path.split(/\./).reverse() : [],
            OO = obj,
            O = obj,
            key;

        while (key = P.pop()) {
            switch (key) {
            case '$':
                continue;
            }
            if (OO[key]) {
                OO = OO[key];
            } else {
                return null;
            }
            if (P.length === 1) {
                O = OO;
            }
            if (P.length === 0) {
                break;
            }
        }

        if (assign && key) {
            O[key] = assign.call ? assign(OO) : assign;
        }

        return OO;
    };

function JPP (data) {
    this._data = data;
};

JPP.prototype = {
    value: function (path) {
        return path ? jsonpath(this._data, path) : this._data;
    },
    get: function (path) {
        return new JPP(this.value(path));
    },
    set: function (path, value) {
        jsonpath(this._data, path, value);
        return this;
    },
    each: function (path, cb) {
        jsonpath(this._data, path, function (O) {
            return lodash.each(O, function (OO, index) {
                try {
                    O[index] = cb(new JPP(OO), index);
                } catch(E) {
                    debug(E);
                }
            });
        });
        return this;
    }
};

module.exports = function (data) {
    return new JPP(data);
};