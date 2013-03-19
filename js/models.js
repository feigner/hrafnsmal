/*!
 *
 * Hrafnsmal models
 *
 * Small decorator classes to wrap github api responses
 * allowing for data massaging / bookkeeping / helper functions.
 *
 *
*******************************************************************************/

window.hrafnsmal = window.hrafnsmal || {};

window.hrafnsmal.models = (function(){

    Root = function(){

        var root = {};
        $.extend(root, {
            id: 0,
            stats: { pushes: 0, commits: 0, files: 0, authors: [], modifications: {total: 0, additions: 0, deletions: 0} },
            children: [] // repositories
        });

        /**
         *  given a github api event, return a reference if we have it,
         *  otherwise, create a new one.
         */
        root.get_repository = function(api_event){
            idx = root.children.map(function(r){ return r.id; }).indexOf(api_event.repo.id);
            if ( idx >= 0 ){ 
                return root.children[idx]; 
            }
            else{
                repo = window.hrafnsmal.models.Repository(api_event);
                root.children.push(repo);
                return repo;
            }
        }

        root.recalculate_stats = function(){
            root.stats = { pushes: 0, commits: 0, files: 0, authors: [], modifications: {total: 0, additions: 0, deletions: 0} };
            $.each(root.children, function(i, repository){
                root.stats.pushes += repository.stats.pushes;
                root.stats.commits += repository.stats.commits;
                root.stats.files += repository.stats.files;
                root.stats.modifications.total += repository.stats.modifications.total;
                root.stats.modifications.additions += repository.stats.modifications.additions;
                root.stats.modifications.deletions += repository.stats.modifications.deletions;
            });
        }

        return root;
    },

    /**
     *  Take an api response for an event and
     *  pluck out any info we're interested in
     */
    Repository = function(api_event){

        if ( !api_event ) return;

        repo = api_event.repo || {};
        $.extend(repo, {
            // strop the org name out of the repo name
            name: api_event.repo.name.substr(api_event.repo.name.indexOf('/')+1),
            stats: { pushes: 0, commits: 0, files: 0, authors: [], modifications: {total: 0, additions: 0, deletions: 0} },
            children: [] // pushes
        });

        repo.add_push = function(push){
            this.children.push(push);
            this.stats.pushes++;
            this.stats.commits+= push.children.length;
            this.stats.files += push.stats.files;
            this.stats.modifications.total += push.stats.modifications.total;
            this.stats.modifications.additions += push.stats.modifications.additions;
            this.stats.modifications.deletions += push.stats.modifications.deletions;
        }

        return repo;
    },


    /**
     *  Take an api response for an event
     *  and pluck out any info we're interested in.
     */
    Push = function(api_event){

        // require api_event
        if ( !api_event ) return;

        // 
        push = {};
        $.extend(push, {
            id: api_event.id,
            actor: api_event.actor,
            created_at: api_event.created_at,
            ref: api_event.payload.ref,
            url: api_event.repo.url,
            name: '',
            stats: { commits: 0, files: 0, authors: [], modifications: {total: 0, additions: 0, deletions: 0} },
            children: [] // commits
        });

        push.add_commit = function(commit){
            this.children.push(commit);
            this.stats.commits++;
            this.stats.files += commit.stats.files;
            this.stats.modifications.total += commit.stats.modifications.total;
            this.stats.modifications.additions += commit.stats.modifications.additions;
            this.stats.modifications.deletions += commit.stats.modifications.deletions;
        }

        return push;
    },

    /**
     *  Take the api response for a commit
     *  and reuse it wholesale.
     */
    Commit = function(api_commit){

        if (!api_commit) return;

        commit = api_commit;

        $.extend(commit, {
            //HACK: ensure a unique commit id across all repos / pushes
            id: api_commit.url + Math.floor( Math.random()*99999 ),
            stats: { files: api_commit.files.length, modifications: api_commit.stats },
        });

        return commit;
    };

    return{
        Root:Root,
        Repository:Repository,
        Push:Push,
        Commit:Commit
    }

})();
