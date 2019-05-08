;( function( $, window, document, undefined ) {
    "use strict";

    var pluginName = "SimpleFlow",
        defaults = {
            rowHeight: 0,
            lineWidth: 2,
            lineSpacerWidth: 30,
            lineColour: "#91acb3",
            canvasElm: ".canvas"
        };

    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    $.extend(Plugin.prototype, {
        
        init: function() {
            this.drawLines();

            var that = this;

            // need to redraw after resize ends otherwise it can
            // happen too quickly
            $(window).resize(function() {
               if(this.resizeTO) clearTimeout(this.resizeTO);
               this.resizeTO = setTimeout(function() {
                   $(this).trigger("resizeEnd");
               }, 250);
            });

            $(window).bind("resizeEnd", function() {
               that.drawLines();
            });
        },

        drawLines: function() {
            // remove old svgs
            $(this.settings["canvasElm"] + " " + "svg.simple-flow").remove();

            var uuid = this.getUuid();

            // define common elements
            var line = '<svg class="simple-flow simple-flow-defs">' +
                "<defs>" +
                  '<marker id="arrowhead-' + uuid + '" viewBox="0 0 10 10" refX="8" refY="5"' +
                      'markerUnits="strokeWidth" markerWidth="8" markerHeight="6" orient="auto">' +
                    '<path d="M 0 0 L 10 5 L 0 10 z" stroke="none" fill="' + this.settings["lineColour"] + '"/>' +
                  "</marker>" +
                "</defs>" +
                "</svg>";
            $(this.settings["canvasElm"]).append(line);

            var $elements = $(this.element);

            for (let i = 0; i < $elements.length; i++){
                var thisElm =  $elements.eq(i),
                    nextElm = $elements.eq(i+1);
                this.drawLine(thisElm, nextElm, uuid);
            }

            //make space less
            $(".simple-flow-defs").height(10);
        },

        drawLine: function (thisElm, nextElm, uuid) {

            var thisElmParent = thisElm.parent(),
                nextElmParent = nextElm.parent();

            //row height
            var rowHeight = this.settings["rowHeight"];
            if (thisElmParent.height() > rowHeight) {
                rowHeight = thisElmParent.height();
                this.settings["rowHeight"] = rowHeight;
            }

            // only continue if there's a next element.
            if (typeof nextElm.position() !== "undefined") {
                // calculate all of the positions relative to the two objects
                var thisElmMiddle = thisElm.outerHeight(true) / 2,
                    nextElmMiddle = nextElm.outerHeight(true) / 2;

                var thisElmY = thisElmMiddle + thisElmParent.position().top,
                    nextElmY = nextElmMiddle + nextElmParent.position().top;

                var thisParentPadding = (thisElmParent.outerWidth(true) - thisElmParent.width()) / 2,
                    nextParentPadding = (nextElmParent.outerWidth(true) - nextElmParent.width()) / 2;

                var thisRight = thisElmParent.position().left + thisElm.outerWidth(true) + thisParentPadding,
                    nextLeft = nextElmParent.position().left + nextParentPadding;

                var farLeftX = nextLeft - this.settings["lineSpacerWidth"];
                var farRightX = thisRight + this.settings["lineSpacerWidth"];
                //var lineInBetweenY = (thisElmY + nextElmY) / 2;
                var lineInBetweenY = rowHeight + parseInt(thisElmParent.css("margin-bottom")) / 2;
                // if the object is on the same line, the the coords are different
                // to if they're on separate lines.
                let coords;
                if (thisElmY === nextElmY) {
                    // same row
                    coords = thisRight + "," + thisElmY + " " + nextLeft + "," + nextElmY;

                } else {
                    // differernt rows
                    coords = thisRight + "," + thisElmY + " " + farRightX + "," + thisElmY +
                        " " + farRightX + "," + lineInBetweenY + " " + farLeftX + "," +
                        lineInBetweenY + " " + farLeftX + "," + nextElmY + " " + nextLeft +
                        "," + nextElmY;
                    this.settings["rowHeight"] = 0;
                }

                // create line svg
                var line = '<svg class="simple-flow simple-flow-line">' +
                    '<path d="M' + coords +
                      '"style="fill:none;stroke:' + this.settings["lineColour"] + ";stroke-width:" + this.settings["lineWidth"] +
                      ";marker-end:url(#arrowhead-" + uuid + ');" />' +
                    "</svg>";

                // append to canvas
                $(this.settings["canvasElm"]).append(line);
            }
        },
        getUuid: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
                s4() + "-" + s4() + s4() + s4();
        }
    });

    $.fn[ pluginName ] = function( options ) {
        if ( !$.data( this, "plugin_" + pluginName ) ) {
            $.data( this, "plugin_" +
                pluginName, new Plugin( this, options ) );
        }
    };

} )( jQuery, window, document );
