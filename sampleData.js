function sampleDataSet() {
    var items = [];
    var classes = ['success', 'danger', 'warning', 'info', 'default'];

    function formatDate(date) {
        let d = new Date(date);
        let month = (d.getMonth() + 1).toString();
        let day = d.getDate().toString();
        let year = d.getFullYear().toString();
        if (month.length < 2) {
            month = '0' + month;
        }
        if (day.length < 2) {
            day = '0' + day;
        }
        return [year, month, day].join('-');
    }

    function getTooltip() {
        let value = '<h4>' + this.title + '</h4>' +
            '<table class="gantt-tooltip-table">';
        if (this.dueDate) {
            value += '<tr><td class="text-right">Due Date:</td><td>' + formatDate(this.dueDate) + '</td></tr>' +
                '</table>'
        } else {
            value += '<tr><td class="text-right">Start:</td><td>' + formatDate(this.start) + '</td></tr>' +
                '<tr><td class="text-right">End:</td><td>' + formatDate(this.end) + '</td></tr>' +
                '</table>'
        }
        return value;
    }

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-06-01'),
        end: new Date('2022-06-03'),
        class: 'info',
        title: 'Milestone 1',
        tooltip: getTooltip,
        dueDate: new Date('2022-06-02')
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-06-14'),
        end: new Date('2022-06-16'),
        class: 'info',
        title: 'Milestone 2',
        tooltip: getTooltip,
        dueDate: new Date('2022-06-15')
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-06-19'),
        end: new Date('2022-06-21'),
        class: 'info',
        title: 'Milestone 3',
        tooltip: getTooltip,
        dueDate: new Date('2022-06-20')
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2021-12-31'),
        end: new Date('2022-01-02'),
        class: 'info',
        title: 'Milestone 4',
        tooltip: getTooltip,
        dueDate: new Date('2022-01-01')
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-12-31'),
        end: new Date('2023-01-02'),
        class: 'info',
        title: 'Milestone 5',
        tooltip: getTooltip,
        dueDate: new Date('2023-01-01')
    });

    items.push({
        id: 0,
        lane: 1,
        start: new Date('2022-06-02'),
        end: new Date('2022-06-12'),
        class: 'success',
        title: 'Deliverable 1',
        tooltip: getTooltip
    });
    // items.push({
    //     id: 0,
    //     lane: 1,
    //     start: new Date('2022-06-05'),
    //     end: new Date('2022-06-10'),
    //     class: 'default',
    //     title: 'Deliverable 1 (Baseline)',
    //     tooltip: getTooltip
    // });

    items.push({
        id: 0,
        lane: 2,
        start: new Date('2022-06-09'),
        end: new Date('2022-06-12'),
        class: 'warning',
        title: 'Deliverable 2',
        tooltip: getTooltip
    });

    items.push({
        id: 0,
        lane: 3,
        start: new Date('2022-06-12'),
        end: new Date('2022-06-16'),
        class: 'warning',
        title: 'Deliverable 3',
        tooltip: getTooltip
    });

    items.push({
        id: 0,
        lane: 1,
        start: new Date('2022-06-17'),
        end: new Date('2022-06-20'),
        class: 'success',
        title: 'Deliverable 4',
        tooltip: getTooltip
    });

    return items;
}
