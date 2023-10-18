define(['app/view/index'], function (index) {
    return {
        show: function (target, routeCheck, options) {
            //Show summary
            index.render({
                target: target,
                routeCheck: routeCheck
            });
        }
    };
});