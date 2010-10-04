(function($) {

    var app = $.sammy( function() {
        this.use( Sammy.Title );
        this.use( Sammy.Mustache );

        // import all CouchBib plugins
        this.use( Sammy.CouchBibHelper );
        this.use( Sammy.CouchBibItemAdmin );
        this.use( Sammy.CouchBibSearch );
        this.use( Sammy.CouchBibCitations );

        this.setTitle( 'couchbib' );

        this.get('#/', function(context) {
            context.redirect( '#/newest' );
        });

        this.get('#/newest', function(context) {
            context.trigger( 'show-newest-items' );
        });

        this.get('#/doc/:docid', function(context) {
            context.trigger( 'show-item-details', { docid : this.params['docid'] } );
        });

        this.get('#/tagcloud', function(context) {
            context.trigger( 'show-tag-cloud' );
        });

        this.get('#/tag/:tag', function(context) {
            context.trigger( 'show-by-tag', { tag : this.params['tag'] } );
        });

        this.get('#/search', function(context) {
            context.trigger( 'search', {} );
        });

        this.get('#/search/query', function(context) {
            context.trigger( 'searchQuery', { params :  this.params } );
        });

        this.get('#/new/:doctype', function(context) {
            context.trigger( 'new-item', { doctype : this.params['doctype'] } );
        });

        this.get('#/citations', function(context) {
            context.trigger( 'show-citation-editor', {} );
        });


        /*
         * run initializing code
         * At the moment only the definition of the new item menu happens here
         */
        this.bind( 'run', function() {
            var context = this;
            this.withCouchApp( function( app ) {
                // at this point initialize the new items menu
                $("#newDocTypeList").empty();
                var types = app.ddoc.types;
                var fieldnames = app.ddoc.fieldnames;
                var template = app.ddoc.templates.newDocTypeList;

                var typedesc = [];
                for( var idx in types ) {
                    typedesc.push( { id : idx, name : types[idx]['name'] } );
                }
                $("#newDocTypeList").append( context.mustache( template, { typedesc : typedesc } ) );

                // and now some db maintenance:
//                app.db.compact();
//                app.db.viewCleanup();
//                app.db.compactView();
            });
        });


        /*
         * show the newest items:
         */
        this.bind( 'show-newest-items', function() {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function( app ) {
                self.appendAjaxResp( app.listPath("newest-items", "itemsByDate") + "?descending=true&limit=20", "#content" );
            });
        });

        /*
         * show the tag cloud
         */
        this.bind( 'show-tag-cloud', function(e,data ) {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function( app ) {
                self.appendAjaxResp( app.listPath("tag-cloud", "tagcloud")+"?group=true", "#content" );
            });
        });

        /*
         * show all elements matching a specific tag
         */
        this.bind( 'show-by-tag', function(e,data) {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function( app ) {
                self.appendAjaxResp( app.listPath("tag-items", "tagcloud")+"?reduce=false&include_docs=true&key=%22"+data.tag+"%22", "#content" );
            });
        });
    });

    $(function() {
        app.run('#/')
    });

})(jQuery);
