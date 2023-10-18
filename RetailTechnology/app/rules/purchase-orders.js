/**
 * Define's a set of functions that you can pass a store to and return an object with the following:
 *  severity: (integer) with 0 being that the task is either complete or require's no warning, or 1, 2, 3 to represent levels of warning recomended
 *              returns -1 for an error - missing field or other issue
 *  description: a text description of the business rule including the parameters
 *  title: A short description of the business rule
 *  category: A category for a rule so issues can be summarized
 */
define(['app/store/purchaseOrders'], function (purchaseOrderStore) {
    var rules = [
      {
        field: 'FabConTotal',
        category: 'PurchaseOrder',
        test: function (po) {
          //Check to see if the FabCon Total equals the expected total
          if (po.ActualTaxCost === '' || po.ActualShippingCost === '') {
            return {severity: 2, description: 'Warning: Need Tax/Shipping costs to confirm total'}
          } else {
            var expectedTotal = parseFloat(purchaseOrderStore.getTotal(po)) + parseFloat(po.ActualTaxCost === '' ? 0 : po.ActualTaxCost) + parseFloat(po.ActualShippingCost === '' ? 0 : po.ActualShippingCost);
            if (expectedTotal.toString() !== po.FabConTotal) {
              return {severity: 3, description: 'Critical: Expected total does not match invoiced total'};
            } else {
              return {severity: 0, description: ''};
            }
          }
        }
      }
    ];

    /**
     * Function that recieves a dom element and a store/project object and highlights based on business rules and data-editable or data-display fields
     * @param target - DOM or jquery element with data-display or data-editable fields in it
     * @param store - object containing all store/project information for a construction project
     */
    function helper (target, store) {
        var $target = target;

        function setHighlightClass ($el, rule) {
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
            var $el = $(view.el).find('#number' + store.PurchaseOrderId);
            //Call the helper function for that target
            helper($el, store);
        });
    }
    function tableChangeHelper(view, key, value, store, revertBackground, response) {
        //Revert the background/unlock the field
        revertBackground();

        //Rerun the business rules on change to update the view for just the relevant table row for the store
        //Grab the row el
        var $el = $(view.el).find('#number' + store.PurchaseOrderId);
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
        if (source.toUpperCase().indexOf(item.toUpperCase()) !== -1) flag = true;
    });

    return flag;
}