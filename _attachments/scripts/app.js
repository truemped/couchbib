;(function($) {

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

    var app = $.sammy( function() {
        this.use( Sammy.Title );
        this.use( Sammy.Mustache );
        this.use( CouchDbHelpers );

        this.setTitle( 'couchbib' );

        this.get('#/', function(context) {
            context.redirect( '#/newest' );
        });

        this.get('#/newest', function(context) {
            context.trigger( 'show-newest-items' );
        });

        this.get('#/doc/:docid', function(context) {
            context.trigger( 'show-item-details', { docid : this.params['docid'] } );
        });

        this.get('#/tagcloud', function(context) {
            context.trigger( 'show-tag-cloud' );
        });

        this.get('#/search', function(context) {
            context.trigger( 'search', {} );
        });

        this.get('#/search/:query', function(context) {
            context.trigger( 'search', { query :  this.params['query'] } );
        });

        this.get('#/new/:doctype', function(context) {
            context.trigger( 'new-item', { doctype : this.params['doctype'] } );
        });


        /*
         * run initializing code
         * At the moment only the definition of the new item menu happens here
         */
        this.bind( 'run', function() {
            var context = this;
            this.withCouchApp( function( app ) {
                // at this point initialize the new items menu
                $("#newDocTypeList").empty();
                var types = app.ddoc.types;
                var fieldnames = app.ddoc.fieldnames;
                var template = app.ddoc.templates.newDocTypeList;

                var typedesc = [];
                for( var idx in types ) {
                    typedesc.push( { id : idx, name : types[idx]['name'] } );
                }
                $("#newDocTypeList").append( context.mustache( template, { typedesc : typedesc } ) );
            });
        });


        /*
         * show the newest items:
         */
        this.bind( 'show-newest-items', function() {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function( app ) {
                self.appendAjaxResp( app.listPath("newest-items", "itemsByDate") + "?descending=true&limit=20", "#content" );
            });
        });


        /*
         * show the input for a new entry
         */
        this.bind( 'new-item', function(e, data) {
            var self = this;
            $("#content").empty();
            self.withCouchApp( function(app) {
                if( app.ddoc.types[ data['doctype'] ] ) {

                    var type = app.ddoc.types[ data['doctype'] ];
                    var doc = {};
                    doc.fields = [ { id : "citekey", name : app.ddoc.fieldnames[ "citekey" ] } ];

                    for( var idx in type.fields ) {
                        if( type.fields[idx].indexOf( "note" ) == -1 ) {
                            doc.fields.push( { id : type.fields[idx], name : app.ddoc.fieldnames[ type.fields[idx] ] } );
                        }
                    }
                    doc.fields.push( { id : "tags", name : app.ddoc.fieldnames[ "tags" ] } );

                    var allFields = ["citekey"];
                    allFields = allFields.concat( type.fields );
                    allFields.push( "tags" );

                    $("#content").append( self.mustache( app.ddoc.templates.itemdetails, doc ) );
                    $("#itemDetails").tabs();

                    var postForm = app.docForm( "form#item_details", {
                        fields : allFields,
                        template : { type : data['doctype'] },
                        onLoad : function(doc) {
                            if( doc.tags ) {
                                doc.tags = doc.tags.join(" ");
                            }
                            if( doc.author ) {
                                doc.author = doc.author.join(";");
                            }
                        },
                        beforeSave : function(doc) {
                            if(!doc.created_at) {
                                doc.created_at = new Date();
                            }
                            if(!doc._id) {
                                doc._id = doc.citekey;
                            }
                            if(doc.tags) {
                                doc.tags = $.trim(doc.tags);
                                doc.tags = doc.tags.split(" ");
                                for(var idx in doc.tags) {
                                    doc.tags[idx] = $.trim(doc.tags[idx]);
                                }
                            }
                            if(doc.author) {
                                doc.author = doc.author.split(";");
                                for(var idx in doc.author) {
                                    doc.author[idx] = $.trim(doc.author[idx]);
                                }
                            }
                        },
                        success : function( resp, localDoc ) {
                            self.redirect( "#/doc/"+localDoc._id );
                        }
                    });
                } else {
                    alert( "Unbekannter Typ!" );
                }
            });
        });


        /*
         * Show the item details
         */
        this.bind( 'show-item-details', function(e, data) {
            $("#content").empty();
            var self = this;
            this.withCouchApp( function( app ) {

                app.db.openDoc( data['docid'], {
                    success : function(doc) {

                        var type = app.ddoc.types[ doc.type ];
                        doc.fields = [ { id : "citekey", name : app.ddoc.fieldnames[ "citekey" ] } ];

                        var allFields = ["citekey"];
                        allFields = allFields.concat( type.fields );
                        allFields.push( "tags" );

                        for( var idx in type.fields ) {
                            if( type.fields[idx].indexOf( "note" ) == -1 ) {
                                doc.fields.push( { id : type.fields[idx], name : app.ddoc.fieldnames[ type.fields[idx] ] } );
                            }
                        }
                        doc.fields.push( { id : "tags", name : app.ddoc.fieldnames[ "tags" ] } );
                        doc.regular = true;

                        // add all the attachments
                        doc.attachments = "";
                        for( var name in doc._attachments ) {
                            var view = doc._attachments[name];
                            view.name = name;
                            view._id = doc._id;
                            view._rev = doc._rev;
                            doc.attachments += self.mustache( app.ddoc.templates.attachment, view );
                            doc.has_attachments = true;
                        }

                        $("#content").append( self.mustache( app.ddoc.templates.itemdetails, doc ) );
                        $("#itemDetails").tabs();
                        $("#deleteDoc").bind( 'click', function() {
                            if( confirm( "Eintrag wirklich löschen?" ) ) {
                                app.db.removeDoc( { _id : doc._id, _rev : doc._rev } );
                                self.redirect( "#/newest" );
                            }
                        });
                        $("button, input:submit, input:file").button();

                        var postForm = app.docForm( "form#item_details", {
                            id : data['docid'],
                            fields : allFields,
                            onLoad : function(doc) {
                                if( doc.tags ) {
                                    doc.tags = doc.tags.join(" ");
                                }
                                if( doc.author ) {
                                    doc.author = doc.author.join(";");
                                }
                            },
                            beforeSave : function(doc) {
                                if(doc.tags) {
                                    doc.tags = $.trim(doc.tags);
                                    doc.tags = doc.tags.split(" ");
                                    for(var idx in doc.tags) {
                                        doc.tags[idx] = $.trim(doc.tags[idx]);
                                    }
                                }
                                if(doc.author) {
                                    doc.author = doc.author.split(";");
                                    for(var idx in doc.author) {
                                        doc.author[idx] = $.trim(doc.author[idx]);
                                    }
                                }
                            },
                        });

                        // add the attachment uploading
                        $("form#upload_attachment").submit( function(e) {
                            e.preventDefault();

                            var data = {};
                            $.each($("form#upload_attachment :input").serializeArray(), function(i, field) {
                                data[field.name] = field.value;
                            });
                            $("form#upload_attachment :file").each(function() {
                                data[this.name] = this.value; // file inputs need special handling
                            });

                            if (!data._attachments || data._attachments.length == 0) {
                                alert("Bitte eine Datei zum Speichen auswählen");
                                return;
                            }

                            $(this).ajaxSubmit({
                                url:  [app.db.uri, data['docid']].join('/'),
                                success: function(resp) {
                                    alert('Anhang hinzugefügt!');
                                    self.trigger( "show-item-details", { docid:data['docid'] } );
                                }
                            });
                        });
                    }
                });


            });
        });

        /*
         * show the tag cloud
         */
        this.bind( 'show-tag-cloud', function(e,data ) {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function( app ) {
                self.appendAjaxResp( app.listPath("tag-cloud", "tagcloud")+"?group=true", "#content" );
            });
        });

    });

    $(function() {
        app.run('#/')
    });
})(jQuery);
