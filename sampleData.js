function sampleDataSet() {
    var items = [];
    var startDate = Date.parse('2022-06-01T00:30:00'),
        classes = ['success', 'danger', 'warning', 'info', 'default'];

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-06-01'),
        end: new Date('2022-06-03'),
        class: 'info',
        sublane: 0,
        title: 'Milestone 1'
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-06-14'),
        end: new Date('2022-06-16'),
        class: 'info',
        sublane: 0,
        title: 'Milestone 2'
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-06-19'),
        end: new Date('2022-06-21'),
        class: 'info',
        sublane: 0,
        title: 'Milestone 3'
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2021-12-31'),
        end: new Date('2022-01-02'),
        class: 'info',
        sublane: 0,
        title: 'Milestone 4'
    });

    items.push({
        id: 0,
        lane: 0,
        start: new Date('2022-12-31'),
        end: new Date('2023-01-02'),
        class: 'info',
        sublane: 0,
        title: 'Milestone 5'
    });

    items.push({
        id: 0,
        lane: 1,
        start: new Date('2022-06-02'),
        end: new Date('2022-06-12'),
        class: 'success',
        sublane: 0,
        title: 'Deliverable 1'
    });

    items.push({
        id: 0,
        lane: 2,
        start: new Date('2022-06-09'),
        end: new Date('2022-06-12'),
        class: 'warning',
        sublane: 0,
        title: 'Deliverable 2'
    });

    items.push({
        id: 0,
        lane: 3,
        start: new Date('2022-06-12'),
        end: new Date('2022-06-16'),
        class: 'warning',
        sublane: 0,
        title: 'Deliverable 3'
    });

    items.push({
        id: 0,
        lane: 1,
        start: new Date('2022-06-17'),
        end: new Date('2022-06-20'),
        class: 'success',
        sublane: 0,
        title: 'Deliverable 4'
    });

    return items;
}
