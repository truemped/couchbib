function(doc) {

    // do not index design documents
    if( doc._id.indexOf("_design") > -1) {
        return null;
    }

    var ret = new Document();
    
    if( doc.title ) {
        ret.add( doc.title , { field : "title", store : "yes" } );
    }

    if( doc.author ) {
        for( var idx in doc.author ) {
            ret.add( doc.author[idx] , { field : "author", store : "yes" } );
        }
    }

    if( doc.publisher ) {
        ret.add( doc.publisher, { field : "publisher" } );
    }

    if( doc.month ) {
        ret.add( doc.month, { field : "month" } );
    }

    if( doc.year ) {
        ret.add( doc.year, { field : "year" } );
    }

    if( doc.editor ) {
        ret.add( doc.editor, { field : "editor" } );
    }

    if( doc.volume ) {
        ret.add( doc.volume, { field : "volume" } );
    }

    if( doc.number ) {
        ret.add( doc.number, { field : "number" } );
    }

    if( doc.series ) {
        ret.add( doc.series, { field : "series" } );
    }

    if( doc.address ) {
        ret.add( doc.address, { field : "address" } );
    }

    if( doc.edition ) {
        ret.add( doc.edition, { field : "edition" } );
    }

    if( doc.pages ) {
        ret.add( doc.pages, { field : "pages" } );
    }

    if( doc.chapter ) {
        ret.add( doc.chapter, { field : "chapter" } );
    }

    if( doc.booktitle ) {
        ret.add( doc.booktitle, { field : "booktitle" } );
    }

    if( doc.journal ) {
        ret.add( doc.journal, { field : "journal" } );
    }

    if( doc.notes ) {
        ret.add( doc.notes, { field : "notes" } );
    }

    if( doc.tags ) {
        for( var idx in doc.tags ) {
            ret.add( doc.tags[idx].toLowerCase(), { field : "tags", store : "yes" } );
        }
    }

    if( doc.notes ) {
        ret.add( doc.notes );
    }

    return ret;
}
