$(window).on('scroll', function () {
    var $this = $(this),
        $header = $('.header');
    if ($this.scrollTop() > 1) {
        $header.addClass('scroll-nav');
    } else {
        $header.removeClass('scroll-nav');
    }
});


$(function () {
    $('.service-item[data-video]').on('mouseenter', function () {
        const $item = $(this);
        const $media = $item.find('.service-item__media');
        const videoSrc = $item.data('video');

        if (!videoSrc || $media.find('video').length) {
            return;
        }

        const video = document.createElement('video');

        video.src = videoSrc;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';

        $media.append(video);

        video.addEventListener('loadeddata', function () {
            $(video).addClass('is-visible');
            $media.addClass('is-active');
        }, {
            once: true
        });

        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.catch(function () {
                $(video).remove();
            });
        }
    });

    $('.service-item[data-video]').on('mouseleave', function () {
        const $video = $(this).find('.service-item__media video');

        if (!$video.length) {
            return;
        }
        const $item = $(this);
        const $media = $item.find('.service-item__media');

        const video = $video.get(0);

        $video.removeClass('is-visible');
        $media.removeClass('is-active');
        setTimeout(function () {
            video.pause();
            $video.remove();
        }, 400);
    });
});
$(function () {
    $('.instagram-media[data-video]').on('mouseenter', function () {
        const $item = $(this);
        const $media = $item.find('.instagram-media__image');
        const videoSrc = $item.data('video');

        if (!videoSrc || $media.find('video').length) {
            return;
        }

        const video = document.createElement('video');

        video.src = videoSrc;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'metadata';

        $media.append(video);

        video.addEventListener('loadeddata', function () {
            $(video).addClass('is-visible');
            $media.addClass('is-active');
        }, {
            once: true
        });

        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise.catch(function () {
                $(video).remove();
            });
        }
    });

    $('.instagram-media[data-video]').on('mouseleave', function () {
        const $video = $(this).find('.instagram-media__image video');

        if (!$video.length) {
            return;
        }
        const $item = $(this);
        const $media = $item.find('.instagram-media__image');

        const video = $video.get(0);

        $video.removeClass('is-visible');
        $media.removeClass('is-active');
        setTimeout(function () {
            video.pause();
            $video.remove();
        }, 400);
    });
});


$(function () {
    const $about = $('#businesses');
    const $aboutBg = $about.find('.businesses-bg');

    if (!$about.length || !$aboutBg.length) {
        return;
    }

    function checkAboutScroll() {
        const scrollTop = $(window).scrollTop();
        const aboutTop = $about.offset().top;
        const aboutHeight = $about.outerHeight();

        const triggerPoint = aboutTop - (aboutHeight * .1);

        if (scrollTop >= triggerPoint) {
            $aboutBg.addClass('is-fade');
        } else {
            $aboutBg.removeClass('is-fade');
        }
    }

    $(window).on('scroll resize', checkAboutScroll);

    checkAboutScroll();
});

