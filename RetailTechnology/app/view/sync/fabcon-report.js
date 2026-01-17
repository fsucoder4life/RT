define([
        'app/store/construction',
        'dojo/text!app/view/sync/fabcon-report.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry',
        'dijit/Tooltip'
    ], function (construction, template, TextBox, Button, report, registry, Tooltip) {

        return {
            render: function (options) {
                var me = {},
                    form = $(template);

                //Make sure the old widget was destroyed
                var input = registry.byId('fabcon-report');
                if (input) {input.destroy();}

                //Create input boxes for the to/from/cc/subject fields
                me.input = new TextBox({
                    placeholder: 'Paste data from excel here',
                    style: {
                        width: "350px",
                        margin: "15px 0"
                    }
                }, $(form).find('#fabcon-report')[0]);

                //Show the form
                $(options.target).html(form);

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            },
            results: function (options) {
                var me = {
                    results: options.results
                };

                //Hide the input box
                $('#input-form').hide();

                //Show the reports
                report.render({
                    data: options.results.removed,
                    columns: [
                        //{key: 'ProjectType', title: 'Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'City', title: 'City'},
                        {key: 'State', title: 'State'},
                        {key: 'PopsDeliveryDate', title: 'Delivery', transform: 'date'},
                        {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                            return "<a href='#summary/" + value + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'PopsDeliveryDate',
                            direction: 'DESC'
                    },
                    target: $('#removed'),
                    routeCheck: options.routeCheck
                });

                report.render({
                    data: options.results.missing,
                    columns: [
                        {key: 'ProjectType', title: 'Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'City', title: 'City'},
                        {key: 'State', title: 'State'},
                        {key: 'TotalStalls', title: 'Total<br/>Stalls', transform: 'number'},
                        {key: 'PatioCount', title: 'Brackets', transform: 'number'},
                        {key: 'PopsDeliveryDate', title: 'Delivery', transform: 'date'},
                        {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                            return "<a href='#summary/" + value + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'PopsDeliveryDate',
                        direction: 'DESC'
                    },
                    target: $('#missing'),
                    routeCheck: options.routeCheck
                });
                report.render({
                    data: options.results.delivery,
                    columns: [
                        {key: 'ProjectType', title: 'Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'City', title: 'City'},
                        {key: 'State', title: 'State'},
                        {key: 'PopsDeliveryDate', title: 'Sonic', transform: 'date'},
                        {key: 'ISCDeliveryDate', title: 'ISC', transform: 'date'},
                        {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                            return "<a href='#summary/" + value + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'PopsDeliveryDate',
                        direction: 'DESC'
                    },
                    target: $('#date-mismatch'),
                    routeCheck: options.routeCheck
                });
                debugger;
                report.render({
                    data: options.results.quantity,
                    columns: [
                        {key: 'ProjectType', title: 'Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'TotalStalls', title: 'Stalls'},
                        {key: 'PatioBrackets', title: 'Extension<br/>Brackets'},
                        {key: 'CChannels', title: 'C-Channel<br/>Brackets'},
                        {key: 'StoreNumber', title: 'Details', transform: function (value, row, data, index) {
                            return "<a href='#summary/" + value + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'PopsDeliveryDate',
                        direction: 'DESC'
                    },
                    target: $('#quantity-mismatch'),
                    routeCheck: options.routeCheck
                });

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            }
        };
    }
);