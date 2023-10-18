define([
        'app/store/construction',
        'app/store/issues',
        'dojo/text!app/view/workflow/issue.html',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button',
        "dijit/form/Select",
        'dijit/registry'
    ], function (construction, issues, issueTemplate, Dialog, TextBox, Button, Select, registry) {

        return {
            render: function (options) {
                var me = {};
                //Grab the store, and turn the template into an element
                var store = options.store,
                    issue = options.issue,
                    template = $(issueTemplate);

                //Create default issue options if not set
                if (typeof issue === 'undefined') {
                    issue = {
                        Title: '',
                        Assigned: '',
                        IssueType: 'General',
                        Severity: '(2) - Mandatory',
                        Status: 'Open',
                        Description: ''
                    }
                }

                //Delete old inputs
                if (registry.byId('Title')) registry.byId('Title').destroy();
                if (registry.byId('Type')) registry.byId('Type').destroy();
                if (registry.byId('Assigned')) registry.byId('Assigned').destroy();
                if (registry.byId('WaitingOn')) registry.byId('WaitingOn').destroy();
                if (registry.byId('Status')) registry.byId('Status').destroy();
                if (registry.byId('Severity')) registry.byId('Severity').destroy();
                if (registry.byId('submit-button')) registry.byId('submit-button').destroy();

                //Create inputs
                me.Title = new TextBox({
                    value: issue.Title,
                    style: "width: 300px"
                }, $(template).find('#Title')[0]);

                me.Assigned = new TextBox({
                    value: issue.Assigned,
                    style: "width: 300px"
                }, $(template).find('#Assigned')[0]);

                me.WaitingOn = new TextBox({
                    value: issue.WaitingOn,
                    style: "width: 300px"
                }, $(template).find('#WaitingOn')[0]);

                //Create the options for issue type
                var issueTypeOptions = [];
                _.each(issues.getField('IssueType').options, function (type, index) {
                    issueTypeOptions.push({
                        label: type,
                        value: type,
                        selected: issue.IssueType === type
                    });
                });

                me.IssueType= new Select({
                    options: issueTypeOptions,
                    style: "width: 300px"
                }, $(template).find('#Type')[0]);

                //Create the options for issue status
                var statusOptions = [];
                _.each(issues.getField('Status').options, function (status, index) {
                    statusOptions.push({
                        label: status,
                        value: status,
                        selected: issue.Status === status
                    });
                });

                me.Status = new Select({
                    options: statusOptions,
                    style: "width: 300px"
                }, $(template).find('#Status')[0]);

                //Create the options for issue severity
                var severityOptions = [];
                _.each(issues.getField('Severity').options, function (severity, index) {
                    severityOptions.push({
                        label: severity,
                        value: severity,
                        selected: issue.Severity === severity
                    });
                });

                me.Severity = new Select({
                    options: severityOptions,
                    style: "width: 300px"
                }, $(template).find('#Severity')[0]);

                //Create the button
                me.submit = new Button({
                    label: options.Label || "Save"
                }, $(template).find('#submit-button')[0]);

                //Set the description text
                $(template).find('#Description').html(issue.Description);

                //Create the dialog box
                me.Dialog = new Dialog({
                    title: options.Title || "Edit Issue",
                    content: template,
                    style: "width: 1000px",
                    hide: function () {
                        if (options.onHide) options.onHide();
                        me.Description.destroy();
                        me.Dialog.destroy();
                    }
                });

                //Show the dialog box
                me.Dialog.show();

                //Activate ckeditor
                me.Description = CKEDITOR.replace('Description', {
                    height: '300px',
                    toolbarGroups: [
                        { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
                        { name: 'editing',     groups: [ 'find', 'selection'] },
                        { name: 'links' },
                        { name: 'insert' },
                        { name: 'forms' },
                        { name: 'tools' },
                        { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
                        { name: 'others' },
                        '/',
                        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                        { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
                        { name: 'styles' },
                        { name: 'colors' },
                        { name: 'about' }
                    ]
                });

                //Fire callback if passed
                if (options.callback) {
                    options.callback(me);
                }
            }
        };
}
);