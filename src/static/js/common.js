$(window).on('scroll', function () {
    var $this = $(this),
        $header = $('.header');
    if ($this.scrollTop() > 1) {
        $header.addClass('scroll-nav');
    } else {
        $header.removeClass('scroll-nav');
    }
});


$('.reviews-slider').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    infinite: true,
    arrows: true,
    prevArrow: $('.reviews .slide-prev'),
    nextArrow: $('.reviews .slide-next'),
    responsive: [
        {
            breakpoint: 769,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1
            }
        },
        {
            breakpoint: 460,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    ]
});
$('[data-scroll]').on('click', function (e) {
    e.preventDefault();

    const targetId = $(this).data('scroll');
    const $target = $('#' + targetId);

    if ($target.length) {
        $('html, body').animate({
            scrollTop: $target.offset().top - $('.header').outerHeight()
        }, 600);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        disable: 'mobile',
        once: true,
    });
    requestAnimationFrame(() => AOS.refresh());
    setTimeout(() => AOS.refresh(), 200);
});