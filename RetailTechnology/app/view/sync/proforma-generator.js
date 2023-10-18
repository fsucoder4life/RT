define([
        'app/store/construction',
        'dojo/text!app/view/sync/proforma-generator.html',
        'dijit/form/TextBox',
        'dijit/form/Button',
        'app/view/report',
        'dijit/registry'
    ], function (construction, template, TextBox, Button, report, registry) {

        return {
            render: function (options) {
                var me = {},
                    form = $(template);

                //Make sure the old widget was destroyed
                var input = registry.byId('proforma-generator');
                if (input) {input.destroy();}

                //Create input boxes for the to/from/cc/subject fields
                me.input = new TextBox({
                    placeholder: 'Paste store list here',
                    style: {
                        width: "350px",
                        margin: "15px 0"
                    }
                }, $(form).find('#proforma-generator')[0]);

                //Show the form
                $(options.target).html(form);

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            }
        };
    }
);