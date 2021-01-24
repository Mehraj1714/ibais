(function() {
  var Utilities,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Utilities = (function() {
    function Utilities() {
      this._fireEvent = __bind(this._fireEvent, this);
      this._empty = __bind(this._empty, this);
      this._each = __bind(this._each, this);
    }

    Utilities.prototype._addEvent = function(element, event, fn, useCapture) {
      if (useCapture == null) {
        useCapture = false;
      }
      return element.addEventListener(event, fn, useCapture);
    };

    Utilities.prototype._forEach = function(array, fn, bind) {
      var i, l, _results;
      i = 0;
      l = array.length;
      _results = [];
      while (i < l) {
        if (i in array) {
          fn.call(bind, array[i], i, array);
        }
        _results.push(i++);
      }
      return _results;
    };

    Utilities.prototype._each = function(array, fn, bind) {
      if (array) {
        this._forEach(array, fn, bind);
        return array;
      }
    };

    Utilities.prototype._pass = function(fn, args, bind) {
      if (args == null) {
        args = [];
      }
      return function() {
        return fn.apply(bind, args);
      };
    };

    Utilities.prototype._delay = function(fn, delay, bind, args) {
      if (args == null) {
        args = [];
      }
      return setTimeout(this._pass(fn, args, bind), delay);
    };

    Utilities.prototype._periodical = function(fn, periodical, bind, args) {
      if (args == null) {
        args = [];
      }
      return setInterval(this._pass(fn, args, bind), periodical);
    };

    Utilities.prototype._setHtml = function(element, string) {
      return element.innerHTML = string;
    };

    Utilities.prototype._getHtml = function(element) {
      return element.innerHTML;
    };

    Utilities.prototype._empty = function(element) {
      return this._setHtml(element, "");
    };

    Utilities.prototype._fireEvent = function(event, text) {
      if (this.options[event]) {
        return this.options[event].call(this, text, this.options);
      }
    };

    Utilities.prototype._extend = function(object, properties) {
      var key, val;
      for (key in properties) {
        val = properties[key];
        object[key] = val;
      }
      return object;
    };

    return Utilities;

  })();

  this.Typist = (function(_super) {
    __extends(Typist, _super);

    function Typist(element, options) {
      if (options == null) {
        options = {};
      }
      this.typeLetter = __bind(this.typeLetter, this);
      this.typeText = __bind(this.typeText, this);
      this.selectOffset = __bind(this.selectOffset, this);
      this.selectText = __bind(this.selectText, this);
      this.fetchVariations = __bind(this.fetchVariations, this);
      this.next = __bind(this.next, this);
      this.start = __bind(this.start, this);
      this.setupDefaults = __bind(this.setupDefaults, this);
      this.options = {
        typist: element,
        letterSelectInterval: 60,
        interval: 3000,
        selectClassName: "selectedText"
      };
      this.options = this._extend(this.options, options);
      this.elements = {
        typist: this.options.typist
      };
      this.offsets = {
        current: {
          index: 0,
          text: ""
        }
      };
      if (this.elements.typist) {
        this.setupDefaults();
      }
    }

    Typist.prototype.setupDefaults = function() {
      this.variations = this.fetchVariations(this.elements.typist);
      return this._delay(this.start, this.options.interval);
    };

    Typist.prototype.start = function() {
      this.currentVariation = this.variations[this.offsets.current.index];
      this.offsets.current.text = this.currentVariation.split('');
      return this.selectText();
    };

    Typist.prototype.next = function() {
      this.offsets.current.index++;
      this.offsets.current.index = this.offsets.current.index % this.variations.length;
      this.currentVariation = this.variations[this.offsets.current.index];
      return this.offsets.current.text = this.currentVariation.split('');
    };

    Typist.prototype.fetchVariations = function(element) {
      var i, text, v, value, variations, _i, _len;
      text = element.getAttribute("data-typist");
      text = text.replace(/\\'/g, "'");
      text = text.replace(/\\,/g, '!COMMA!');
      variations = text.split(",");
      for (i = _i = 0, _len = variations.length; _i < _len; i = ++_i) {
        v = variations[i];
        variations[i] = v.replace(/!COMMA!/g, ',');
      }
      value = this._getHtml(element);
      variations.splice(0, 0, value);
      i = 0;
      while (i < variations.length) {
        if (variations[i] === '') {
          variations.splice(i, 1);
        } else {
          i++;
        }
      }
      return variations;
    };

    Typist.prototype.selectText = function(index) {
      var offset;
      if (index == null) {
        index = 0;
      }
      offset = (this.offsets.current.text.length - index) - 1;
      if (offset >= 0) {
        this.selectOffset(offset);
      }
      if (offset > 0) {
        return this._delay((function(_this) {
          return function() {
            return _this.selectText(index + 1);
          };
        })(this), this.options.letterSelectInterval);
      } else {
        return this._delay((function(_this) {
          return function() {
            _this.next();
            return _this.typeText();
          };
        })(this), this.options.letterSelectInterval);
      }
    };

    Typist.prototype.selectOffset = function(offset) {
      var selected, text, unselected;
      text = this.offsets.current.text;
      selected = text.slice(offset, text.length).join('');
      unselected = text.slice(0, offset).join('');
      return this._setHtml(this.elements.typist, "" + unselected + "<em class=\"" + this.options.selectClassName + "\">" + selected + "</em>");
    };

    Typist.prototype.typeText = function() {
      this.typeTextSplit = this.currentVariation.split("");
      this.typeLetter();
      return this._fireEvent("onSlide", this.currentVariation);
    };

    Typist.prototype.typeLetter = function(index) {
      var letter;
      if (index == null) {
        index = 0;
      }
      letter = this.typeTextSplit[index];
      if (index === 0) {
        this.elements.typist.innerHTML = '';
      }
      this.elements.typist.innerHTML += letter;
      if (index + 1 >= this.typeTextSplit.length) {
        return this._delay((function(_this) {
          return function() {
            return _this.selectText();
          };
        })(this), this.options.interval);
      } else {
        return this._delay((function(_this) {
          return function() {
            return _this.typeLetter(index + 1);
          };
        })(this), this.options.letterSelectInterval);
      }
    };

    return Typist;

  })(Utilities);

}).call(this);