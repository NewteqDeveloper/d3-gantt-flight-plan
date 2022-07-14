setTimeout(() => {
    var xAxis,
        localeFormatter,
        tickFormat;

    const gantt = ganttChart();

    xAxis = gantt.xAxis();

    setTimeout(() => {

    }, 1000)

    localeFormatter = d3.locale({
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["R", ""],
        "dateTime": "%a %b %d %Y",
        "date": "%Y-%m-%d",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "shortDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "months": ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"],
        "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sept", "Oct", "Nov", "Dec"]
    });

    tickFormat = localeFormatter.timeFormat.multi([
        ["%H:%M", function (d) {
            return d.getMinutes();
        }],
        ["%Y-%m-%d", function (d) {
            return d.getHours();
        }],
        ["%Y-%m-%d", function (d) {
            return d.getDay() && d.getDate() != 1;
        }],
        ["%Y-%m-%d", function (d) {
            return d.getDate() != 1;
        }],
        ["%B", function (d) {
            return d.getMonth();
        }],
        ["%Y", function () {
            return true;
        }]
    ]);

    xAxis.tickFormat(tickFormat);

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function getTooltip() {
        const value = '<h4>Item #' + this.id + '</h4>' +
            '<table class="gantt-tooltip-table">' +
            '  <tr><td class="text-right">Start:</td><td>' + new Date(this.start) + '</td></tr>' +
            '  <tr><td class="text-right">End:</td><td>' + new Date(this.end) + '</td></tr>' +
            '  <tr><td class="text-right">Class:</td><td>' + this.class + '</td></tr>' +
            '</table>';
        return value
    }

    function getRandomItems(n) {
        var items = [],
            i,
            N = n || 1,
            rnd;
        var startDate = Date.parse('2012-01-01T00:30:00'),
            classes = ['success', 'danger', 'warning', 'info', 'default'],
            id = 0;

        for (i = 0; i < N; i++) {
            rnd = getRandomInt(444000, 10444000);
            items.push({
                id: id++,
                lane: getRandomInt(0, 5),
                start: startDate + 180000,
                end: startDate + rnd,
                tooltip: getTooltip,
                class: classes[getRandomInt(0, classes.length)],
                sublane: getRandomInt(0, 4),
                title: 'Long text to test things - Test Text ' + i
            });
            startDate += 1800000 + rnd;
        }

        return items;
    }

    gantt.enableDrag(false);
    gantt.showXGrid(false);
    gantt.addItems(sampleDataSet());
}, 1000);
