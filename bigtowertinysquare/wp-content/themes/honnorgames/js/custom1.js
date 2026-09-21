$('document').ready(function () {
    $('#js-player-start').click(function(e) {
         e.preventDefault();
         $('.player-overlay').css("display","none");
         $('.btn-fullscreen').css("visibility","visible");
         $('.game-offer__window__frame').css("display","block");
         $('.game-offer__window__frame').append($(this).data('code'));

    });
   // menu
	$('.hamburger').on('click', function(){
        $(this).toggleClass('open');
		$('.menu').toggleClass('open');
		//$('.overflow').fadeToggle();
		var header_height = $('.header').height();
		var menu_height = $('.menu.open').height();
		var heigh_top = header_height + menu_height + 20 + 'px';
		//$('.sidebar').toggleClass('open').css("top", heigh_top);
    });
    $('.mobil_menu').on('click', function(){
        if ($('.sidebar').hasClass('open')){
        $('.sidebar').removeClass('open');    
        } else {
        $('.sidebar').addClass('open');
      }
    });
	// search 
    $('.search_icon').on('click', function(){
        $('.flying_search').toggleClass('open');
    });
    $('.close').on('click', function(){
        $('.flying_search').removeClass('open');
    });
	// tooltip
    var title;
    $(".tooltip a").hover(
        function () {
            $(this).append('<div class="box">' + $(this).attr("title") + "</div>");
            title = $(this).attr("title");
            $(this).attr("title", ""), $(this).find("img").attr("title", ""), $(this).find("img").attr("alt", "");
            var t = $(".box").width() - 32;
            (t = (-1 * t) / 2), $(".box").css("left", t);
        },
        function () {
            $(this).find(".box").remove();
            $(this).attr("title", title);
            $(this).find("img").attr("title", "");
            $(this).find("img").attr("alt", "");
        }
    );
	// fullscreen
	$('body').on('click', '.btn-fullscreen', function() {
        $('.game-offer__window__frame').addClass('fullscreen').fullscreen();
        $('.exitfullscreen').removeAttr('style');
        return false;
    });
	// exit fullscreen
	$('body').on('click', '.exitfullscreen', function() {
		$(this).css('display', 'none');
		$.fullscreen.exit();
		$('.game .game__player__content').removeClass('fullscreen');
		return false;
	});
	// document's event
	$(document).bind('fscreenchange', function(e, state, elem) {
		// if we currently in fullscreen mode
		if ($.fullscreen.isFullScreen()) {
			$('#fullscreen .requestfullscreen').hide();
			$('#fullscreen .exitfullscreen').show();
		} else {
			$('#fullscreen .requestfullscreen').show();
			$('#fullscreen .exitfullscreen').hide();
		}
		$('#state').text($.fullscreen.isFullScreen() ? '' : 'not');
	});
	// Карусель		
  $("#owl-carousel").owlCarousel({
    nav: true,
    loop:true,
    margin:20,
    responsiveClass:true,
    responsive:{
        0:{
            items:1
        },
        480:{
            items:2
        },
        992:{
            items:3
        },
        1200:{
            items:4
        }
    }
  });
   $("#owl-carousel2").owlCarousel({
    nav: true,
    loop:true,
    margin:20,
    responsiveClass:true,
    responsive:{
        0:{
            items:1
        },
        480:{
            items:2
        },
        992:{
            items:3
        },
        1200:{
            items:4
        }
    }
  });

   
$('.hide_content').on('click', function(){
    $('.all_categorys').css('display', 'none');
    $('.all_categorys_footer').css('display', 'none');
    $('.top_games').css('display', 'none');
    $('.hide_content').css('display', 'none');
    $('.show_content').css('display', 'block');
    $('.main').css('margin-top', '0px');
}); 


$('.show_content').on('click', function(){
    $('.all_categorys').css('display', 'block');
    $('.all_categorys_footer').css('display', 'block');
    $('.top_games').css('display', 'block');
    $('.show_content').css('display', 'none');
    $('.hide_content').css('display', 'block');
    $('.main').css('margin-top', '367px');
}); 

$('.popular-game__title').on('click', function(){
if (screen.width < 481) {
$('.single .popular-game__list').css('display', 'flex');

}


});

});