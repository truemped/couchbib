function(head, req) {
    var ddoc = this;
    var Mustache = require( "vendor/sammy/lib/mustache" );
    var template = ddoc.templates.tagcloud;

    var row;
    while( row = getRow() ) {
        send( Mustache.to_html( template, {
            tag : row.key,
            tag_uri : encodeURIComponent( row.key ),
            count : row.value * 10 } )
        );
    }
}
