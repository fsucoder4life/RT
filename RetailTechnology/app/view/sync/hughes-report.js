define([
        'app/store/construction',
        'dojo/text!app/view/sync/hughes-report.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry',
        'app/brands/services/brandServices'
    ], async function (construction, template, TextBox, Button, report, registry,brandServices) {
        var webUrl = brandServices.getSharePointUrlByKey("sharePointBaseUrl");
        var combinedScheduleUrl = brandServices.getSharePointUrlByKey("list-CombinedSchedule");
        $().SPServices.defaults.webURL = webUrl;
        return {
            render: function (options) {
                var me = {},
                    form = $(template);

                //Make sure the old widget was destroyed
                var input = registry.byId('hughes-installed');
                if (input) {input.destroy();}
                input = registry.byId('hughes-ordered');
                if (input) {input.destroy();}

                //Create input boxes for the reports
                me.inputInstalled = new TextBox({
                    placeholder: 'Paste data from Hughes install base report here',
                    style: {
                        width: "500px",
                        margin: "15px 0"
                    }
                }, $(form).find('#hughes-installed')[0]);

                me.inputOrders = new TextBox({
                    placeholder: 'Paste data from Hughes active orders report here',
                    style: {
                        width: "500px",
                        margin: "15px 0"
                    }
                }, $(form).find('#hughes-orders')[0]);

                //Show the form
                $(options.target).html(form);

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            },
            results: function (options) {
                var me = {
                    results: options.results,
                    buttons: {
                        goLive: [],
                        groundBreak: [],
                        "new": [],
                        missing: []
                    }
                };

                //Hide the input box
                $('#input-form').hide();

                //Show the reports
                report.render({
                    data: options.results.satellite,
                    columns: [
                        {key: 'InstallType', title: 'Install Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'FranchiseGroup', title: 'Franchisee'},
                        {key: 'Address', title: 'Address'},
                        {key: 'City', title: 'City'},
                        {key: 'State', title: 'State'},
                        {key: 'InstallDate', title: 'Install Start Date', transform: 'date'},
                        {key: 'GoLiveDate', title: 'Go-Live Date', transform: 'date'},
                        {key: 'CombinedId', title: 'Details', transform: function (value, row, data, index) {
                            return "<a href='" + webUrl + "Combined%20Schedule/DispForm.aspx?ID=" + value + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'GoLiveDate',
                        direction: 'DESC'
                    },
                    target: $('#satellite'),
                    routeCheck: options.routeCheck
                });
                report.render({
                    data: options.results.han,
                    columns: [
                        {key: 'InstallType', title: 'Install Type'},
                        {key: 'StoreNumber', title: 'No.'},
                        {key: 'FranchiseGroup', title: 'Franchisee'},
                        {key: 'Address', title: 'Address'},
                        {key: 'City', title: 'City'},
                        {key: 'State', title: 'State'},
                        {key: 'InstallDate', title: 'Install Start Date', transform: 'date'},
                        {key: 'GoLiveDate', title: 'Go-Live Date', transform: 'date'},
                        {key: 'Hughes', title: 'HAN', transform: function (hughes, store, stores, index) {
                            return hughes.Han;
                        }},
                        {key: 'Hughes', title: 'Wireless', transform: function (hughes, store, stores, index) {
                            return hughes.Wireless;
                        }},
                        {key: 'CombinedId', title: 'Details', transform: function (value, row, data, index) {
                            return "<a href='" + combinedScheduleUrl.replace("__store.CombinedId__",value) + "'>more</a>"
                        }}
                    ],
                    sort: {
                        key: 'GoLiveDate',
                        direction: 'DESC'
                    },
                    target: $('#han'),
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