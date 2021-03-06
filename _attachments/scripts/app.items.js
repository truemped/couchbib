(function($) {

    Sammy = Sammy || {};

    Sammy.CouchBibItemAdmin = function( app ) {

        var createNewItem = function( couchapp, data, context ) {

            if( !couchapp.ddoc.types[ data['doctype'] ] ) {

                context.alertDialog( context.mustache( couchapp.ddoc.templates.messagedialog, { message : "Unbekannter Typ!" } ) );

            } else {

                var type = couchapp.ddoc.types[ data['doctype'] ];
                var doc = {};
                doc.fields = [ { id : "citekey", name : couchapp.ddoc.fieldnames[ "citekey" ] } ];

                for( var idx in type.fields ) {
                    if( type.fields[idx].indexOf( "note" ) == -1 ) {
                        doc.fields.push( { id : type.fields[idx], name : couchapp.ddoc.fieldnames[ type.fields[idx] ] } );
                    }
                }
                doc.fields.push( { id : "tags", name : couchapp.ddoc.fieldnames[ "tags" ] } );

                var allFields = ["citekey"];
                allFields = allFields.concat( type.fields );
                allFields.push( "tags" );

                $("#content").append( context.mustache( couchapp.ddoc.templates.itemdetails, doc ) );
                $("#itemDetails").tabs();

                var postForm = couchapp.docForm( "form#item_details", {
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
                        context.redirect( "#/doc/"+localDoc._id );
                    }
                });
                $("button, input:submit, input:file").button();
            }
        }

        var editItem = function( couchapp, data, context ) {

            var showEditor = function( citationformats, availableBibliographies ) {
                couchapp.db.openDoc( data['docid'], {
                    success : function( doc ) {

                        var type = couchapp.ddoc.types[ doc.type ];
                        doc.fields = [ { id : "citekey", name : couchapp.ddoc.fieldnames[ "citekey" ] } ];

                        var allFields = ["citekey"];
                        allFields = allFields.concat( type.fields );
                        allFields.push( "tags" );
                        allFields.push( "bibliography" );

                        for( var idx in type.fields ) {
                            if( type.fields[idx].indexOf( "note" ) == -1 ) {
                                doc.fields.push( { id : type.fields[idx], name : couchapp.ddoc.fieldnames[ type.fields[idx] ] } );
                            }
                        }
                        doc.fields.push( { id : "tags", name : couchapp.ddoc.fieldnames[ "tags" ] } );
                        doc.regular = true;

                        // add the quote
                        if( citationformats && citationformats.types[doc.type] ) {
                            doc.parsedquote = context.mustache( citationformats.types[doc.type], doc );
                            doc.parsedbibliography = context.mustache( citationformats.bibliography[doc.type], doc );
                        } else {
                            doc.parsedquote = context.mustache( "<b>{{author}}</b>, <i>{{title}}</i>, {{year}}", doc );
                            doc.parsedbibliography = context.mustache( "<b>{{author}}</b>, <i>{{title}}</i>, {{year}}", doc );
                        }

                        // add all the attachments
                        doc.attachments = "";
                        for( var name in doc._attachments ) {
                            var view = doc._attachments[name];
                            view.name = name;
                            view._id = doc._id;
                            view._rev = doc._rev;
                            doc.attachments += context.mustache( couchapp.ddoc.templates.attachment, view );
                            doc.has_attachments = true;
                        }

                        // update the ui
                        $("#content").append( context.mustache( couchapp.ddoc.templates.itemdetails, doc ) );
                        $("#itemDetails").tabs();
                        $("button, input:submit, input:file").button();
                        $("#newBibliography").button( {
                            icons : {
                                primary : "ui-icon-arrowthick-1-n"
                            },
                            text : false
                        });
                        $("#delBibliography").button( {
                            icons : {
                                primary : "ui-icon-trash"
                            },
                            text : false
                        });

                        // bind the form to the document
                        var postForm = couchapp.docForm( "form#item_details", {
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

                        var addBibIfNotExists = function( newBibliographyName ) {
                            var contains = false;
                            $("#bibliographySelector option").each( function() {
                                if( $(this).val() == newBibliographyName ) contains = true;
                            });
                            if(!contains) {
                                $("#bibliographySelector").append( "<option>"+newBibliographyName+"</option>" );
                            }
                        }

                        // add the newBibliography handling
                        $("#newBibliography").bind( 'click', function() {
                            addBibIfNotExists( $("#newBibliographyName").val() );
                        });
                        
                        $("#delBibliography").bind( 'click', function() {
                            $("#bibliographySelector option:selected").each( function() {
                                $(this).remove();
                            });
                        });

                        // show all availableBibliographies
                        $.each( availableBibliographies, function(index, value) {
                            addBibIfNotExists( value );
                        });
                        var sorted_options = $("#bibliographySelector option");
                        sorted_options.sort( function(a,b) {
                            if(a.text > b.text) return 1;
                            else if(a.text < b.text) return -1;
                            else return 0;
                        });
                        $("#bibliographySelector").empty().append( sorted_options );

                        // activate the delete button
                        $("#deleteDoc").bind( 'click', function() {
                            context.alertDialog( context.mustache( couchapp.ddoc.templates.messagedialog, { message : "Eintrag wirklich löschen?" } ), {
                                buttons : {
                                    Ok : function() {
                                        couchapp.db.removeDoc( { _id : doc._id, _rev : doc._rev } );
                                        $("#content").empty();
                                        context.redirect( "#/newest" );
                                        $( this ).dialog( "close" );
                                    },
                                    Abbrechen : function () {
                                        $( this ).dialog( "close" );
                                    }
                                }
                            });
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
                                context.alertDialog( context.mustache( couchapp.ddoc.templates.messagedialog,
                                    { message : "Bitte eine Datei zum Speichen auswählen!" } ));
                                return;
                            }

                            var docUrl = [couchapp.db.uri, data._id].join('/');
                            $(this).ajaxSubmit({
                                url: docUrl,
                                success: function(resp) {
                                    context.alertDialog( context.mustache( couchapp.ddoc.templates.messagedialog, { message : "Anhang hinzugefügt!" } ) );
                                    context.trigger( "show-item-details", { docid:data._id } );
                                }
                            });
                        });

                        // add the attachment deletion
                        $(".deleteattachments").click( function() {
                            var url = $(this).attr('name');
                            context.alertDialog( context.mustache( couchapp.ddoc.templates.messagedialog, { message : "Eintrag wirklich löschen?" } ), {
                                buttons : {
                                    Ok : function() {
                                        $( this ).dialog( "close" );
                                        $.ajax( {
                                            type : "DELETE",
                                            url : url,
                                            success: function() {
                                                context.alertDialog( context.mustache( couchapp.ddoc.templates.messagedialog, { message : "Wurde gelöscht" } ) );
                                                context.trigger( "show-item-details", { docid:data['docid'] } );
                                            }
                                        });
                                    },
                                    Abbrechen : function () {
                                        $( this ).dialog( "close" );
                                    }
                                }
                            });
                        });

                        // add the nice editor for notes
                        $("#nice_editor").markItUp(myMarkdownSettings);

                    }

                });
            }

            var prepareEditor = function( citationformats ) {

                // add all available bibliographies
                couchapp.design.view( "bibliography", {
                    group : true,
                    success : function(resp) {
                        var availableBibliographies = [];
                        for( var row in resp.rows ) {
                            availableBibliographies.push( resp.rows[ row ].key );
                        }

                        showEditor( citationformats, availableBibliographies );
                    }
                });

            }

            couchapp.db.openDoc( "citationformats", {
                success : function( citationformats ) {
                    prepareEditor( citationformats );
                },
                error : function() {
                    prepareEditor();
                }
            });

        }

        /*
         * show the input for a new entry
         */
        this.bind( 'new-item', function(e, data) {
            $("#content").empty();
            var self = this;
            this.withCouchApp( function(app) {
                createNewItem( app, data, self );
            });
        });


        /*
         * Show the item details
         */
        this.bind( 'show-item-details', function(e, data) {
            $("#content").empty();
            var self = this;
            this.withCouchApp( function( app ) {
                editItem( app, data, self );
            });

        });

    }

})(jQuery);
