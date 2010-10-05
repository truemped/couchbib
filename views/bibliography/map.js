function( doc ) {

    if( doc._id != "citationformats" && doc.bibliography ) {
        for( var idx in doc.bibliography ) {
            emit( doc.bibliography[idx], 1 );
        }
    }

}
