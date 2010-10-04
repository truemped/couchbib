(function($) {

    Sammy = Sammy || {};

    Sammy.CouchBibSearch = function( app ) {

        var search = function( couchapp, data ) {
            var self = this;

            $("#content").append(couchapp.ddoc.templates.search);
            $("button, input:submit, input:file").button();

            var query = "", options="&limit=10"; // &include_docs=true

            if(data.params.author && data.params.author.length > 0) {
                query += "author:("+data.params.author+") ";
                $("#search_form [name=author]").val( data.params.author );
            }
            if(data.params.tags && data.params.tags.length > 0) {
                query += "tags:("+data.params.tags+") ";
                $("#search_form [name=tags]").val( data.params.tags );
            }
            if(data.params.title && data.params.title.length > 0) {
                query += "title:("+data.params.title+")";
                $("#search_form [name=title]").val( data.params.title );
            }
            if(data.params.skip && data.params.skip.length > 0 ) {
                options += "&skip="+data.params.skip;
            }

            var url = "/"+couchapp.db.name+"/_fti/_design/couchbib/shelf?q="+query+options;
            $.ajax( {
                type : "GET",
                dataType : "json",
                url : url,
                success : function( resp ) {
                    var results = [], idx = 0;

                    if( resp.rows && resp.rows.length > 0 ) {
                        // we have results
                        resp.rows.map( function( row ) {
                            if( typeof( row.fields.author ) === "object" ) {
                                $("#search_results").append( self.mustache( couchapp.ddoc.templates.newestItems,
                                    { docid : row.id, title : row.fields.title, author : row.fields.author.join( '; ' ) } ) );
                            } else {
                                $("#search_results").append( self.mustache( couchapp.ddoc.templates.newestItems,
                                    { docid : row.id, title : row.fields.title, author : row.fields.author } ) );
                            }
                            idx++;
                        });

                        if( resp.total_rows > 10 ) {
                            var paging = {
                                baseurl : "#/search/query?author="+data.params.author+"&title="+data.params.title+"&"
                                    + "tags="+data.params.tags,
                                next : false,
                                previous : false
                            };
                            if( resp.skip > 0 ) {
                                // show the prev button
                                paging.previous = "&skip="+(resp.skip - 10);
                            }
                            if( resp.skip < resp.total_rows - 10 ) {
                                // show the next button
                                paging.next = "&skip="+(resp.skip + 10);
                            }
                            $("#search_paging").append( self.mustache( couchapp.ddoc.templates.searchResultPaging, paging ) );
                        }
                    }
                },
                error : function( xhr, msg, e ) {
                    self.alertDialog( self.mustache( couchapp.ddoc.templates.messagedialog, { message : msg } ) );
                }
            });
        }

        app.helper( 'search', search );
    }

})(jQuery);
