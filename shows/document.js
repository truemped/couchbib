function(doc, req) {  
    var ddoc = this;
    var templates = ddoc.templates
    var types = ddoc.types;
    var Mustache = require( "vendor/sammy/lib/mustache" );
    var fieldnames = ddoc.fieldnames;

    var prepareFields = function( doc, commonFields ) {
        doc.allfields = commonFields;
        doc.allfields.splice( 0,0,"citekey" );
        doc.allfields.push("tags");
        doc.fields = [];
        for( var idx in doc.allfields ) {
            if( commonFields[idx].indexOf( "note" ) == -1 ) {
                doc.fields[ idx ] = { id : commonFields[idx], name : fieldnames[ commonFields[idx] ] };
            }
        }
        return doc;
    }

    // regular display
    doc.regular = true;

    // general data to be displayed
    var type = types[ doc.type ];
    doc = prepareFields( doc, type.fields );

    // add all the attachments
    doc.attachments = "";
    for( var name in doc._attachments ) {
        var view = doc._attachments[name];
        view.name = name;
        view._id = doc._id;
        view._rev = doc._rev;
        doc.attachments += Mustache.to_html( templates.attachment, view );
        doc.has_attachments = true;
    }

    return {
        body : Mustache.to_html( templates.itemdetails, doc ),
        headers : {
            "Content-Type" : "text/html",
            "Vary" : "Accept"
        }
    }
}
