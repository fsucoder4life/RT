//function to replace the title of an element
define([
    "app/brands/services/setText",
    "dojo/_base/declare",
],function (setText,declare) {
    
    return declare(["set"],{
        function(selector,text){
        console.log("Selector: " + selector + " - " + " Text: " + text);
        const title = document.getElementById(selector);
        if (!title) {
            return;
        }
        title.innerText = text;

    }});

   // return setText.set(selector,text);
    // const set = (function(selector,text)  {
    //     console.log("Selector: " + selector + " - " + " Text: " + text);
    //     const title = document.getElementById(selector);
    //     if (!title) {
    //         return;
    //     }
    //     title.innerText = text;

    // })();
   
});
