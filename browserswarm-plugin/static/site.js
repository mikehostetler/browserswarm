$(function(){

	// Show responsive menu when nav trigger is clicked (applied below 760)
	$("#navtrigger").on("click", function(){
		$(this).siblings(".navwrap").toggleClass("open");
	});
	$(".navwrap").on("click", function(){
		$(this).removeClass("open");
	});

	$(".scroll").click(function(event){

		// Find element matching anchors hash
		var hash = $(this).prop("hash")
		  , trgt = $(hash);

		// If an element has been found
		if ( trgt.length ) {

			// Prevent the click from redirecting us
			event.preventDefault();

			// Instead, scroll that element into view
			$("html, body").animate({
				scrollTop: trgt.offset().top - 75
			}, "slow");

		}

	});

});

