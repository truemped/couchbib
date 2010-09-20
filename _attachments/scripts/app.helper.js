
/*
 * Some couchdb helper functions for sammy.
 */
var CouchDbHelpers = function( app ) {

    this.helpers( {
        withCouchApp: function(callback) {
            $.couch.app( function( app ) {
                var path = app.require( "vendor/sammy/lib/path" ).init( app.req );
                $.extend( app, path );
                callback( app );
            });
        },
        // append an ajax get request to the selector
        appendAjaxResp : function( url, selector ) {
            $.ajax( {
                type : "GET",
                dataType : "html",
                url : url,
                success : function(resp) {
                    $(selector).append(resp);
                },
                error : function( xhr, msg, e ) {
                    alert( msg );
                }
            });
        },
    });

};
