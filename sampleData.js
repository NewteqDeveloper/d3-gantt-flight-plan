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

    milestones.forEach((item) => {
        let dueDate = new Date(item.plannedDate);
        let start = new Date(item.plannedDate);
        let end = new Date(item.plannedDate);
        let itemForChart = {
            id: 'milestone_' + item.milestoneId,
            lane: 0,
            start: start,
            end: end,
            class: 'info',
            title: item.name,
            tooltip: getTooltip,
            dueDate: dueDate
        };
        itemForChart.start.setDate(dueDate.getDate() - 1);
        itemForChart.end.setDate(dueDate.getDate() + 1);

        items.push(itemForChart);
    });

    const deliverableClasses = ['success', 'danger', 'warning'];
    const deliverableItems = [];

    let sortedDeliverables = deliverables.sort((a, b) => {
        let aDate = new Date(a.startDate);
        let bDate = new Date(b.startDate);
        if (aDate > bDate) {
            return 1;
        } else if (aDate < bDate) {
            return -1;
        } else {
            if (a.name > b.name) {
                return 1;
            } else if (a.name < b.name) {
                return -1;
            } else {
                return 0;
            }
        }
    });

    for(let i = 0; i < sortedDeliverables.length; i++) {
        const currentDeliverable = sortedDeliverables[i];
        let itemForChart = {
            id: 'deliverable_' + currentDeliverable.deliverableId,
            lane: (i % 4) + 1,
            start: new Date(currentDeliverable.startDate),
            end: new Date(currentDeliverable.endDate),
            class: deliverableClasses[i % 3],
            title: currentDeliverable.name,
            tooltip: getTooltip
        };

        if (i > 0) {
            for (let j = 0; j < deliverableItems.length; j++) {
                const previous = deliverableItems[j];
                if (itemForChart.start <= previous.end && itemForChart.end >= previous.start) {
                    if (itemForChart.lane === previous.lane) {
                        let overlap, counter = 1;
                        do {
                            overlap = false;
                            itemForChart.lane = ((itemForChart.lane + 1) % 4) + 1;
                            let itemsInThisLane = deliverableItems.filter(x => x.lane === itemForChart.lane);
                            for (let x = 0; x < itemsInThisLane.length; x++) {
                                let itemLane = itemsInThisLane[x];
                                if (itemForChart.start <= itemLane.end && itemForChart.end >= itemLane.start) {
                                    overlap = true;
                                    counter++;
                                    break;
                                }
                            }
                        } while(overlap && counter < 4);
                        if (counter >= 4) {
                            console.error('RAN OUT OF LANES');
                        }
                        break;
                    }
                }
            }
        }

        deliverableItems.push(itemForChart);
    }

    items = items.concat(deliverableItems);

    return items;

    const lanesUsed = [...new Set(deliverableItems.map(item => item.lane))];
    lanesUsed.forEach((lane) => {
        const itemsInLane = deliverableItems.filter((item) => item.lane === lane);
        for (let i = 0; i + 1 < itemsInLane.length; i++) {

        }
    });

    const overlappingItems = [];
    deliverableItems.forEach((currentItem) => {
        for (let i = 0; i < deliverableItems.length; i++){
            let otherItem = deliverableItems[i];
            if (currentItem.id !== otherItem.id) {
                if (currentItem.start <= otherItem.end && currentItem.end >= otherItem.start){
                    overlappingItems.push(currentItem);
                    overlappingItems.push(otherItem);
                }
            }
        }
    });
    const single = [...new Map(overlappingItems.map(item =>
        [item.id, item])).values()];

    for(let i = 0; i < single.length; i++) {
        let item = single[i];
        //item.lane = ((item.lane + i) % 4) + 1;
        item.lane = (item.lane + i) % 5;
    }

    deliverableItems.forEach((item) => {
        const findMe = single.find((item1) => item1.id === item.id);
        if (!findMe) {
            items.push(item);
        } else {
            items.push(findMe);
        }
    })

    return items;
}
