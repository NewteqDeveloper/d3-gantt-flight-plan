setTimeout(() => {
    let xAxis,
        localeFormatter,
        tickFormat;

    const gantt = ganttChart({
        initialZoomLevel: timeScaleMonthsEnum.THREE,
        typeIcons: {
            [blockTypesEnum.MILESTONE]: 'flag',
            [blockTypesEnum.DELIVERABLE]: 'local_shipping'
        }
    });

    xAxis = gantt.xAxis();

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

    gantt.enableDrag(false);
    gantt.showXGrid(false);
    gantt.addItems(sampleDataSet());
}, 0);
