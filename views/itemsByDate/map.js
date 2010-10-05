function(doc) {

    if( doc.created_at && doc.title && doc.author ) {
        emit( doc.created_at, [doc.title, doc.author] );
    }

}
