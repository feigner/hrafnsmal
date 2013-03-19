/*!
 *
 * Hrafnsmal github event poling.
 *
 * Loads 24h worth of data from a github org's event stream into
 * a local buffer, then slowly releases them via event for later
 * consumption.
 *
 * Once all the events have been doled out, we periodically poll
 * for any new events.
 *
 * triggers: api_event
 *
 *
*******************************************************************************/
window.hrafnsmal = window.hrafnsmal || {};

window.hrafnsmal.events = (function(){

    /** 
     * Kick things off
     */
    init = function () {
        if (window.hrafnsmal.auth.access_token && 
            window.hrafnsmal.auth.event_api){
            load_historical_events(60*60*24*1*1000);
        }
        else{
            console.log('auth: No access_token / event_api defined.');
        }
    },


    /**
     * Retrieve a single page of events from the api.
     * Returns an array of JSON events to the callback.
     */
    fetch_events = function(page_number, callback){
        var _events = [];
        $.getJSON(window.hrafnsmal.auth.event_api + '?page=' + page_number + 
                  '&access_token=' + window.hrafnsmal.auth.access_token, function(events) {
            $.each(events, function(index, event){
                _events.push(event); 
            });
            return callback(_events);
        });
    },


    /**
     * Given a delta (ms), retrieve all events between now and then.
     */
    fetch_old_events = function(delta, callback){

        var _this = this,
            _events = [],
            now = new Date(),
            page = 1;

        interval = setInterval(function(){
            halt = false;
            _this.fetch_events(page++, function(events){
                $.each(events, function(index, event){
                    then = new Date(event.created_at);
                    if ( now - then < delta ){
                        _events.push(event);
                    }
                    else{
                        halt = true;
                        return false;
                    }
                });
                if (halt){
                    clearInterval(interval);
                    callback(_events);
                }
            });
        }, 500);
    },


    /**
     * Helper function to fetch old events, do some basic checking,
     * then call the main handler.
     */
    load_historical_events = function(delta){

        var _this = this,
            interval = 2000;

        this.fetch_old_events(delta, function(events){
            timer = setInterval(function(){
                $('body').trigger('api_event', events.pop());
                if (events.length === 0){
                    clearInterval(timer);
                    _this.monitor_new_events();
                }
            }, interval);
        });
    },


    /**
     * Helper function to poll for new events
     */
    monitor_new_events = function(){

        var _this = this,
            interval = 5000,
            last_ingested_date = new Date();

        timer = setInterval(function(){
            _this.fetch_events(1, function(events){
                $.each(events, function(index, event){

                    if (last_ingested_date >= new Date(event.created_at)){ return false; }
                    $('body').trigger('api_event', event);
                    last_ingested_date = new Date(event.created_at);
                });
            });

        }, interval);
    };

    return {
        init:init
    }

})();
