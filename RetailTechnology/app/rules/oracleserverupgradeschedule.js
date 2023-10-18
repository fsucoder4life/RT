/**
 * Define's a set of functions that you can pass a store to and return an object with the following:
 *  severity: (integer) with 0 being that the task is either complete or require's no warning, or 1, 2, 3 to represent levels of warning recomended
 *              returns -1 for an error - missing field or other issue
 *  description: a text description of the business rule including the parameters
 *  title: A short description of the business rule
 *  category: A category for a rule so issues can be summarized
 */
define(['app/store/construction', 'app/store/combined', 'app/store/combinedconstructionextend'], function (construction, combined, combinedconstructionextend) {
    var rules = [
    /**************Installer Related Rules**************/
      
        {
            field: 'OracleServerUpgradeInstaller',
            category: 'Installer',
            test: function (store) {
                
                if (store.OracleServerUpgradeInstaller.toUpperCase().indexOf("TBD") > -1 || store.OracleServerUpgradeInstaller.toUpperCase().indexOf("UNKNOWN") > -1 || store.OracleServerUpgradeInstaller ==="") return { severity: 2, description: 'Warning: No resource found' };
                return { severity: 0, description: '' };
            }
        },
        {
            field: 'VP6800HughesDoctoFEE',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800HughesDoctoFEE), 'days'); // should be -26 days past go live
                if (dayDiff <= 90) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 97) return { severity: 0, description: '' };
                if (dayDiff > 90) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800HughesDoctoHughes',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800HughesDoctoHughes), 'days'); // should be -26 days past go live
                if (dayDiff <= 83) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 90) return { severity: 0, description: '' };
                if (dayDiff > 83) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800SiteSurveyConfirmedbyInstaller',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800SiteSurveyConfirmedbyInstaller), 'days'); // should be -26 days past go live
                if (dayDiff <= 83) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 90) return { severity: 0, description: '' };
                if (dayDiff > 83) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800ProjectSiteSurveyDate',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800ProjectSiteSurveyDate), 'days'); // should be -26 days past go live
                if (dayDiff <= 69) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 76) return { severity: 0, description: '' };
                if (dayDiff > 69) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800ReviewSignOffs',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800ReviewSignOffs), 'days'); // should be -26 days past go live
                if (dayDiff <= 62) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 69) return { severity: 0, description: '' };
                if (dayDiff > 62) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800OrderDocSenttoFee',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800OrderDocSenttoFee), 'days'); // should be -26 days past go live
                if (dayDiff <= 62) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 69) return { severity: 0, description: '' };
                if (dayDiff > 62) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800Ordered',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800Ordered), 'days'); // should be -26 days past go live
                if (dayDiff <= 55) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 62) return { severity: 0, description: '' };
                if (dayDiff > 55) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800InstallScheduled',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800InstallScheduled), 'days'); // should be -26 days past go live
                if (dayDiff <= 55) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 62) return { severity: 0, description: '' };
                if (dayDiff > 55) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP680030DayComm',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP680030DayComm), 'days'); // should be -26 days past go live
                if (dayDiff <= 22) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 29) return { severity: 0, description: '' };
                if (dayDiff > 22) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP68002WeekComm',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP68002WeekComm), 'days'); // should be -26 days past go live
                if (dayDiff <=7) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 14) return { severity: 0, description: '' };
                if (dayDiff > 7) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP68001WeekComm',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP68001WeekComm), 'days'); // should be -26 days past go live
                if (dayDiff <= 0) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                if (dayDiff > 7) return { severity: 0, description: '' };
                if (dayDiff > 0) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        {
            field: 'VP6800DayBeforeInstallComm',
            category: 'Installer',
            test: function (store) {
                var dayDiff = moment(store.VP6800GoLive).diff(moment(store.VP6800DayBeforeInstallComm), 'days'); // should be -26 days past go live
                if (dayDiff >= 1) return { severity: 0, description: '' };
                if (dayDiff <= 0) return { severity: 3, description: 'Critical: Intro Call not set within opening' };
                
                //if (dayDiff > 0) return { severity: 2, description: 'Warning: Intro Call not assigned within 7 days of opening' };
                return { severity: 1, description: '' };
            }
        },
        
        
    ];

    /**
     * Function that recieves a dom element and a store/project object and highlights based on business rules and data-editable or data-display fields
     * @param target - DOM or jquery element with data-display or data-editable fields in it
     * @param store - object containing all store/project information for a construction project
     */
    function helper(target, store) {
        var $target = target;

        function setHighlightClass($el, rule) {
            //Green
            if (rule.severity === 0) $el.addClass('green-highlight');
            else $el.removeClass('green-highlight');
            //Yellow
            if (rule.severity === 2) $el.addClass('yellow-highlight');
            else $el.removeClass('yellow-highlight');
            //Red
            if (rule.severity === 3) $el.addClass('red-highlight');
            else $el.removeClass('red-highlight');

            //Set title
            $el.prop('title', rule.description);
        }

        //@TODO To turn this into a utility function in the rules folder - need to pass in the element we are checking in, the store object, and the rules....or add to the construction rules object as rules.helper and put the rules in rules.rules
        var issues = {};
        _.each(rules, function (rule) {
            //Test the rule:
            var result = rule.test(store);

            //Create the category
            if (typeof issues[rule.category] === 'undefined') {
                issues[rule.category] = {
                    severity: 1,
                    description: ''
                }
            }

            //Update category
            if (result.severity > 1) {
                //Update severity
                issues[rule.category].severity = (issues[rule.category].severity < result.severity ? result.severity : issues[rule.category].severity);
                //Update text
                issues[rule.category].description += result.description + "\r\n";
            } else if (issues[rule.category].severity === 1 && result.severity === 0) {
                //Update severity
                issues[rule.category].severity = result.severity;
                //Update text
                issues[rule.category].description += result.description + "\r\n";
            }

            //Highlight accordingly
            //Check to see if it's a display field onscreen (merge the selected field and it's label div into a single jquery collection - may need to add a data-label attribute to these....or actually use inputs and labels)
            var $el = $target.find('*[data-display="' + rule.field + '"]');
            setHighlightClass($el.add($el.prev('.summary-box-label')).add($el.prev('.review-label')), result);


            //Highlight editable field
            $el = $target.find('*[data-editable="' + rule.field + '"]');
            setHighlightClass($el.add($el.prev('.summary-box-label')).add($el.prev('.review-label')), result);
        });

        //Update any data-category fields
        _.each(issues, function (category, key) {
            setHighlightClass($target.find('*[data-category=' + key + ']'), category);
        });
    }

    function tableHelper(view) {
        //Go through each row of the table and run rules on only that target/store info
        _.forEach(view.stores, function (store, storeIndex) {
            //Grab the row el
            var $el = $(view.el).find('#number' + store.StoreNumber);
            //Call the helper function for that target
            helper($el, store);
        });
    }
    function tableChangeHelper(view, key, value, store, revertBackground, response) {
        //Revert the background/unlock the field
        revertBackground();

        //Rerun the business rules on change to update the view for just the relevant table row for the store
        //Grab the row el
        var $el = $(view.el).find('#number' + store.StoreNumber);
        //Call the helper function for that target
        helper($el, store);
    }

    return {
        helper: helper,
        tableHelper: tableHelper,
        tableChangeHelper: tableChangeHelper,
        rules: rules
    };
});

function contains(source, test) {
    //Make sure it's an array
    if (typeof test !== 'object') test = [test];
    //Check to see if one of the passed terms is contained in the source
    var flag = false;
    _.each(test, function (item, index) {
        if (source)
            if (source.toUpperCase().indexOf(item.toUpperCase()) !== -1) flag = true;
    });

    return flag;
}