/*!
 *
 * Hrafnsmal stats
 *
 * Listen for data_update events and update the page stats.
 *
 *
*******************************************************************************/

window.hrafnsmal = window.hrafnsmal || {};

window.hrafnsmal.stats = (function(){

    var stats = d3.select("#stats");

    stats_update = function(e, root){
        stats.html(function(d){ 
            return root.children.length + " REPOSITORIES / " +
                   root.stats.pushes + " PUSHES / " +
                   root.stats.commits + " COMMITS <br />" +
                   root.stats.files + " FILES / " +
                   root.stats.modifications.additions + " ADDITIONS / " +
                   root.stats.modifications.deletions + " DELETIONS / " +
                   root.stats.modifications.total + " CHANGES";
        });
    }

    // register event handlers
    $('body').on('data_update', stats_update);

})();
