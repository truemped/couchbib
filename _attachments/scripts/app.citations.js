(function($) {

    Sammy = Sammy || {};

    Sammy.CouchBibCitations = function( app ) {

        var showCitationEditor = function( couchapp, context ) {

            var updateFieldHelp = function( type ) {
                $("#availableCitationFields").empty();
                var types = [];
                for( var idx in couchapp.ddoc.types[ type ].fields ) {
                    var fieldId = couchapp.ddoc.types[type].fields[idx];
                    types.push( { typeid : fieldId, typename : couchapp.ddoc.fieldnames[ fieldId ] } );
                }
                $("#availableCitationFields").append( context.mustache( couchapp.ddoc.templates.availableCitationFields, { types : types } ) );
            }

            var updateUi = function( doc ) {
                $("#typeselector option:selected").each( function() {
                    var selectedType = $(this).val();
                    updateFieldHelp( selectedType );
                    if( doc.types[ selectedType ] ) {
                        $("#citationeditor #citationformat").val( doc.types[ selectedType ] );
                        $("#citationeditor #bibliographyformat").val( doc.bibliography[ selectedType ] );
                    }else {
                        $("#citationeditor #citationformat").val( "<b>{{author}}</b> {{year}}, <i>{{title}}</i>" );
                        $("#citationeditor #bibliographyformat").val( "<b>{{author}}</b> {{year}}, <i>{{title}}</i>" );
                    }
                });
            }

            var showEditor = function( doc ) {

                var data = { types : [] };
                // prepare the typeselector
                for( var idx in couchapp.ddoc.types ) {
                    data.types.push( { type : idx, name : couchapp.ddoc.types[idx].name } );
                }
                $("#content").append( context.mustache( couchapp.ddoc.templates.citationEditor, data ) );
                $("#typeselector option:first").attr( 'selected', true );

                $("button").button();
                $("#savecitation").bind( 'click', function() {
                    $("#typeselector option:selected").each( function() {
                        doc.types[ $(this).val() ] = $("#citationeditor #citationformat").val();
                        doc.bibliography[ $(this).val() ] = $("#citationeditor #bibliographyformat").val();
                        couchapp.db.saveDoc( doc );
                    });
                });

                $("#typeselector").bind( 'change', function() {
                    updateUi( doc );
                });
                updateUi( doc );
            }

            couchapp.db.openDoc( "citationformats", {
                success : function( doc ) {
                    showEditor( doc );
                },
                error : function() {
                    // the document was not found. create a new one
                    var doc = { _id : "citationformats", types : {}, bibliography : {} };
                    showEditor( doc );
                }
            });
        }

        /**
         * The citation editor.
         */
        this.bind( 'show-citation-editor', function() {
            $("#content").empty();
            var self = this;
            this.withCouchApp( function( couchapp ) {
                showCitationEditor( couchapp, self );
            });
        });
    }

})(jQuery);
