_.asyncLoop = function (o) {
  //IIFE to keep from scoping issues when multiple loops are running
  (function () {
    var i = -1;
  
    var loop = function (killLoopOnFalse) {
      //Check to see if we asked to kill function
      if (killLoopOnFalse === false) {return;}
      //Loop to next item unless we're on the last item
      if (++i >= o.collection.length) {
        o.complete();
      } else {
        o.each(loop, o.collection[i], o.collection, i);
      }
    };
    loop();//init
  })();
};