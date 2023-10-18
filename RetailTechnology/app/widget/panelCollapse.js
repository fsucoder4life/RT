/**
 * Make this hold all the stuff that displays an issue so it can be re-used in multiple views
 **/
define([], function () {
    return function (config) {
        var me = {},
            $container = $($(config.el)),
            $header = config.header ? $($(config.header)) : $($container.find('> h3').first()),
            $body = config.body ? $($(config.body)) : $($container.find('> div').first());

        //Add classes
        $header.addClass("ui-state-default ui-corner-all");
        $body.addClass("ui-accordion-content ui-corner-bottom ui-widget-content");
        $header.css('margin', '2px 0 0 0');
        $container.css('page-break-inside', 'avoid');

        //Hide body
        $body.hide();

        //Append an icon
        if (config.showIcon !== false) {
            var $icon = $($('<i style="padding-left: 10px; padding-right: 10px; cursor: pointer; cursor: hand;" class="fa fa-caret-right"></i>'));
            $header.prepend($icon);
        } else {
            $header.css('cursor', 'hand');
            $header.css('cursor', 'pointer');
        }

        //Toggle
        var border = '';
        function toggle() {
            //Check if it's currently hidden or not
            if ($body.is(":hidden")) {
                expand();
            } else {
                collapse();
            }
        }
        if (config.headerCollapse === true) {
            $header.on('click', function () {
                toggle();
            });
        } else if ($icon) {
            $icon.on('click', function () {
                toggle();
            });
        }

        function expand() {
            if ($body.is(":hidden")) {
                $body.slideDown();
                //Toggle icon
                if ($icon) {
                    $icon.removeClass('fa-caret-right');
                    $icon.addClass('fa-caret-down');
                }
                //Switch classes
                $header.removeClass('ui-corner-all');
                $header.addClass('ui-corner-top');
                border = $body.css('border-top');
                $body.css('border-top', 'none');
            }
        }

        function collapse() {
            if (!$body.is(":hidden")) {
                $body.slideUp({
                    done: function () {
                        $header.addClass('ui-corner-all');
                    }
                });
                //Toggle icon
                if ($icon) {
                    $icon.removeClass('fa-caret-down');
                    $icon.addClass('fa-caret-right');
                }
                $body.css('border-top', border);
            }
        }

        me.expand = expand;
        me.collapse = collapse;

        return me;
    }
});