//work
jQuery(function ($) {
    $('.work').each(function () {
        const $section = $(this);
        const $wrap = $section.find('.work-wrap').first();

        if (!$wrap.length) {
            return;
        }

        const $initialRows = $wrap.children('.work-inner');

        if (!$initialRows.length) {
            return;
        }

        /*
         * Створюємо для кожного work-inner:
         *
         * .work-row
         *   .work-inner
         *   .work-controls
         */
        $initialRows.each(function () {
            const $inner = $(this);

            $inner.wrap('<div class="work-row"></div>');

            const $row = $inner.parent();

            $row.append(`
				<div class="work-controls">
					<button
						type="button"
						class="work-control _prev"
						aria-label="Previous works"
					>
						<span aria-hidden="true"><img src="../static/images/arrow-left.svg" alt=""></span>
					</button>

					<button
						type="button"
						class="work-control _next"
						aria-label="Next works"
					>
						<span aria-hidden="true"><img src="../static/images/arrow-right.svg" alt=""></span>
					</button>
				</div>
			`);
        });

        const rows = $wrap
            .find('.work-row > .work-inner')
            .toArray();

        const sourceItems = new Map();
        const rowStates = new Map();

        const hoverMedia = window.matchMedia(
            '(hover: hover) and (pointer: fine)'
        );
        const mobileMedia = window.matchMedia(
            '(max-width: 767px)'
        );
        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        );

        let currentFilter = 'all';
        let isFiltering = false;
        let lastFrameTime = performance.now();
        let resizeTimer = null;
        let animationFrame = null;

        /*
         * Зберігаємо оригінальні картки.
         * Після цього DOM можна перебудовувати.
         */
        rows.forEach(function (row) {
            const templates = Array.from(row.children)
                .filter(function (item) {
                    return item.classList.contains('work-item');
                })
                .map(function (item) {
                    return item.cloneNode(true);
                });

            sourceItems.set(row, templates);
        });

        function matchesFilter(item, filter) {
            if (filter === 'all') {
                return true;
            }

            const types = String(item.dataset.type || '')
                .toLowerCase()
                .trim()
                .split(/\s+/)
                .filter(Boolean);

            return types.includes(filter);
        }

        /*
         * Перетворює CSS gap у реальні px,
         * навіть якщо він заданий у rem.
         */
        function getGapPx() {
            const probe = document.createElement('span');

            probe.style.position = 'absolute';
            probe.style.visibility = 'hidden';
            probe.style.pointerEvents = 'none';
            probe.style.width = 'var(--work-gap)';
            probe.style.height = '0';

            $wrap.get(0).appendChild(probe);

            const width = probe.getBoundingClientRect().width;

            probe.remove();

            return width;
        }

        function getVisibleCount() {
            if (window.innerWidth <= 767) {
                return 1.15;
            }

            if (window.innerWidth <= 1024) {
                return 2;
            }

            return 3;
        }

        function setItemWidth(row, gap) {
            const rowWrap = row.closest('.work-row');

            if (!rowWrap) {
                return;
            }

            const styles = window.getComputedStyle(rowWrap);

            const visibleItems = parseFloat(
                styles.getPropertyValue('--work-visible-items')
            ) || 4;

            const viewportWidth = rowWrap.clientWidth;

            const itemWidth =
                (
                    viewportWidth -
                    gap * (visibleItems - 1)
                ) / visibleItems;

            row.style.setProperty(
                '--work-item-width',
                `${itemWidth}px`
            );
        }

        function cancelManualAnimation(state) {
            if (!state) {
                return;
            }

            if (state.manualRaf) {
                cancelAnimationFrame(state.manualRaf);
            }

            if (state.resumeTimer) {
                clearTimeout(state.resumeTimer);
            }

            state.manualRaf = null;
            state.resumeTimer = null;
            state.isManualAnimating = false;
        }

        function stopRowVideos(row) {
            row.querySelectorAll('video').forEach(function (video) {
                video.pause();
            });
        }

        function createGroup(row, templates, targetWidth) {
            const group = document.createElement('div');

            group.className = 'work-group';

            row.appendChild(group);

            if (!templates.length) {
                return group;
            }

            /*
             * Спочатку обов'язково додаємо всі картки.
             */
            templates.forEach(function (template) {
                group.appendChild(template.cloneNode(true));
            });

            /*
             * Якщо після фільтрації карток мало,
             * дублюємо їх, доки група не перекриє viewport.
             */
            let index = 0;
            let safetyCounter = 0;

            while (
                group.scrollWidth < targetWidth &&
                safetyCounter < 200
                ) {
                const template = templates[index % templates.length];

                group.appendChild(template.cloneNode(true));

                index++;
                safetyCounter++;
            }

            return group;
        }

        function getPhase(state) {
            if (
                !state ||
                !state.groupWidth
            ) {
                return 0;
            }

            const width = state.groupWidth;

            return (
                (
                    (-state.offset % width) +
                    width
                ) % width
            ) / width;
        }

        function buildRow(
            row,
            filter,
            gap,
            preservePhase
        ) {
            const oldState = rowStates.get(row);
            const oldPhase = preservePhase
                ? getPhase(oldState)
                : 0;

            const rowWrap = row.closest('.work-row');

            cancelManualAnimation(oldState);
            stopRowVideos(row);

            const templates = sourceItems
                .get(row)
                .filter(function (item) {
                    return matchesFilter(item, filter);
                });

            row.innerHTML = '';

            rowWrap.classList.toggle(
                'is-empty',
                !templates.length
            );

            if (!templates.length) {
                row.style.transform = '';

                rowStates.set(row, {
                    row: row,
                    groupWidth: 0,
                    offset: 0,
                    direction: -1,
                    speed: 0,
                    paused: true,
                    hovered: false,
                    inView: oldState
                        ? oldState.inView
                        : true,
                    isManualAnimating: false,
                    manualRaf: null,
                    resumeTimer: null
                });

                return;
            }

            const itemWidth = parseFloat(
                window
                    .getComputedStyle(row)
                    .getPropertyValue('--work-item-width')
            ) || rowWrap.clientWidth / 3;

            const targetWidth =
                rowWrap.clientWidth +
                itemWidth +
                gap;

            const firstGroup = createGroup(
                row,
                templates,
                targetWidth
            );

            const secondGroup =
                firstGroup.cloneNode(true);

            row.appendChild(secondGroup);

            const groupWidth =
                firstGroup.getBoundingClientRect().width;

            const direction =
                row.classList.contains('_right')
                    ? 1
                    : -1;

            const speed =
                Number(row.dataset.speed) || 40;

            const hovered =
                !mobileMedia.matches &&
                hoverMedia.matches &&
                rowWrap.matches(':hover');

            let offset;

            if (preservePhase && oldState) {
                offset = -groupWidth * oldPhase;
            } else {
                offset = direction > 0
                    ? -groupWidth
                    : 0;
            }

            const state = {
                row: row,
                groupWidth: groupWidth,
                offset: offset,
                direction: direction,
                speed: speed,
                paused: hovered,
                hovered: hovered,
                inView: oldState
                    ? oldState.inView
                    : true,
                isManualAnimating: false,
                manualRaf: null,
                resumeTimer: null
            };

            rowStates.set(row, state);

            rowWrap.classList.toggle(
                'is-paused',
                hovered
            );

            row.style.transform =
                `translate3d(${offset}px, 0, 0)`;
        }

        function rebuildRows(filter, preservePhase) {
            const gap = getGapPx();

            rows.forEach(function (row) {
                setItemWidth(row, gap);

                buildRow(
                    row,
                    filter,
                    gap,
                    preservePhase
                );
            });
        }

        function normalizeOffset(value, groupWidth) {
            if (!groupWidth) {
                return value;
            }

            while (value <= -groupWidth) {
                value += groupWidth;
            }

            while (value > 0) {
                value -= groupWidth;
            }

            return value;
        }

        function renderRow(state) {
            state.row.style.transform =
                `translate3d(${state.offset}px, 0, 0)`;
        }

        function animateRows(currentTime) {
            const delta = Math.min(
                (currentTime - lastFrameTime) / 1000,
                0.05
            );

            lastFrameTime = currentTime;

            if (
                !document.hidden &&
                !reducedMotion.matches
            ) {
                rowStates.forEach(function (state) {
                    if (
                        state.paused ||
                        state.isManualAnimating ||
                        !state.inView ||
                        !state.groupWidth ||
                        !state.speed
                    ) {
                        return;
                    }

                    state.offset +=
                        state.direction *
                        state.speed *
                        delta;

                    state.offset = normalizeOffset(
                        state.offset,
                        state.groupWidth
                    );

                    renderRow(state);
                });
            }

            animationFrame =
                requestAnimationFrame(animateRows);
        }

        function getManualStep(row) {
            const item = row.querySelector(
                '.work-group:first-child .work-item'
            );

            const group = row.querySelector(
                '.work-group:first-child'
            );

            if (!item || !group) {
                return 0;
            }

            const groupStyles =
                window.getComputedStyle(group);

            const gap = parseFloat(
                groupStyles.columnGap ||
                groupStyles.gap
            ) || 0;

            return (
                item.getBoundingClientRect().width +
                gap
            );
        }

        function easeOutCubic(progress) {
            return 1 - Math.pow(1 - progress, 3);
        }

        function moveRowManually(row, direction) {
            const state = rowStates.get(row);

            if (
                isFiltering ||
                !state ||
                !state.groupWidth ||
                state.isManualAnimating
            ) {
                return;
            }

            const step = getManualStep(row);

            if (!step) {
                return;
            }

            cancelManualAnimation(state);

            state.paused = true;
            state.isManualAnimating = true;

            const startOffset = state.offset;
            const targetOffset =
                startOffset + step * direction;

            const duration =
                reducedMotion.matches ? 0 : 520;

            if (!duration) {
                state.offset = normalizeOffset(
                    targetOffset,
                    state.groupWidth
                );

                renderRow(state);

                state.isManualAnimating = false;
                state.paused = state.hovered;

                return;
            }

            const startTime = performance.now();

            function manualFrame(currentTime) {
                const progress = Math.min(
                    (currentTime - startTime) /
                    duration,
                    1
                );

                const eased = easeOutCubic(progress);

                const currentOffset =
                    startOffset +
                    (
                        targetOffset -
                        startOffset
                    ) *
                    eased;

                state.offset = normalizeOffset(
                    currentOffset,
                    state.groupWidth
                );

                renderRow(state);

                if (progress < 1) {
                    state.manualRaf =
                        requestAnimationFrame(
                            manualFrame
                        );

                    return;
                }

                state.manualRaf = null;
                state.isManualAnimating = false;

                if (mobileMedia.matches) {
                    /*
                     * На мобільному після тапу рядок ще трохи
                     * стоїть на місці, щоб картка не втекла.
                     */
                    state.paused = true;

                    if (state.resumeTimer) {
                        clearTimeout(state.resumeTimer);
                    }

                    state.resumeTimer = setTimeout(function () {
                        state.paused = false;
                        state.resumeTimer = null;
                    }, 1200);
                } else {
                    /*
                     * На десктопі рух відновиться,
                     * коли курсор залишить рядок.
                     */
                    state.paused = state.hovered;
                }
            }

            state.manualRaf =
                requestAnimationFrame(manualFrame);
        }

        /*
         * Pause при наведенні на весь рядок.
         */
        $wrap.on(
            'mouseenter',
            '.work-row',
            function () {
                if (!hoverMedia.matches) {
                    return;
                }

                const row = $(this)
                    .children('.work-inner')
                    .get(0);

                const state = rowStates.get(row);

                if (!state) {
                    return;
                }

                state.hovered = true;
                state.paused = true;

                $(this).addClass('is-paused');
            }
        );

        $wrap.on(
            'mouseleave',
            '.work-row',
            function () {
                if (!hoverMedia.matches) {
                    return;
                }

                const row = $(this)
                    .children('.work-inner')
                    .get(0);

                const state = rowStates.get(row);

                if (!state) {
                    return;
                }

                state.hovered = false;

                $(this).removeClass('is-paused');

                if (!state.isManualAnimating) {
                    state.paused = false;
                }
            }
        );

        /*
         * Ручне перемикання.
         *
         * Previous — контент рухається вправо.
         * Next — контент рухається вліво.
         */
        $wrap.on(
            'click',
            '.work-control',
            function (event) {
                event.preventDefault();
                event.stopPropagation();

                const $button = $(this);

                const row = $button
                    .closest('.work-row')
                    .children('.work-inner')
                    .get(0);

                if (!row) {
                    return;
                }

                const direction =
                    $button.hasClass('_prev')
                        ? 1
                        : -1;

                moveRowManually(row, direction);
            }
        );

        function createVideo(item) {
            const $item = $(item);

            const src = String(
                $item.attr('data-video') || ''
            ).trim();

            if (!src) {
                return;
            }

            const oldTimer =
                $item.data('video-remove-timer');

            if (oldTimer) {
                clearTimeout(oldTimer);

                $item.removeData(
                    'video-remove-timer'
                );
            }

            let video =
                item.querySelector('video');

            if (video) {
                $item.addClass('is-video-active');

                const promise = video.play();

                if (promise) {
                    promise.catch(function () {});
                }

                return;
            }

            video = document.createElement('video');

            video.src = src;
            video.autoplay = true;
            video.loop = true;
            video.muted = true;
            video.defaultMuted = true;
            video.playsInline = true;
            video.preload = 'metadata';

            video.setAttribute('muted', '');
            video.setAttribute('playsinline', '');
            video.setAttribute(
                'webkit-playsinline',
                ''
            );

            item.appendChild(video);

            const showVideo = function () {
                $item.addClass(
                    'is-video-active'
                );
            };

            if (video.readyState >= 3) {
                showVideo();
            } else {
                video.addEventListener(
                    'canplay',
                    showVideo,
                    { once: true }
                );
            }

            const playPromise = video.play();

            if (playPromise) {
                playPromise.catch(function () {
                    video.remove();

                    $item.removeClass(
                        'is-video-active'
                    );
                });
            }
        }

        function removeVideo(item) {
            const $item = $(item);
            const video =
                item.querySelector('video');

            if (!video) {
                return;
            }

            $item.removeClass('is-video-active');

            const timer = setTimeout(function () {
                video.pause();
                video.remove();

                $item.removeData(
                    'video-remove-timer'
                );
            }, 450);

            $item.data(
                'video-remove-timer',
                timer
            );
        }

        /*
         * Відео тільки на пристроях із hover.
         */
        $wrap.on(
            'mouseenter',
            '.work-item[data-video]',
            function () {
                if (!hoverMedia.matches) {
                    return;
                }

                createVideo(this);
            }
        );

        $wrap.on(
            'mouseleave',
            '.work-item[data-video]',
            function () {
                if (!hoverMedia.matches) {
                    return;
                }

                removeVideo(this);
            }
        );

        /*
         * Фільтрація.
         */
        $section
            .find('.work-filter .sort-btn')
            .on('click', function () {
                const $button = $(this);

                if (
                    isFiltering ||
                    $button.hasClass('is-active')
                ) {
                    return;
                }

                const filter = String(
                    $button.data('filter') || 'all'
                )
                    .toLowerCase()
                    .trim();

                isFiltering = true;

                $section
                    .find(
                        '.work-filter .sort-btn'
                    )
                    .removeClass('is-active');

                $button.addClass('is-active');

                rows.forEach(function (row) {
                    const state =
                        rowStates.get(row);

                    if (state) {
                        cancelManualAnimation(state);
                        state.paused = true;
                    }

                    row
                        .closest('.work-row')
                        .classList
                        .add('is-changing');
                });

                setTimeout(function () {
                    rebuildRows(filter, false);

                    requestAnimationFrame(function () {
                        requestAnimationFrame(
                            function () {
                                rows.forEach(
                                    function (row) {
                                        row
                                            .closest(
                                                '.work-row'
                                            )
                                            .classList
                                            .remove(
                                                'is-changing'
                                            );
                                    }
                                );
                            }
                        );
                    });

                    setTimeout(function () {
                        currentFilter = filter;
                        isFiltering = false;

                        rowStates.forEach(
                            function (state) {
                                state.paused =
                                    state.hovered;
                            }
                        );

                        if (
                            typeof AOS !==
                            'undefined'
                        ) {
                            AOS.refreshHard();
                        }
                    }, 350);
                }, 280);
            });

        /*
         * Не анімуємо рядки за межами екрана.
         */
        if ('IntersectionObserver' in window) {
            const observer =
                new IntersectionObserver(
                    function (entries) {
                        entries.forEach(
                            function (entry) {
                                const row =
                                    entry.target
                                        .querySelector(
                                            '.work-inner'
                                        );

                                const state =
                                    rowStates.get(row);

                                if (state) {
                                    state.inView =
                                        entry.isIntersecting;
                                }
                            }
                        );
                    },
                    {
                        rootMargin:
                            '150px 0px 150px 0px'
                    }
                );

            $wrap
                .find('.work-row')
                .each(function () {
                    observer.observe(this);
                });
        }

        /*
         * Resize зберігає приблизну поточну
         * позицію кожного рядка.
         */
        $(window).on(
            'resize orientationchange',
            function () {
                clearTimeout(resizeTimer);

                resizeTimer = setTimeout(
                    function () {
                        rebuildRows(
                            currentFilter,
                            true
                        );
                    },
                    180
                );
            }
        );

        document.addEventListener(
            'visibilitychange',
            function () {
                lastFrameTime =
                    performance.now();
            }
        );

        rebuildRows(currentFilter, false);

        animationFrame =
            requestAnimationFrame(animateRows);
    });
});

