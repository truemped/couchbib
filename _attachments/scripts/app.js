;(function($) {

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

        this.get('#/tag/:tag', function(context) {
            context.trigger( 'show-by-tag', { tag : this.params['tag'] } );
        });

        this.get('#/search', function(context) {
            context.trigger( 'search', {} );
        });

        this.get('#/search/query', function(context) {
            context.trigger( 'searchQuery', { params :  this.params } );
        });

        this.get('#/new/:doctype', function(context) {
            context.trigger( 'new-item', { doctype : this.params['doctype'] } );
        });

        this.get('#/citations', function(context) {
            context.trigger( 'show-citation-editor', {} );
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

                // and now some db maintenance:
//                app.db.compact();
//                app.db.viewCleanup();
//                app.db.compactView();
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
                    $("button, input:submit, input:file").button();
                } else {
                    self.alertDialog( self.mustache( app.ddoc.templates.messagedialog, { message : "Unbekannter Typ!" } ) );
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

                        // update the ui
                        $("#content").append( self.mustache( app.ddoc.templates.itemdetails, doc ) );
                        $("#itemDetails").tabs();
                        $("button, input:submit, input:file").button();

                        // bind the form to the document
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

                        // activate the delete button
                        $("#deleteDoc").bind( 'click', function() {
                            self.alertDialog( self.mustache( app.ddoc.templates.messagedialog, { message : "Eintrag wirklich löschen?" } ), {
                                buttons : {
                                    Ok : function() {
                                        app.db.removeDoc( { _id : doc._id, _rev : doc._rev } );
                                        $("#content").empty();
                                        self.redirect( "#/newest" );
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
                                self.alertDialog( self.mustache( app.ddoc.templates.messagedialog, { message : "Bitte eine Datei zum Speichen auswählen!" } ));
                                return;
                            }

                            var docUrl = [app.db.uri, data._id].join('/');
                            $(this).ajaxSubmit({
                                url: docUrl,
                                success: function(resp) {
                                    self.alertDialog( self.mustache( app.ddoc.templates.messagedialog, { message : "Anhang hinzugefügt!" } ) );
                                    self.trigger( "show-item-details", { docid:data._id } );
                                }
                            });
                        });

                        // add the attachment deletion
                        $(".deleteattachments").click( function() {
                            var url = $(this).attr('name');
                            self.alertDialog( self.mustache( app.ddoc.templates.messagedialog, { message : "Eintrag wirklich löschen?" } ), {
                                buttons : {
                                    Ok : function() {
                                        $( this ).dialog( "close" );
                                        $.ajax( {
                                            type : "DELETE",
                                            url : url,
                                            success: function() {
                                                self.alertDialog( self.mustache( app.ddoc.templates.messagedialog, { message : "Wurde gelöscht" } ) );
                                                self.trigger( "show-item-details", { docid:data['docid'] } );
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

        /*
         * show all elements matching a specific tag
         */
        this.bind( 'show-by-tag', function(e,data) {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function( app ) {
                self.appendAjaxResp( app.listPath("tag-items", "tagcloud")+"?reduce=false&include_docs=true&key=%22"+data.tag+"%22", "#content" );
            });
        });

        /*
         * all the search handling
         */
        this.bind( 'search', function(e,data) {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function(app) {
                $("#content").append(app.ddoc.templates.search);
                $("button, input:submit, input:file").button();
            });
        });

        this.bind( 'searchQuery', function(e,data) {
            $("#content").empty();
            var self = this;
            self.withCouchApp( function(app) {
                $("#content").append(app.ddoc.templates.search);
                $("button, input:submit, input:file").button();

                var query = "", options="&limit=10"; // &include_docs=true

                if(data.params.author && data.params.author.length > 0) {
                    query += "author:("+data.params.author+") ";
                    $("#search_form [name=author]").val( data.params.author );
                }
                if(data.params.tags && data.params.tags.length > 0) {
                    query += "tags:("+data.params.tags+") ";
                    $("#search_form [name=tags]").val( data.params.tags );
                }
                if(data.params.title && data.params.title.length > 0) {
                    query += "title:("+data.params.title+")";
                    $("#search_form [name=title]").val( data.params.title );
                }
                if(data.params.skip && data.params.skip.length > 0 ) {
                    options += "&skip="+data.params.skip;
                }

                var url = "/"+app.db.name+"/_fti/_design/couchbib/shelf?q="+query+options;
                $.ajax( {
                    type : "GET",
                    dataType : "json",
                    url : url,
                    success : function( resp ) {
                        var results = [], idx = 0;

                        if( resp.rows && resp.rows.length > 0 ) {
                            // we have results
                            resp.rows.map( function( row ) {
                                if( typeof( row.fields.author ) === "object" ) {
                                    $("#search_results").append( self.mustache( app.ddoc.templates.newestItems,
                                        { docid : row.id, title : row.fields.title, author : row.fields.author.join( '; ' ) } ) );
                                } else {
                                    $("#search_results").append( self.mustache( app.ddoc.templates.newestItems,
                                        { docid : row.id, title : row.fields.title, author : row.fields.author } ) );
                                }
                                idx++;
                            });

                            if( resp.total_rows > 10 ) {
                                var paging = {
                                    baseurl : "#/search/query?author="+data.params.author+"&title="+data.params.title+"&"
                                        + "tags="+data.params.tags,
                                    next : false,
                                    previous : false
                                };
                                if( resp.skip > 0 ) {
                                    // show the prev button
                                    paging.previous = "&skip="+(resp.skip - 10);
                                }
                                if( resp.skip < resp.total_rows - 10 ) {
                                    // show the next button
                                    paging.next = "&skip="+(resp.skip + 10);
                                }
                                $("#search_paging").append( self.mustache( app.ddoc.templates.searchResultPaging, paging ) );
                            }
                        }
                    },
                    error : function( xhr, msg, e ) {
                        self.alertDialog( self.mustache( app.ddoc.templates.messagedialog, { message : msg } ) );
                    }
                });
            });
        });


        /**
         * The citation editor.
         */
        this.bind( 'show-citation-editor', function() {
        });

    });

    $(function() {
        app.run('#/')
    });
})(jQuery);
