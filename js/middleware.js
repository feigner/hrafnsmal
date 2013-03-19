/*!
 *
 * Hrafnsmal middleware.
 *
 * Catch api_events and massage them into our data structure. Throws an 
 * data_update event when internal data has been updated.
 *
 *
*******************************************************************************/

window.hrafnsmal = window.hrafnsmal || {};

window.hrafnsmal.middleware = (function(){

    var _root = window.hrafnsmal.models.Root(),

    catch_api_push_event = function(e,api_event){
        // only deal with distinct push events
        if (!api_event || !api_event.type || api_event.type !== "PushEvent" || api_event.payload.distinct_size < 1) return;

        /** 
         * populate push model with commit details (via api),
         * and shove them into our heirarchy
         */
        push = window.hrafnsmal.models.Push(api_event);
        $.each(api_event.payload.commits, function(i, c){
            $.ajax({
                url: c.url + '?access_token=' + window.hrafnsmal.auth.access_token,
                dataType: 'json',
                success: function(data){ 
                    commit = window.hrafnsmal.models.Commit(data);
                    push.add_commit(commit);

                    // TODO: HACK! find a better way to indicate if we've fetched all the commits...
                    if(push.children.length == api_event.payload.commits.length){
                        repo = _root.get_repository(api_event);
                        repo.add_push(push);
                        _root.recalculate_stats();
                        $('body').trigger('data_update', _root);
                    }
                },
                error: function( data ){ console.log('error:' + data); }
            });
        });
    };

    // register event handlers
    $('body').on('api_event', catch_api_push_event);

    return{ root : _root }

})();

