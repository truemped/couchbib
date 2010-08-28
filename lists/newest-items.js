function(head, req) {
    var ddoc = this;
    var Mustache = require( "vendor/sammy/lib/mustache" );
    var template = ddoc.templates.newestItems;

    var row;
    while( row = getRow() ) {
        send( Mustache.to_html( template, {
            docid : row.id,
            title : row.value[0],
            author : row.value[1].join('; ')
        }));
    }
}
