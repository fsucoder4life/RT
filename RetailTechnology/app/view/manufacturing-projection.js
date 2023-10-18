define([
    'dojo/text!app/view/manufacturing-projection.html',
    'app/view/report',
    "dojo/number",
    'dijit/form/DateTextBox',
    'dijit/registry',
    "dijit/TitlePane",
    "dijit/form/TextBox",
    'dijit/form/Button',
    'dijit/form/MultiSelect'
    ], function (installTemplate, report, dNumber, DateTextBox, registry, TitlePane, TextBox, Button, MultiSelect) {

    return {
        render: function (options) {
            //Stop if another route has registered
            if (!options.routeCheck()) {
                return;
            }
            var me = {};


            //Add the template to the content area
            $(options.target).html(installTemplate);

            //Create a report with the data
            //TODO - need to fix this, report should be re-usable!  My views are view models!!
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
                target: $('#installs'),
                sort: options.sort
            });


            ///Set the date
            $('#current-date').html(moment(options.start).format('dddd, MMMM Do') + ' - ' + moment(options.end).format('dddd, MMMM Do') + " (Viewed " + moment().format('l') + ")");
            //Set the title
            $('#sub-title').html("POPS Projections");

            //Make sure the date pickers got destroyed
            var start = registry.byId('start-date'),
                end = registry.byId('end-date'),
                container = registry.byId('filters'),
                projectType = registry.byId('project-type'),
                button = registry.byId('filter-button')
            ;
            if (start) start.destroy();
            if (end) end.destroy();
            if (container) container.destroy();
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

            //Create Button
            me.button = new Button({
                label: 'Apply Filters'
            }, 'filter-button');

            //Table Header Date
            $('#installs-header').html(moment(options.start).format('dddd, MMMM Do') + ' through ' + moment(options.end).format('dddd, MMMM Do'));

            if (options.callback) {
                options.callback(me);
            }
        }
    };
});