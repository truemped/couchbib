;(function($) {
  var app = $.sammy(function() {
      
    this.get('#/', function() {
      $('#main').text('');
    });

    this.get('#/test', function() {
      $('#main').text('Hello World');
    });
    
  });

  $(function() {
    app.run()
  });
})(jQuery);
