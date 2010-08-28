function( head, req ) {
    // code vendor/mustache/mustache.js
    // json templates.citationEditorHead
    // json templates.citationEditorRow
    // json templates.citationEditorTail

    var row;
    send( templates.citationEditorHead );
    while( row = getRow() ) {
        send( Mustache.to_html( templates.citationEditorRow, {
            name : row.key,
            citations : row.doc.citations
        }));
    }
    send( templates.citationEditorTail );
}
