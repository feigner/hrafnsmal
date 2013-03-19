/*!
 *
 * Hrafnsmal color fillers.
 *
 * Hamfisted aproach to applying individual color ranges based
 * on depth.
 *
 *
*******************************************************************************/

window.hrafnsmal = window.hrafnsmal || {};

window.hrafnsmal.fillers = (function(){
    /** 
     * define a public list of active fillers
     */
    var active = ['changes', 'deletions', 'additions', 'files', 'branch', 'author'],

    /**
     * draw filler controls and attach events
     */
    init = function(){
        var controls = $('#controls').html('<ul>'),
            list = $('ul', controls);

        active.map(function(f){
            list.append('<li data-filler="'+ f +'">'+f.toUpperCase()+'</li>');
        });

        $('#controls ul li').click(function(){
            $('#controls ul li.active').removeClass('active');
            $(this).addClass('active');
            $('body').trigger('filler_update', $(this).data('filler'));
        }); 
    },

    /**
     * Fillers. 
     */
    plain = (function(){
        var ordinal_one = d3.scale.category20c();

        return function(d){
            if (d.depth == 1){ return ordinal_one(d.name); }
            if (d.depth == 2){ return ordinal_one(d.parent.name); }
            if (d.depth == 3){ return ordinal_one(d.parent.parent.name); }
        }
    })(),
    changes = (function(){
        var repo_color =  d3.scale.linear().range(['#CCEBC5', '#1CACC9']).clamp(true).domain([0,3000]),
            push_color =  d3.scale.linear().range(['#CCEBC5', '#1CACC9']).clamp(true).domain([0,250]),
            commit_color =  d3.scale.linear().range(['#CCEBC5', '#1CACC9']).clamp(true).domain([0,150]);

        return function(d){
            metric = d.stats.modifications.total;
            if (d.depth == 1){ return repo_color(metric); }
            if (d.depth == 2){ return push_color(metric); }
            if (d.depth == 3){ return commit_color(metric); }
        }
    })(),
    deletions = (function(){

        var repo_color =  d3.scale.linear().range(['#FEE391', '#CC4C02']).clamp(true).domain([0,400]),
            push_color =  d3.scale.linear().range(['#FEE391', '#CC4C02']).clamp(true).domain([0,48]),
            commit_color =  d3.scale.linear().range(['#FEE391', '#CC4C02']).clamp(true).domain([0,30]);

        return function(d){
            metric = d.stats.modifications.deletions;
            if (d.depth == 1){ return repo_color(metric); }
            if (d.depth == 2){ return push_color(metric); }
            if (d.depth == 3){ return commit_color(metric); }
        }
    })(),
    additions = (function(){

        var repo_color =  d3.scale.linear().range(['#F7FCB9', '#78C679']).clamp(true).domain([0,800]),
            push_color =  d3.scale.linear().range(['#F7FCB9', '#78C679']).clamp(true).domain([0,200]),
            commit_color =  d3.scale.linear().range(['#F7FCB9', '#78C679']).clamp(true).domain([0,140]);

        return function(d){
            metric = d.stats.modifications.additions;
            if (d.depth == 1){ return repo_color(metric); }
            if (d.depth == 2){ return push_color(metric); }
            if (d.depth == 3){ return commit_color(metric); }
        }
    })(),
    files = (function(){

        var repo_color =  d3.scale.linear().range(['#CCECE6', '#66C2A4']).clamp(true).domain([0,290]),
            push_color =  d3.scale.linear().range(['#CCECE6', '#66C2A4']).clamp(true).domain([0,155]),
            commit_color =  d3.scale.linear().range(['#CCECE6', '#66C2A4']).clamp(true).domain([0,50]);

        return function(d){
            if (d.depth == 1){ return repo_color(d.stats.files); }
            if (d.depth == 2){ return push_color(d.stats.files); }
            if (d.depth == 3){ return commit_color(d.stats.files); }
        }
    })(),
    branch = (function(){

        var ordinal_one = d3.scale.category20c();

        return function(d){
            if (d.depth == 1){ return '#ccc'; }
            if (d.depth == 2){
                return ordinal_one(d.ref.replace('refs/heads/',''));
            }
            if (d.depth == 3){ return '#ccc'; }
        }
    })(),
    author = (function(){

        var ordinal_one = d3.scale.category20c();

        return function(d){
            if (d.depth == 1){ return '#ccc'; }
            if (d.depth == 2){ return ordinal_one(d.actor.id); }
            if (d.depth == 3){ return '#ccc'; }
        }
    })();

    return{
        init : init,
        plain : plain,
        changes : changes,
        deletions : deletions,
        additions : additions,
        files : files,
        branch : branch,
        author : author
    }

})();
