function(doc) {
    if(doc.tags && typeof(doc.tags) === 'object') {
        for( var idx in doc.tags ) {
            emit( doc.tags[idx].toLowerCase(), 1 );
        }
    }
}
