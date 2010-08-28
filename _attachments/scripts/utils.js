
// function called when an attachment should be deleted
function deleteAttachment( url ) {
    if( confirm("Wirklich löschen?") ) {
        $.ajax( {
            type : "DELETE",
            url : url,
            success: function() {
                alert('Wurde gelöscht');
                window.location.reload();
            }
        });
    }
}
