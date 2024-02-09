var navbarHeight = $('header').height();

$(window).load(function () {
    "use strict";
    // makes sure the whole site is loaded
    $('#status').fadeOut(); // will first fade out the loading animation
    $('#preloader').delay(350).fadeOut('slow'); // will fade out the white DIV that covers the website.
    $('body').delay(350).css({
        'overflow': 'visible'
    });
})

$(document).ready(function () {
    "use strict";

    $('div.portfolio-padding').css("padding-top", navbarHeight+50);


    // Menu opacity
    if ($(window).scrollTop() > 80) {
        $(".navbar-fixed-top").addClass("scroll-nav");
    } else {
        $(".navbar-fixed-top").removeClass("scroll-nav");
    }
    $(window).scroll(function () {
        if ($(window).scrollTop() > 80) {
            $(".navbar-fixed-top").addClass("scroll-nav");
          $('.logotext').css( "transform", "translate(0, 1px)" );
          $('.logotext').css( "opacity", "1" );
          // $('#logoicon').css( "display", "none" );
        } else {
            $(".navbar-fixed-top").removeClass("scroll-nav");
                        $('.logotext').css( "opacity", "0" );
          $('.logotext').css( "transform", "translate(0, 10px)" );
                    // $('#logoicon').css( "display", "block" );

        }
    });





// AOS
    AOS.init({
        duration: 1200,
        once: true,
        disable: 'mobile'
    });

})


// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('header').height();

$(window).scroll(function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;
    
    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('header').removeClass('nav-down').addClass('nav-up');
        $('header.nav-up').css( "top", navbarHeight*-1 );

    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $('header').removeClass('nav-up').addClass('nav-down');
             $('header').css( "top", "" );
 

        }
    }
    
    lastScrollTop = st;
}