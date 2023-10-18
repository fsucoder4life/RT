define(['app/view/summary', 'app/store/construction'], function (summary, construction) {
    function afterRender (store) {
        //Create workflow actions
        $('#workflow-select').change(function (e) {
            switch($(this).val()) {
                case 'audio-quote-request':
                    console.log('conversion-summary.js - audio-quote-request');
                    require(['app/view/workflow/hme-quote'], function (quote) {
                        //Show the quote
                        quote.render({
                            store: store,
                            callback: function (mailView) {
                                mailView.submit.on('click', function () {
                                    //Disable the button
                                    mailView.submit.setDisabled(true);

                                    //Get the escaped body with no breaks
                                    var msg = mailView.message.getData()
                                        .replace(/&/g, '&amp;')
                                        .replace(/</g, '&lt;')
                                        .replace(/>/g, '&gt;')
                                        .replace(/"/g, '&quot;')
                                        .replace(/'/g, '&apos;')
                                        .replace(/(\r\n|\n|\r)/gm,"");

                                    //Fire the workflow on the construction list
                                    $().SPServices({
                                        operation: "StartWorkflow",
                                        item: store.EncodedAbsoluteUrl,
                                        templateId: "{20b2b913-25a7-463f-8c2e-a85d5753c223}",
                                        workflowParameters: "<Data>" +
                                            "<eSubject>" + mailView.subject.getValue() + "</eSubject>" +
                                            "<eBody>" + msg + "</eBody>" +
                                        "</Data>",
                                        completefunc: function() {
                                            mailView.dialog.hide();
                                        }
                                    });
                                });
                            }
                        });
                    });
                    break;
            }
        });
    }

    return {
        show: function (target, storeNumber, routeCheck) {
            //Show summary
            summary.render({
                storeNumber: storeNumber,
                target: target,
                routeCheck: routeCheck,
                callback: afterRender
            });
        }
    };
});