//work
function initHeaderMenu() {
    const $header = $('.header');
    const $burger = $('.header-burger');
    const $overlay = $('.header-overlay');

    if (!$header.length || !$burger.length) {
        return;
    }

    function closeMenu() {
        $header.removeClass('active');
        $('body').removeClass('menu-open');
    }

    function openMenu() {
        $header.addClass('active');
        $('body').addClass('menu-open');
    }

    $burger.on('click', function () {
        if ($header.hasClass('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    $overlay.on('click', function () {
        closeMenu();
    });

    $(document).on('keyup', function (e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}

function initSmoothScroll() {
    $('[data-scroll]').on('click', function (e) {
        const targetId = $(this).data('scroll');
        const $target = $('#' + targetId);

        if (!$target.length) {
            return;
        }

        e.preventDefault();

        const headerHeight = $('.header').outerHeight() || 0;
        const targetTop = $target.offset().top - headerHeight + 1;

        $('html, body').animate({
            scrollTop: targetTop
        }, 600);

        $('.header').removeClass('active');
        $('body').removeClass('menu-open');
    });
}

$(document).ready(function () {
    initHeaderMenu();
    initSmoothScroll();
});
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({

        once: true,
    });
    requestAnimationFrame(() => AOS.refresh());
    setTimeout(() => AOS.refresh(), 200);
});
function initAppointmentForm() {
    const $forms = $('.js-appointment-form');

    if (!$forms.length || typeof PAR_AJAX === 'undefined') {
        return;
    }

    $forms.each(function () {
        const $form = $(this);
        const $message = $form.find('.js-form-message');
        const $submit = $form.find('[type="submit"]');

        $form.on('submit', function (e) {
            e.preventDefault();

            $message
                .removeClass('contact-form__message--success contact-form__message--error')
                .prop('hidden', true)
                .text('');

            $submit.prop('disabled', true);
            $form.addClass('is-loading');

            $.ajax({
                url: PAR_AJAX.ajax_url,
                type: 'POST',
                dataType: 'json',
                data: $form.serialize(),
                success: function (response) {
                    const isSuccess = response && response.success;
                    const text = response && response.data && response.data.message
                        ? response.data.message
                        : 'Something went wrong. Please try again.';

                    $message
                        .addClass(isSuccess ? 'contact-form__message--success' : 'contact-form__message--error')
                        .prop('hidden', false)
                        .text(text);

                    if (isSuccess) {
                        $form[0].reset();
                    }
                },
                error: function () {
                    $message
                        .addClass('contact-form__message--error')
                        .prop('hidden', false)
                        .text('Something went wrong. Please try again.');
                },
                complete: function () {
                    $submit.prop('disabled', false);
                    $form.removeClass('is-loading');
                }
            });
        });
    });
}
