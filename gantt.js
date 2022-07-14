'use strict';

var ganttChart = function (conf) {
    var api,
        self = {},
        toStr = Object.prototype.toString,
        astr = "[object Array]",
        ostr = "[object Object]",
        chart, drag, main, itemRects, tooltipDiv, xAxis, xScale, yAxis, yScale, zoom, textGroup,
        resizeRectMargin = 50;
    const timeScaleMonths = {
        THREE: 3,
        SIX: 6,
        NINE: 9,
        TWELVE: 12
    }

    api = {
        addItems: addItems,
        autoresize: autoresize,
        enableDrag: enableDrag,
        enableItemResize: enableItemResize,
        enableTooltip: enableTooltip,
        enableZoom: enableZoom,
        chart: function () {
            return main
        },
        drag: function () {
            return drag
        },
        items: items,
        lanes: lanes,
        margin: margin,
        showLaneLabel: showLaneLabel,
        showXGrid: showXGrid,
        showYGrid: showYGrid,
        size: size,
        sublanes: sublanes,
        svg: function () {
            return chart
        },
        redraw: redraw,
        renderTo: function () {
            return self.renderTo
        },
        resize: resize,
        xAxis: function () {
            return xAxis
        },
        xScale: function () {
            return xScale
        },
        yScale: function () {
            return yScale
        },
        yAxis: function () {
            return yAxis
        },
        zoom: function () {
            return zoom
        },
        adjustZoom: adjustZoom,
        availableScales: timeScaleMonths
    };

    self.items = null;
    self.lanes = null;
    self.renderTo = '#gantt_chart';
    self.sublanes = 1;

    self.isAutoResize = false;
    self.isEnableDrag = false;
    self.isEnableItemResize = false;
    self.isEnableTooltip = true;
    self.isEnableZoom = true;
    self.isShowXGrid = true;
    self.isShowYGrid = true;
    self.isShowLaneLabel = true;

    self.height = null;
    self.width = null;
    self.margin = {
        top: 20,
        right: 15,
        bottom: 20,
        left: 20
    };
    self.initialZoomLevel = null;

    (function init() {
        copySameProp(self, conf);

        self.items = self.items || [];
        self.lanes = self.lanes || [];
        self.lanes.length = getLaneLength();

        if (self.height === null) self.height = parseInt(d3.select(self.renderTo).style('height')) || 480;
        if (self.width === null) self.width = parseInt(d3.select(self.renderTo).style('width')) || 640;

        build();
        autoresize(self.isAutoResize);
        enableDrag(self.isEnableDrag);
        enableTooltip(self.isEnableTooltip);
        enableZoom(self.isEnableZoom);
        showLaneLabel(self.isEnableTooltip);
        showXGrid(self.isShowXGrid);
        showYGrid(self.isShowYGrid);
        redraw();
    })();

    function adjustZoom(scaleMonths) {
        xScale.domain(getTimeDomainLevel(scaleMonths));
        zoom.x(xScale);
        redraw();
        redraw();
    }

    function addItems(newItems) {
        var itemsType = toStr.call(newItems);
        if (itemsType !== astr && itemsType !== ostr) throwError('Expected object or array. Got: ' + itemsType);
        (itemsType === astr) ? self.items = self.items.concat(newItems) : self.items.push(newItems);
        onItemsChange();
        return api;
    }

    function autoresize(isAutoResize) {
        if (!arguments.length) return self.isAutoResize;
        d3.select(window).on('resize', (isAutoResize !== false) ? resize : null);
        self.isAutoResize = isAutoResize;
        return api;
    }

    function build() {
        var laneLength = self.lanes.length,
            marginWidth = getMarginWidth(),
            marginHeight = getMarginHeight();

        chart = d3.select(self.renderTo)
            .append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .attr("class", "gantt-chart");

        chart.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", marginWidth)
            .attr("height", marginHeight);

        drag = d3.behavior.drag()
            .on("dragstart", dragstart)
            .on("drag", dragmove)
            .on("dragend", dragend);

        main = chart.append("g")
            .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
            .attr("width", marginWidth)
            .attr("height", marginHeight)
            .attr("class", "main");

        itemRects = main.append("g")
            .attr("clip-path", "url(#clip)");

        textGroup = main.append("g")
            .attr("clip-path", "url(#clip)")
            .attr("class", "title-text");

        tooltipDiv = d3.select("body").append("div")
            .attr("class", "gantt-tooltip")
            .style("opacity", 0);

        xScale = d3.time.scale()
            .domain(getTimeDomain())
            .range([0, marginWidth]);

        yScale = d3.scale.linear()
            .domain([0, laneLength])
            .range([0, marginHeight]);

        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(5)

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .ticks(laneLength)
            .tickFormat("");

        zoom = d3.behavior.zoom()
            //.scaleExtent([0.0188679, 1])
            .x(xScale);

        main.append('g')
            .attr('transform', 'translate(0,' + marginHeight + ')')
            .attr('class', 'main axis date')
            .call(xAxis)

        main.append('g')
            .attr('class', 'main axis lane')
            .call(yAxis);

        main.append('g')
            .attr('class', 'laneLabels');

        chart.call(zoom);

        d3.select('html').on("click", function (d) {
            if (!self.isEnableTooltip) return;
            if (!event.target.closest('svg rect')) {
                hideTooltip();
            }
        });
    }

    function changeCursor(d) {
        var x = parseFloat(d3.select(this).attr("x")),
            width = parseFloat(d3.select(this).attr("width")),
            x1 = x + width;

        if ((x + resizeRectMargin >= d3.event.x) || (x1 <= d3.event.x)) {
            d3.select(this).attr("class", d.class + ((self.isEnableItemResize) ? " cursor-resize" : " cursor-default"));
        } else {
            d3.select(this).attr("class", d.class + ((self.isEnableDrag) ? " cursor-move" : " cursor-default"));
        }
    }

    function dragmove() {
        var x = parseFloat(d3.select(this).attr("x")),
            y = parseFloat(d3.select(this).attr("y")),
            width = parseFloat(d3.select(this).attr("width")),
            x1 = x + width;

        if (self.isEnableItemResize) {
            if (x + resizeRectMargin >= d3.event.x && x <= x1 - resizeRectMargin) {
                d3.select(this)
                    .attr("x", x + d3.event.dx)
                    .attr("width", width - d3.event.dx);
                return;
            }
            if (x1 - resizeRectMargin <= d3.event.x && x + 5 <= x1) {
                d3.select(this)
                    .attr("width", width + d3.event.dx);
                return;
            }
        }
        if (self.isEnableDrag) {
            d3.select(this)
                .attr("x", x + d3.event.dx)
                .attr("y", y + d3.event.dy);
        }
    }

    function dragend(d) {
        if (!self.isEnableDrag && !self.isEnableItemResize) return;
        var el = d3.select(this),
            lane = Math.round(yScale.invert(el.attr("y"))),
            start = el.attr("x");

        if (lane >= self.lanes.length) {
            lane = self.lanes.length - 1;
        }
        if (lane < 0) {
            lane = 0;
        }

        el.attr("y", yScale(lane));
        d.lane = lane;
        d.start = Date.parse(xScale.invert(start));
        d.end = Date.parse(xScale.invert(parseFloat(el.attr("width")) + parseFloat(start)));
    }

    function dragstart() {
        if (!self.isEnableDrag && !self.isEnableItemResize) return;
        d3.event.sourceEvent.stopPropagation();
    }

    function copySameProp(copyTo, copyFrom) {
        var p;

        for (p in copyFrom) {
            if (copyTo.hasOwnProperty(p)) {
                if (toStr.call(copyFrom[p]) === ostr) {
                    copySameProp(copyTo[p], copyFrom[p]);
                } else {
                    copyTo[p] = copyFrom[p];
                }
            }
        }
    }

    function enableDrag(isEnableDrag) {
        if (!arguments.length) return self.isEnableDrag;
        self.isEnableDrag = isEnableDrag;
        redraw();
        return api;
    }

    function enableItemResize(isEnableItemResize) {
        if (!arguments.length) return self.isEnableItemResize;
        self.isEnableItemResize = isEnableItemResize;
        redraw();
        return api;
    }

    function enableTooltip(isEnableTooltip) {
        if (!arguments.length) return self.isEnableTooltip;
        self.isEnableTooltip = isEnableTooltip;
        redraw();
        return api;
    }

    function enableZoom(isEnableZoom) {
        if (!arguments.length) return self.isEnableZoom;
        zoom.on("zoom", (isEnableZoom) ? redraw : null);
        self.isEnableZoom = isEnableZoom;
        return api;
    }

    function getLaneLength() {
        return (d3.max(self.items, function (d) {
            return d.lane
        }) + 1) || 0;
    }

    function getMarginWidth() {
        return self.width - self.margin.right - self.margin.left;
    }

    function getMarginHeight() {
        return self.height - self.margin.top - self.margin.bottom;
    }

    function getTimeDomain() {
        if (self.initialZoomLevel) {
            return getTimeDomainLevel(self.initialZoomLevel);
        }

        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        if (zoom) {
            zoom.scaleExtent(getScaleExtentBetweenDays(start, end));
        }
        return [
            d3.min(self.items, function (d) {
                return start;
                // return new Date('2022-06-01');
                // return d.start
            }),
            d3.max(self.items, function (d) {
                return end;
                // return new Date('2022-06-07');
                // return d.end
            })
        ];
    }

    function getScaleExtentBetweenDays(start, end) {
        const timeBetween = end.getTime() - start.getTime(); // gets time in ms between dates
        const daysBetween = timeBetween / (1000 * 60 * 60 * 24); // convert to time in days

        return [Math.abs(daysBetween/365.2425), Math.abs(daysBetween/7)];
    }

    function getTimeDomainLevel(scaleMonths) {
        const today = new Date();
        let start, end;
        switch (scaleMonths) {
            case timeScaleMonths.SIX:
                start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
                end = new Date(today.getFullYear(), today.getMonth() + 3, 1);
                break;
            case timeScaleMonths.NINE:
                start = new Date(today.getFullYear(), today.getMonth() - 4, 1);
                end = new Date(today.getFullYear(), today.getMonth() + 4, 1);
                break;
            case timeScaleMonths.TWELVE:
                start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
                end = new Date(today.getFullYear(), today.getMonth() + 6, 1);
                break;
            case timeScaleMonths.THREE:
            default:
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                break;
        }

        if (zoom) {
            zoom.scaleExtent(getScaleExtentBetweenDays(start, end));
        }

        return [
            d3.min(self.items, function () {
                return start;
            }),
            d3.max(self.items, function () {
                return end;
            })
        ]
    }

    function hideTooltip() {
        tooltipDiv.transition()
            .duration(500)
            .style("opacity", 0)
            .style("display", "none");
    }

    function items(newItems) {
        var itemsType = toStr.call(newItems);

        if (!arguments.length) return self.items;
        if (itemsType !== astr) throwError('Expected array. Got: ' + itemsType);
        self.items = newItems;

        onItemsChange();
        return api;
    }

    function lanes(newLanes) {
        var lanesType = toStr.call(newLanes);
        if (!arguments.length) return self.lanes;
        if (lanesType !== astr) throwError('Expected array. Got: ' + lanesType);
        self.lanes = newLanes;
        self.lanes.length = getLaneLength() || self.lanes.length;
        showLaneLabel(!self.isShowLaneLabel);
        showLaneLabel(!self.isShowLaneLabel);
        return api;
    }

    function margin(newMargin) {
        var msg = " margin value is incorrect. All values should be numbers";
        if (!arguments.length) return self.margin;
        if (newMargin.top !== undefined) {
            if (isNaN(newMargin.top)) throwError("'Top'" + msg);
            self.margin.top = parseInt(newMargin.top);
            main.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
        }
        if (newMargin.right !== undefined) {
            if (isNaN(newMargin.right)) throwError("'Right'" + msg);
            self.margin.right = parseInt(newMargin.right);
        }
        if (newMargin.bottom !== undefined) {
            if (isNaN(newMargin.bottom)) throwError("'Bottom'" + msg);
            self.margin.bottom = parseInt(newMargin.bottom);
        }
        if (newMargin.left !== undefined) {
            if (isNaN(newMargin.left)) throwError("'Left'" + msg);
            self.margin.left = parseInt(newMargin.left);
            main.attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");
        }

        resize();
        return api;
    }

    function onItemsChange() {
        var laneLength = getLaneLength();
        self.lanes.length = laneLength;
        xScale.domain(getTimeDomain());
        yAxis.ticks(laneLength);
        yScale.domain([0, laneLength]);
        zoom.x(xScale);
        redraw();
        redraw();
    }

    function redraw() {
        var itemHeight = getMarginHeight() / (self.lanes.length || 1) / (self.sublanes || 1);
        var rects;

        rects = itemRects.selectAll("rect")
            .data(self.items)
            .attr("x", function (d) {
                return xScale(d.start);
            })
            .attr("y", function (d) {
                return (self.sublanes < 2) ? yScale(d.lane) : yScale(d.lane) + d.sublane * itemHeight;
            })
            .attr("width", function (d) {
                return xScale(d.end) - xScale(d.start);
            })
            .attr("height", itemHeight)
            .attr("class", function (d) {
                return d.class + ' main';
            })
            .attr("opacity", .75)
            .call(drag)
            //.on("click", (self.isEnableTooltip) ? showTooltip : null)
            .on("mouseover", showTooltip)
            .on("mousemove", changeCursor)

        rects.enter().append("rect");
        rects.exit().remove();

        var text = textGroup.selectAll("text")
            .data(self.items)
            .html(function (d) {
                return d.title;
            })
            .attr("class", "custom-text");
        text.enter().append("text");
        text.exit().remove();

        d3.selectAll(".custom-text")
            .each(function (n, f) {
                var currentNode = this;
                var currentText = d3.select(currentNode);
                var nodeBb = currentNode.getBBox();//currentText.node().getBBox();
                currentText.attr("x", function (d) {
                    var rectStart = xScale(d.start);
                    var rectEnd = xScale(d.end);
                        // debugger;
                        // var words = currentText.text().split(/\s+/);
                        // var numberWords = words.length;
                        // var count = 0;
                        // currentText.text('');
                        // while (currentNode.getBBox().width < (rectEnd - rectStart) && count < numberWords - 1) {
                        //     // if (count === 0) {
                        //     //     currentText.text(words.shift());
                        //     // } else if(count === numberWords - 1) {
                        //     //     currentText.text(currentText.text() + ' ' + words.shift());
                        //     // }
                        //     currentText.text(currentText.text() + ' ' + words.shift());
                        //     count++;
                        // }
                        // if (currentNode.getBBox().width > (rectEnd - rectStart)){
                        //     currentText.text('...');
                        // }
                    // if (currentNode.getBBox().width > (rectEnd - rectStart)){
                    //     currentText.text('...');
                    // } else {
                    //     while (currentNode.getBBox().width < (rectEnd - rectStart) && count < numberWords - 1) {
                    //         // if (count === 0) {
                    //         //     currentText.text(words.shift());
                    //         // } else if(count === numberWords - 1) {
                    //         //     currentText.text(currentText.text() + ' ' + words.shift());
                    //         // }
                    //         currentText.text(currentText.text() + ' ' + words.shift());
                    //         count++;
                    //     }
                    // }

                    // var words = currentText.text().split(/\s+/);
                    //
                    // var ellipsis = currentText.text('').append('tspan').attr('class', 'elip').text('...');
                    // var width = rectStart + rectEnd;
                    // var numWords = words.length;
                    //
                    // var tspan = text.insert('tspan', ':first-child').text(words.join(' '));
                    //
                    // // Try the whole line
                    // // While it's too long, and we have words left, keep removing words
                    //
                    // var count = 0;
                    // while (tspan.node().getComputedTextLength() > width && words.length && count < 5) {
                    //     count++;
                    //     words.pop();
                    //     tspan.text(words.join(' '));
                    // }
                    //
                    // if (words.length === numWords) {
                    //     ellipsis.remove();
                    // }
                    //currentText.html("New Text");
                    var centerStart = rectStart + ((rectEnd - rectStart) / 2) - (currentNode.getBBox().width / 2);
                    // if (currentText[0][0].innerHTML == "Deliverable 1") {
                    //     console.log(currentText[0][0].innerHTML, rectStart, rectEnd, nodeBb.width, centerStart, getMarginWidth());
                    // }
                    if (centerStart < 0 || (centerStart + currentNode.getBBox().width) + 8 >= rectEnd) {
                        currentText.attr('style', "font-family: Material Icons;");
                        currentText.text('flag');
                        //currentText.html('<span class="material-icons">outlined_flag</span>');
                        centerStart = rectStart + ((rectEnd - rectStart) / 2) - (currentNode.getBBox().width / 2);
                    } else {
                        currentText.attr('style', null);
                    }
                    if (rectEnd >= getMarginWidth()){
                        centerStart = rectStart + ((getMarginWidth() - rectStart) / 2) - (currentNode.getBBox().width / 2);
                    } else if(rectStart < 0) {
                        centerStart = (rectEnd / 2) - (currentNode.getBBox().width / 2);
                    }
                    if (rectStart + currentNode.getBBox().width + 8 > getMarginWidth()){
                        centerStart = rectStart + 8;
                    } else if (rectEnd - currentNode.getBBox().width - 8 < 0) {
                        centerStart = rectEnd - currentNode.getBBox().width - 8;
                    }

                    if (rectStart < 0 && rectEnd > getMarginWidth()){
                        centerStart = (getMarginWidth() / 2) - (currentNode.getBBox().width / 2);
                    }
                    // if (nodeBb.width <= rectEnd - rectStart + 8) {
                    //     centerStart = rectStart + 8;
                    // }
                    return centerStart;
                })
                    .attr("y", function (d) {
                        var rectY = (self.sublanes < 2) ? yScale(d.lane) : yScale(d.lane) + d.sublane * itemHeight;
                        var centerText = itemHeight / 2;
                        return rectY + centerText;
                    })
                    //.call(dotme);
                //dotme(currentText, start);
            })

        // setTimeout(() => {
        //     d3.selectAll(".custom-text")
        //         .each(function () {
        //             var currentText = d3.select(this);
        //             var nodeBb = currentText.node().getBBox();
        //             currentText.attr("x", function (d) {
        //                 var rectStart = xScale(d.start);
        //                 var rectEnd = xScale(d.end);
        //                 currentText.html("New Text");
        //                 var centerStart = rectStart + ((rectEnd - rectStart) / 2) - (nodeBb.width / 2)
        //                 return centerStart;
        //             })
        //             .attr("y", function (d) {
        //                 var rectY = (self.sublanes < 2) ? yScale(d.lane) : yScale(d.lane) + d.sublane * itemHeight;
        //                 var centerText = itemHeight / 2;
        //                 return rectY + centerText;
        //             })
        //             //.call(dotme);
        //         })
        // }, 100);

        main.select('g.main.axis.date').call(xAxis);
        main.select('g.main.axis.lane').call(yAxis);

        hideTooltip();
    }

    // function dotme(text) {
    //     debugger;
    //     var textData = text.data()[0];
    //     var words = text.text().split(/\s+/);
    //
    //     var ellipsis = text.text('').append('tspan').attr('class', 'elip').text('...');
    //     var width = xScale(textData.start) + xScale(textData.end);
    //     var numWords = words.length;
    //
    //     var tspan = text.insert('tspan', ':first-child').text(words.join(' '));
    //
    //     // Try the whole line
    //     // While it's too long, and we have words left, keep removing words
    //
    //     while (tspan.node().getComputedTextLength() > width && words.length) {
    //         words.pop();
    //         tspan.text(words.join(' '));
    //     }
    //
    //     if (words.length === numWords) {
    //         ellipsis.remove();
    //     }
    // }

    function resize() {
        if (self.isAutoResize) {
            self.width = parseInt(d3.select(self.renderTo).style('width'));
            self.height = parseInt(d3.select(self.renderTo).style('height'));
        }
        var marginWidth = getMarginWidth(),
            marginHeight = getMarginHeight();

        xScale.range([0, marginWidth]);
        yScale.range([0, marginHeight]);
        chart.attr("width", self.width);
        chart.attr("height", self.height);
        chart.select('defs').select('clipPath').select('rect').attr("width", marginWidth);
        chart.select('defs').select('clipPath').select('rect').attr("height", marginWidth);
        main.attr("width", marginWidth);
        main.attr("height", marginHeight);

        main.select('g.main.axis.date')
            .attr('transform', 'translate(0,' + getMarginHeight() + ')');

        main.select('g.laneLabels')
            .selectAll(".laneText")
            .data(self.lanes)
            .attr("y", function (d, i) {
                return yScale(i + .5);
            })

        zoom.x(xScale);

        showXGrid(self.isShowYGrid);
        showYGrid(self.isShowYGrid);

        redraw();
    }

    function showLaneLabel(isShowLaneLabel) {
        if (!arguments.length) return self.isShowLaneLabel;
        self.isShowLaneLabel = isShowLaneLabel;
        if (isShowLaneLabel === false) {
            main.selectAll(".laneText").remove();
        } else {
            main.select('g.laneLabels').selectAll(".laneText")
                .data(self.lanes)
                .enter().append("text")
                .text(function (d) {
                    return d;
                })
                .attr("x", -self.margin.right)
                .attr("y", function (d, i) {
                    return yScale(i + .5);
                })
                .attr("dy", ".5ex")
                .attr("text-anchor", "start")
                .attr("class", "laneText");
        }

        return api;
    }

    function showTooltip(d) {
        if (d3.event.defaultPrevented) return;
        tooltipDiv.style("display", "block")
            .transition()
            .duration(200)
            .style("opacity", .9);
        tooltipDiv.html((typeof d.tooltip === 'function') ? d.tooltip() : d.tooltip)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px");
    }

    function showXGrid(isShowXGrid) {
        if (!arguments.length) return self.isShowXGrid;
        var height = (isShowXGrid !== false) ? -getMarginHeight() : -6;
        xAxis.tickSize(height, 0, 0);
        self.isShowXGrid = isShowXGrid;
        main.select('g.main.axis.date').call(xAxis);
        return api;
    }

    function showYGrid(isShowYGrid) {
        if (!arguments.length) return self.isShowYGrid;
        var width = (isShowYGrid !== false) ? -getMarginWidth() : -6;
        yAxis.tickSize(width, 0, 0);
        self.isShowYGrid = isShowYGrid;
        main.select('g.main.axis.lane').call(yAxis);
        return api;
    }

    function size(width, height) {
        if (!arguments.length) return [self.width, self.height];
        self.width = parseInt(width) || self.width;
        self.height = parseInt(height) || self.height;
        autoresize(false);
        resize();
        return api;
    }

    function sublanes(newSublanes) {
        if (!arguments.length) return self.sublanes;
        self.sublanes = newSublanes;
        redraw();
        return api;
    }

    function throwError(msg) {
        throw TypeError(msg);
    }

    return api;
}
