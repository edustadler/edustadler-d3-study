
var scrollData = function () {

    var width = 600;
    var height = 520;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };


    var lastIndex = -1;
    var activeIndex = 0;

    var squareSize = 6;
    var squarePad = 2;
    var numPerRow = width / (squareSize + squarePad);

    var svg = null;


    var g = null;


    var xBarScale = d3.scaleLinear()
        .range([0, width]);


    var yBarScale = d3.scaleBand()
        .paddingInner(0.08)
        .domain([0, 1, 2])
        .range([0, height - 50], 0.1, 0.1);

    var barColors = { 0: '#2A76BA', 1: '#318DDE', 2: '#EF9627' };


    var xHistScale = d3.scaleLinear()
        .domain([0, 33])
        .range([0, width / 1]);


    var yHistScale = d3.scaleLinear()
        .range([height, 0]);


    var coughColorScale = d3.scaleLinear()
        .domain([0, 1.0])
        .range(['#3E71F6', '#EF9627']);


    var xAxisBar = d3.axisBottom()
        .scale(xBarScale);


    var xAxisHist = d3.axisBottom()
        .scale(xHistScale)
        .tickFormat(function (d) { return parseInt(d * 3.34) + '%'; });

    var activateFunctions = [];

    var updateFunctions = [];

    var chart = function (selection) {
        selection.each(function (rawData) {
            svg = d3.select(this).selectAll('svg').data([wordData]);
            var svgE = svg.enter().append('svg');
            svg = svg.merge(svgE);

            svg.attr('width', width + margin.left + margin.right);
            svg.attr('height', height + margin.top + margin.bottom);

            svg.append('g');



            g = svg.select('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            var wordData = getWords(rawData);
            var fillerWords = getFillerWords(wordData);


            var fillerCounts = groupByWord(fillerWords);
            var countMax = d3.max(fillerCounts, function (d) { return d.value; });
            xBarScale.domain([0, countMax]);


            var histData = getHistogram(fillerWords);

            var histMax = d3.max(histData, function (d) { return d.length; });
            yHistScale.domain([0, histMax]);

            setupVis(wordData, fillerCounts, histData);

            setupSections();
        });
    };

    const imageWidth = 250;
    const imageHeight = 250;



    var setupVis = function (wordData, fillerCounts, histData) {
        // axis
        g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxisBar);
        g.select('.x.axis').style('opacity', 0);

        // count openvis title
        g.append('text')
            .attr('class', 'title openvis-title')
            .attr('x', width / 2)
            .attr('y', (height / 3) + (height / 5))
            .text('Edu Stadler');



        g.append('text')
            .attr('class', 'sub-title openvis-title')
            .attr('x', width / 2)
            .attr('y', (height / 1.8) + (height / 5))
            .text('scrollyteller study');

        g.selectAll('.openvis-title')
            .attr('opacity', 0);

        // count filler word count title
        g.append('text')
            .attr('class', 'sub-title count-title')
            .attr('x', width / 2)
            .attr('y', (height / 3) + (height / 5))
            .text('Reference:');

        g.append('image')
            .attr('class', 'latticeflow-logo count-title')
            .attr('x', width / 2 - imageWidth / 2)
            .attr('y', (height / 2) + (height / 5) - imageHeight / 2)
            .attr('width', imageWidth)
            .attr('height', imageHeight)
            .attr('xlink:href', 'https://latticeflow.ai/wp-content/uploads/2023/07/latticeflow.svg');

            g
            .append("foreignObject")
            .attr('x', width / 1.92 )
            .attr('y', (height / 2) + (height / 2.4))
            .attr('class', 'count-title')
            .attr("width", 200)
            .attr("height", 100)
            .html('<a href="https://edustadler.com" class="cta-svg">hyperlink inside the svg</a>');

        g.selectAll('.count-title')
            .attr('opacity', 0);

        // square grid
        // new and old data have same attrs applied
        var squares = g.selectAll('.square').data(wordData, function (d) { return d.word; });
        var squaresE = squares.enter()
            .append('rect')
            .classed('square', true);
        squares = squares.merge(squaresE)
            .attr('width', squareSize)
            .attr('height', squareSize)
            .attr('fill', '#FF9E19')
            .classed('fill-square', function (d) { return d.filler; })
            .attr('x', function (d) { return d.x; })
            .attr('y', function (d) { return d.y; })
            .attr('opacity', 0);

        // barchart
        // new and old data have same attrs applied
        var bars = g.selectAll('.bar').data(fillerCounts);
        var barsE = bars.enter()
            .append('rect')
            .attr('class', 'bar');
        bars = bars.merge(barsE)
            .attr('rx', '17px')
            .attr('ry', '85px')
            .attr('x', 0)
            .attr('y', function (d, i) { return yBarScale(i); })
            .attr('fill', function (d, i) { return barColors[i]; })
            .attr('width', 0)
            .attr('height', yBarScale.bandwidth());

        var barText = g.selectAll('.bar-text').data(fillerCounts);
        barText.enter()
            .append('text')
            .attr('class', 'bar-text')
            .text(function (d) { return d.key; })
            .attr('x', 0)
            .attr('dx', 15)
            .attr('y', function (d, i) { return yBarScale(i); })
            .attr('dy', yBarScale.bandwidth() / 1.2)
            .style('font-size', '50px')
            .attr('fill', 'white')
            .attr('opacity', 0);

        // histogram
        // new and old data have same attrs applied
        var hist = g.selectAll('.hist').data(histData);
        var histE = hist.enter().append('rect')
            .attr('class', 'hist');
        hist = hist.merge(histE).attr('x', function (d) { return xHistScale(d.x0); })
            .attr('y', height)
            .attr('height', 0)
            .attr('width', xHistScale(histData[0].x1) - xHistScale(histData[0].x0) - 1)
            .attr('fill', barColors[0])
            .attr('opacity', 0);

        // cough title
        g.append('text')
            .attr('class', 'sub-title cough cough-title')
            .attr('x', width / 2)
            .attr('y', 60)
            .text('Learning')
            .attr('opacity', 0);

        // arrowhead
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('refY', 2)
            .attr('markerWidth', 6)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M 0,0 V 4 L6,2 Z');

        g.append('path')
            .attr('class', 'cough cough-arrow')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('d', function () {
                var line = 'M ' + (width / 2.4) + ' ' + 80;
                line += ' l 0 ' + 23;
                return line;
            })
            .attr('opacity', 0);
    };


    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions[0] = showTitle;
        activateFunctions[1] = showFillerTitle;
        activateFunctions[2] = showGrid;
        activateFunctions[3] = highlightGrid;
        activateFunctions[4] = showBar;
        activateFunctions[5] = showHistPart;
        activateFunctions[6] = showHistAll;
        activateFunctions[7] = showCough;
        activateFunctions[8] = showHistAll;


        for (var i = 0; i < 9; i++) {
            updateFunctions[i] = function () { };
        }
        updateFunctions[7] = updateCough;
    };

    /**
     * ACTIVATE FUNCTIONS
     *
     * These will be called their
     * section is scrolled to.
     *
     */

    /**
     * showTitle - initial title
     *
     * hides: count title
     * (no previous step to hide)
     * shows: intro title
     *
     */
    function showTitle() {
        g.selectAll('.count-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.openvis-title')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
    }

    /**
     * showFillerTitle - filler counts
     *
     * hides: intro title
     * hides: square grid
     * shows: filler count title
     *
     */
    function showFillerTitle() {
        g.selectAll('.openvis-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.square')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.count-title')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
    }

    /**
     * showGrid - square grid
     *
     * hides: filler count title
     * hides: filler highlight in grid
     * shows: square grid
     *
     */
    function showGrid() {
        g.selectAll('.count-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.square')
            .transition()
            .duration(250)
            .delay(function (d) {
                return 5 * d.row;
            })
            .attr('opacity', 1.0)
            .attr('fill', '#ddd')
            .attr('rx', '14px')
    }

    /**
     * highlightGrid - show fillers in grid
     *
     * hides: barchart, text and axis
     * shows: square grid and highlighted
     *  filler words. also ensures squares
     *  are moved back to their place in the grid
     */

    function highlightGrid() {
        hideAxis();
        g.selectAll('.bar')
            .transition()
            .duration(300)
            .attr('width', 0);

        g.selectAll('.bar-text')
            .transition()
            .duration(0)
            .attr('opacity', 0);


        g.selectAll('.square')
            .transition()
            .duration(0)
            .attr('opacity', 1.0)
            .attr('fill', '#ddd');

        // use named transition to ensure
        // move happens even if other
        // transitions are interrupted.
        g.selectAll('.fill-square')
            .transition('move-fills')
            .duration(400)
            .attr('rx', '50px')
            .attr('x', function (d) {
                return d.x;
            })
            .attr('y', function (d) {
                return d.y;
            });

        g.selectAll('.fill-square')
            .transition()
            .duration(400)
            .attr('opacity', .8)
            .attr('fill', function (d) { return d.filler ? '#2A76BA' : '#ddd'; });
    }

    /**
     * showBar - barchart
     *
     * hides: square grid
     * hides: histogram
     * shows: barchart
     *
     */
    function showBar() {
        // ensure bar axis is set
        showAxis(xAxisBar);

        g.selectAll('.square')
            .transition()
            .duration(400)
            .attr('opacity', 0);

        g.selectAll('.fill-square')
            .transition()
            .duration(600)
            .attr('x', 0)
            .attr('y', function (d, i) {
                return yBarScale(i % 3) + yBarScale.bandwidth() / 2;
            })
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.hist')
            .transition()
            .duration(200)
            .attr('height', function () { return 0; })
            .attr('y', function () { return height; })
            .style('opacity', 0);

        g.selectAll('.bar')
            .transition()
            .delay(function (d, i) { return 300 * (i + 1); })
            .duration(600)
            .attr('width', function (d) { return xBarScale(d.value); });

        g.selectAll('.bar-text')
            .transition()
            .duration(600)
            .delay(1200)
            .attr('opacity', 1);
    }

    /**
     * showHistPart - shows the first part
     *  of the histogram of filler words
     *
     * hides: barchart
     * hides: last half of histogram
     * shows: first half of histogram
     *
     */
    function showHistPart() {
        // switch the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.bar-text')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.bar')
            .transition()
            .duration(600)
            .attr('width', 0);

        // here we only show a bar if
        // it is before the 15 minute mark
        g.selectAll('.hist')
            .transition()
            .duration(600)
            .attr('rx', '14px')
            .attr('y', function (d) { return (d.x0 < 15) ? yHistScale(d.length) : height; })
            .attr('height', function (d) { return (d.x0 < 15) ? height - yHistScale(d.length) : 0; })
            .style('opacity', function (d) { return (d.x0 < 15) ? 1.0 : 1e-6; });
    }

    /**
     * showHistAll - show all histogram
     *
     * hides: cough title and color
     * (previous step is also part of the
     *  histogram, so we don't have to hide
     *  that)
     * shows: all histogram bars
     *
     */
    function showHistAll() {
        // ensure the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.cough')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        // named transition to ensure
        // color change is not clobbered
        g.selectAll('.hist')
            .transition('color')
            .duration(500)
            .style('fill', '#318DDE');

        g.selectAll('.hist')
            .transition()
            .duration(1200)
            .attr('y', function (d) { return yHistScale(d.length); })
            .attr('height', function (d) { return height - yHistScale(d.length); })
            .style('opacity', 1.0);
    }

    /**
     * showCough
     *
     * hides: nothing
     * (previous and next sections are histograms
     *  so we don't have to hide much here)
     * shows: histogram
     *
     */
    function showCough() {
        // ensure the axis to histogram one
        showAxis(xAxisHist);

        g.selectAll('.hist')
            .transition()
            .duration(600)
            .attr('y', function (d) { return yHistScale(d.length); })
            .attr('height', function (d) { return height - yHistScale(d.length); })
            .style('opacity', 1.0);
    }

    /**
     * showAxis - helper function to
     * display particular xAxis
     *
     * @param axis - the axis to show
     *  (xAxisHist or xAxisBar)
     */
    function showAxis(axis) {
        g.select('.x.axis')
            .call(axis)
            .transition().duration(500)
            .style('opacity', 1);
    }

    /**
     * hideAxis - helper function
     * to hide the axis
     *
     */
    function hideAxis() {
        g.select('.x.axis')
            .transition().duration(500)
            .style('opacity', 0);
    }

    /**
     * UPDATE FUNCTIONS
     *
     * These will be called within a section
     * as the user scrolls through it.
     *
     * We use an immediate transition to
     * update visual elements based on
     * how far the user has scrolled
     *
     */

    /**
     * updateCough - increase/decrease
     * cough text and color
     *
     * @param progress - 0.0 - 1.0 -
     *  how far user has scrolled in section
     */
    function updateCough(progress) {
        g.selectAll('.cough')
            .transition()
            .duration(0)
            .attr('opacity', progress);

        g.selectAll('.hist')
            .transition('cough')
            .duration(0)
            .style('fill', function (d) {
                return (d.x0 >= 14) ? coughColorScale(progress) : '#318DDE';
            });
    }

    /**
     * DATA FUNCTIONS
     *
     * Used to coerce the data into the
     * formats we need to visualize
     *
     */

    /**
     * getWords - maps raw data to
     * array of data objects. There is
     * one data object for each word in the speach
     * data.
     *
     * This function converts some attributes into
     * numbers and adds attributes used in the visualization
     *
     * @param rawData - data read in from file
     */
    function getWords(rawData) {
        return rawData.map(function (d, i) {
            // is this word a filler word?
            d.filler = (d.filler === '1') ? true : false;
            // time in seconds word was spoken
            d.time = +d.time;
            // time in minutes word was spoken
            d.min = Math.floor(d.time / 60);

            // positioning for square visual
            // stored here to make it easier
            // to keep track of.
            d.col = i % numPerRow;
            d.x = d.col * (squareSize + squarePad);
            d.row = Math.floor(i / numPerRow);
            d.y = d.row * (squareSize + squarePad);
            return d;
        });
    }

    /**
     * getFillerWords - returns array of
     * only filler words
     *
     * @param data - word data from getWords
     */
    function getFillerWords(data) {
        return data.filter(function (d) { return d.filler; });
    }

    /**
     * getHistogram - use d3's histogram layout
     * to generate histogram bins for our word data
     *
     * @param data - word data. we use filler words
     *  from getFillerWords
     */
    function getHistogram(data) {
        // only get words from the first 30 minutes
        var thirtyMins = data.filter(function (d) { return d.min < 30; });
        // bin data into 2 minutes chuncks
        // from 0 - 31 minutes
        // @v4 The d3.histogram() produces a significantly different
        // data structure then the old d3.layout.histogram().
        // Take a look at this block:
        // https://bl.ocks.org/mbostock/3048450
        // to inform how you use it. Its different!
        return d3.histogram()
            .thresholds(xHistScale.ticks(10))
            .value(function (d) { return d.min; })(thirtyMins);
    }

    /**
     * groupByWord - group words together
     * using nest. Used to get counts for
     * barcharts.
     *
     * @param words
     */
    function groupByWord(words) {
        return d3.nest()
            .key(function (d) { return d.word; })
            .rollup(function (v) { return v.length; })
            .entries(words)
            .sort(function (a, b) { return b.value - a.value; });
    }

    chart.activate = function (index) {
        activeIndex = index;
        var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(function (i) {
            activateFunctions[i]();
        });
        lastIndex = activeIndex;
    };


    chart.update = function (index, progress) {
        updateFunctions[index](progress);
    };

    return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {
    // create a new plot and
    // display it
    var plot = scrollData();
    d3.select('#data')
        .datum(data)
        .call(plot);

    // setup scroll functionality
    var scroll = scroller()
        .container(d3.select('#graphic'));

    // pass in .steps selection as the steps
    scroll(d3.selectAll('.steps'));

    // setup event handling
    scroll.on('active', function (index) {
        // highlight current step text
        d3.selectAll('.steps')
            .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });

        // activate current section
        plot.activate(index);
    });

    scroll.on('progress', function (index, progress) {
        plot.update(index, progress);
    });
}

// load data and display
d3.tsv('data/words.tsv', display);