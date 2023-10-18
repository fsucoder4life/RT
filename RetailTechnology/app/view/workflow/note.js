define([
        'app/store/construction',
        'app/store/notes',
        'dojo/text!app/view/workflow/note.html',
        'dijit/Dialog',
        'dijit/form/TextBox',
        'dijit/form/Button',
        "dijit/form/ComboBox",
        "dojo/store/Memory",
        'dijit/registry'
    ], function (construction, notes, noteTemplate, Dialog, TextBox, Button, Combo, Memory, registry) {

        return {
            render: function (options) {
                var me = {};
                //Grab the store, and turn the template into an element
                var note = options.note,
                    template = $(noteTemplate);

                //Create default issue options if not set
                if (typeof note === 'undefined') {
                    note = {
                        NoteType: 'General',
                        Note: '',
                        Source: ''
                    }
                }

                //Delete old inputs
                if (registry.byId('Source')) registry.byId('Source').destroy();
                if (registry.byId('Type')) registry.byId('Type').destroy();
                if (registry.byId('submit-button')) registry.byId('submit-button').destroy();

                //Create inputs
                me.Source= new TextBox({
                    value: note.Source,
                    style: "width: 300px"
                }, $(template).find('#Source')[0]);

                //Create the options for issue type
                var noteTypeOptions = [];
                _.each(notes.getField('NoteType').options, function (type, index) {
                    noteTypeOptions.push({
                        name: type,
                        id: type
                    });
                });
                var store = new Memory ({
                    data: noteTypeOptions
                });

                me.NoteType= new Combo({
                    store: store,
                    style: "width: 300px",
                    value: note.NoteType,
                    searchAttr: 'name'
                }, $(template).find('#Type')[0]);

                //Create the button
                me.submit = new Button({
                    label: options.Label || "Save"
                }, $(template).find('#submit-button')[0]);

                //Set the note text
                $(template).find('#Note').html(note.Note);

                //Create the dialog box
                me.Dialog = new Dialog({
                    title: options.Title || "Edit Issue",
                    content: template,
                    style: "width: 1000px",
                    hide: function () {
                        if (options.onHide) options.onHide();
                        me.Note.destroy();
                        me.Dialog.destroy();
                    }
                });

                //Show the dialog box
                me.Dialog.show();

                //Activate ckeditor
                me.Note = CKEDITOR.replace('Note', {
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