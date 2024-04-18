//function to replace the URL of a link
define([
    "app/brands/services/replaceLinkHref"
],function (selector, newHref) {
    return {
        replaceLinkHref: () => {
            const link = document.getElementById(selector);
            if (!link) {
                return;
            }
            link.href = newHref;
        }
    }
});
