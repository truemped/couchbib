(function($) {

    Sammy = Sammy || {};

    /*
     * Some couchdb helper functions for sammy.
     */
    Sammy.CouchBibHelper = function( app ) {

        app.helpers( {
            withCouchApp: function(callback) {
                $.couch.app( function( app ) {
                    var path = app.require( "vendor/sammy/lib/path" ).init( app.req );
                    $.extend( app, path );
                    callback( app );
                });
            },
            appendAjaxResp : function( url, selector ) {
                // append an ajax get request to the selector
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
            alertDialog : function( message, options ) {
                // show a simple modal alert dialog
                var opt = {
                    modal : true,
                    resizable : false,
                    buttons : {
                        Ok : function() {
                            $( this ).dialog( "close" );
                        }
                    }
                }
                $.extend( true, opt, options );
                $("#dialog").empty();
                $("#dialog").append( message );
                $("#dialog").dialog( opt );
            },
        });
    }

})(jQuery);
