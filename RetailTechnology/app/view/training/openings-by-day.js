define([
    'dojo/text!app/view/training/openings-by-day.html',
    'app/view/report',
    "dojo/number",
    'dijit/form/DateTextBox',
    'dijit/registry',
    "dijit/TitlePane",
    "dijit/form/TextBox",
    'dijit/form/Button',
    'dijit/form/MultiSelect'
    ], function (openingsTemplate, report, dNumber, DateTextBox, registry, TitlePane, TextBox, Button, MultiSelect) {

    return {
        render: function (options) {
            //Stop if another route has registered
            if (!options.routeCheck()) {
                return;
            }
            var me = {};


            //Add the template to the content area
            $(options.target).html(openingsTemplate);

            //Create a report with the data
            _.forEach(options.data, function (store) {
                if (store.InstallType === "Construction") {
                    store.InstallType = "Construction*";
                } else {
                    store.InstallType += "**";
                }
            });
            report.render({
                data: options.data,
                routeCheck: options.routeCheck,
                columns: options.columns,
                target: $('#openings'),
                sort: options.sort
            });


            ///Set the date
            $('#current-date').html(moment(options.start).format('dddd, MMMM Do') + ' - ' + moment(options.end).format('dddd, MMMM Do') + " (Viewed " + moment().format('l') + ")");
            //Set the title
            $('#sub-title').html("Openings By Day");

            //Make sure the date pickers got destroyed
            var start = registry.byId('start-date'),
                end = registry.byId('end-date'),
                container = registry.byId('filters'),
                installer = registry.byId('installer'),
                city = registry.byId('city'),
                state = registry.byId('state'),
                pos = registry.byId('pos'),
                projectType = registry.byId('project-type'),
                trainer = registry.byId('trainer'),
                button = registry.byId('filter-button')
            ;
            if (start) start.destroy();
            if (end) end.destroy();
            if (container) container.destroy();
            if (installer) installer.destroy();
            if (city) city.destroy();
            if (state) state.destroy();
            if (pos) pos.destroy();
            if (trainer) trainer.destroy();
            if (projectType) projectType.destroy();
            if (button) button.destroy();

            //Create collapsible filter container
            me.container = new TitlePane({
                title: 'Report Filters',
                style: {
                    width: '555px',
                    margin: '0 10px 10px 10px'
                }
            }, $('#filters')[0]);

            //Create date pickers
            me.start = new DateTextBox({
                value: options.start,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#start-date')[0]);


            me.end = new DateTextBox({
                value: options.end,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#end-date')[0]);

            //Create text filters
            me.installer = new TextBox({
                value: options.installer,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#installer')[0]);

            me.city = new TextBox({
                value: options.city,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#city')[0]);

            me.state = new TextBox({
                value: options.state,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#state')[0]);

            me.pos = new TextBox({
                value: options.posSelection,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, $('#pos')[0]);

            if (typeof options.projectType === 'string') {
                options.projectType = [options.projectType];
            }
            me.projectType = new MultiSelect({
                value: options.projectType,
                style: {
                    width: "200px",
                    margin: "5px 0",
                    height: '58px'
                }
            }, 'project-type');

            if (typeof options.trainer === 'string') {
                options.trainer = [options.trainer];
            }
            me.trainer = new TextBox({
                value: options.trainer,
                style: {
                    width: "200px",
                    margin: "5px 0"
                }
            }, 'trainer');

//            me.projectType.set('value', options.posSelection);

            me.button = new Button({
                label: 'Apply Filters'
            }, 'filter-button');

            //Table Header Date
            $('#openings-header').html(moment(options.start).format('dddd, MMMM Do') + ' through ' + moment(options.end).format('dddd, MMMM Do') + " - Total Openings: " + options.data.length);

            if (options.callback) {
                options.callback(me);
            }
        }
    };
});