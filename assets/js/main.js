/**
 * 裕荣机电（大连）有限公司 - 前台交互脚本
 * Yu Rong Mechanical and Electrical (Dalian) Co., Ltd.
 */

document.addEventListener('DOMContentLoaded', function() {

  // --- Hamburger Menu ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  function setMenuState(isOpen) {
    if (!hamburger || !navLinks) return;
    hamburger.classList.toggle('active', isOpen);
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function() {
      setMenuState(!hamburger.classList.contains('active'));
    });
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
      setMenuState(false);
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && hamburger && hamburger.classList.contains('active')) {
      setMenuState(false);
      hamburger.focus();
    }
  });

  window.addEventListener('resize', function() {
    if (window.innerWidth > 900) setMenuState(false);
  });

  // --- Header scroll effect ---
  const header = document.querySelector('.site-header');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateHeader);
  updateHeader();

  // --- Scroll to Top Button ---
  const scrollTopBtn = document.querySelector('.scroll-top');

  if (scrollTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- Active nav link based on current page ---
  function highlightCurrentNav() {
    var path = window.location.pathname;
    var page = document.body.dataset.navPage || path.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a').forEach(function(link) {
      var href = link.getAttribute('href');
      link.classList.remove('active');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  highlightCurrentNav();

  // --- Counter animation ---
  function animateCounters() {
    var counters = document.querySelectorAll('.stat-num[data-target]');
    if (counters.length === 0) return;

    var animated = false;
    var section = counters[0].closest('.section, .about-story');

    function runCounters() {
      if (animated) return;
      var rect = section ? section.getBoundingClientRect() : { top: 0 };
      if (rect.top < window.innerHeight * 0.75) {
        animated = true;
        counters.forEach(function(counter) {
          var target = parseInt(counter.getAttribute('data-target'));
          var duration = 2000;
          var startTime = null;

          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            // Ease out
            progress = 1 - Math.pow(1 - progress, 3);
            var suffix = counter.getAttribute('data-suffix') || '';
            counter.textContent = Math.floor(progress * target) + suffix;
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              counter.textContent = target + suffix;
            }
          }
          requestAnimationFrame(step);
        });
      }
    }

    window.addEventListener('scroll', runCounters);
    runCounters(); // Check on load
  }
  animateCounters();

  // --- Partners Carousel ---
  initPartnersCarousel();

  // --- Image Lightbox ---
  initLightbox();

});

/**
 * Initialize partners carousel: infinite horizontal auto-scrolling logo slider.
 *
 * Key design decisions:
 * - Slide widths are set in JS (px) so that the computed flex-basis matches our
 *   transform offsets exactly — avoids the circular-dependency issue of CSS
 *   percentage-based flex-basis on an auto-sized flex container.
 * - Clone-based infinite looping: last N slides cloned to front, first N to end.
 * - transitionend (filtered by target + propertyName) drives wrap-around jumps.
 */
function initPartnersCarousel() {
  var carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  var track = carousel.querySelector('[data-carousel-track]');
  var viewport = carousel.querySelector('[data-carousel-viewport]');
  var prevBtn = carousel.querySelector('[data-carousel-prev]');
  var nextBtn = carousel.querySelector('[data-carousel-next]');

  var originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
  var totalReal = originalSlides.length;
  if (totalReal === 0) return;

  var visibleCount = 0;
  var slideWidth = 0;       // measured px step from one slide to the next (slide + gap)
  var realStartOffset = 0;  // px offset of originalSlides[0] from track left edge
  var currentIndex = 0;     // 0 = first real slide, totalReal-1 = last real slide
  var autoTimer = null;
  var isTransitioning = false;

  // --- Helpers ---

  function getVisibleCount() {
    var w = viewport.clientWidth;
    if (w <= 576) return 2;
    if (w <= 992) return 3;
    return 5;
  }

  /** Set explicit flex-basis (px) on every slide so JS & CSS agree on widths. */
  function applySlideWidths() {
    var gap = parseInt(getComputedStyle(track).gap) || 24;
    // Total gap space for visibleCount slides = (visibleCount-1) gaps
    var avail = viewport.clientWidth - (visibleCount - 1) * gap;
    var w = Math.floor(avail / visibleCount);
    var allSlides = track.querySelectorAll('.carousel-slide');
    allSlides.forEach(function(s) {
      s.style.flexBasis = w + 'px';
      s.style.minWidth = w + 'px';
    });
  }

  /** Measure the actual rendered step between two adjacent slides. */
  function measureDimensions() {
    var s0 = originalSlides[0];
    var s1 = originalSlides[1];
    if (!s0 || !s1) return;
    var r0 = s0.getBoundingClientRect();
    var r1 = s1.getBoundingClientRect();
    var trackLeft = track.getBoundingClientRect().left;
    slideWidth = r1.left - r0.left;
    realStartOffset = r0.left - trackLeft;
  }

  // --- Clone management ---

  function removeClones() {
    var allSlides = track.querySelectorAll('.carousel-slide');
    allSlides.forEach(function(el) {
      if (originalSlides.indexOf(el) === -1) el.remove();
    });
  }

  function buildClones() {
    removeClones();
    var n = visibleCount;
    // Prepend last n real slides
    for (var i = totalReal - n; i < totalReal; i++) {
      track.insertBefore(originalSlides[i].cloneNode(true), originalSlides[0]);
    }
    // Append first n real slides
    for (var j = 0; j < n; j++) {
      track.appendChild(originalSlides[j].cloneNode(true));
    }
  }

  // --- Positioning ---

  /** px offset for a given real-slide index (can be negative or >= totalReal for clone zones). */
  function offsetForIndex(idx) {
    return realStartOffset + idx * slideWidth;
  }

  function positionTrack(instant) {
    track.style.transition = instant ? 'none' : 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    track.style.transform = 'translateX(-' + offsetForIndex(currentIndex) + 'px)';
  }

  // --- Wrap-around via transitionend ---

  function onTransitionEnd(e) {
    if (e.target !== track) return;
    if (e.propertyName !== 'transform') return;
    isTransitioning = false;

    // Scrolled into the "after" clone zone → jump to real start
    if (currentIndex >= totalReal) {
      track.style.transition = 'none';
      currentIndex = 0;
      track.style.transform = 'translateX(-' + offsetForIndex(currentIndex) + 'px)';
      void track.offsetHeight;
    }
    // Scrolled into the "before" clone zone → jump to real end
    else if (currentIndex < 0) {
      track.style.transition = 'none';
      currentIndex = totalReal - 1;
      track.style.transform = 'translateX(-' + offsetForIndex(currentIndex) + 'px)';
      void track.offsetHeight;
    }
  }

  track.addEventListener('transitionend', onTransitionEnd);

  // --- Navigation ---

  function goNext() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    positionTrack(false);
  }

  function goPrev() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    positionTrack(false);
  }

  // --- Auto-play ---

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(goNext, 3500);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // --- Resize rebuild ---

  function recalc() {
    stopAuto();
    isTransitioning = false;

    visibleCount = getVisibleCount();
    applySlideWidths();
    buildClones();

    // Force layout, then re-measure
    track.style.transition = 'none';
    track.style.transform = 'translateX(0)';
    void track.offsetHeight;
    measureDimensions();

    currentIndex = 0;
    positionTrack(true);
    startAuto();
  }

  // --- Button events ---

  prevBtn.addEventListener('click', function() {
    stopAuto();
    goPrev();
    startAuto();
  });
  nextBtn.addEventListener('click', function() {
    stopAuto();
    goNext();
    startAuto();
  });

  // --- Hover pause ---

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // --- Touch swipe ---

  var touchStartX = 0;
  viewport.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  viewport.addEventListener('touchend', function(e) {
    var touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      stopAuto();
      if (diff > 0) goNext();
      else goPrev();
      startAuto();
    }
  }, { passive: true });

  // --- Resize ---

  var resizeDebounce;
  window.addEventListener('resize', function() {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(recalc, 150);
  });

  // --- Init ---

  visibleCount = getVisibleCount();
  applySlideWidths();
  buildClones();

  // Force a clean layout, then measure actual DOM positions
  track.style.transition = 'none';
  track.style.transform = 'translateX(0)';
  void track.offsetHeight;
  measureDimensions();

  currentIndex = 0;  // first real slide
  positionTrack(true);
  startAuto();
}

/**
 * Initialize lightbox: all images marked with data-lightbox attribute
 * are clickable to view in a full-screen overlay.
 */
function initLightbox() {
  // Collect all lightbox-eligible images
  var lightboxImages = document.querySelectorAll('img[data-lightbox]');
  if (lightboxImages.length === 0) return;

  // Build lightbox DOM once
  var lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', '图片预览');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.setAttribute('tabindex', '-1');
  lightbox.innerHTML =
    '<div class="lightbox-img-wrap">' +
      '<button class="lightbox-close" aria-label="关闭">&times;</button>' +
      '<img src="" alt="" />' +
      '<p class="lightbox-caption"></p>' +
    '</div>' +
    '<button class="lightbox-nav lightbox-prev" aria-label="上一张">&#10094;</button>' +
    '<button class="lightbox-nav lightbox-next" aria-label="下一张">&#10095;</button>';
  document.body.appendChild(lightbox);

  var lightboxImg = lightbox.querySelector('.lightbox-img-wrap img');
  var lightboxCaption = lightbox.querySelector('.lightbox-caption');
  var lightboxClose = lightbox.querySelector('.lightbox-close');
  var lightboxPrev = lightbox.querySelector('.lightbox-prev');
  var lightboxNext = lightbox.querySelector('.lightbox-next');
  var currentIndex = -1;
  var lastFocusedElement = null;
  var previousBodyOverflow = '';

  function getFocusableElements() {
    return Array.from(lightbox.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])'))
      .filter(function(element) { return !element.hasAttribute('disabled'); });
  }

  function openLightbox(index) {
    if (index < 0 || index >= lightboxImages.length) return;
    currentIndex = index;
    var img = lightboxImages[currentIndex];
    if (!lightbox.classList.contains('open')) {
      lastFocusedElement = document.activeElement;
    }
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = img.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    updateNavVisibility();
    window.setTimeout(function() { lightboxClose.focus(); }, 0);
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('open')) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousBodyOverflow;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
    lastFocusedElement = null;
    currentIndex = -1;
    // Clear src after transition to free memory
    setTimeout(function() {
      if (!lightbox.classList.contains('open')) {
        lightboxImg.src = '';
      }
    }, 300);
  }

  function showPrev(e) {
    e.stopPropagation();
    if (currentIndex > 0) openLightbox(currentIndex - 1);
  }

  function showNext(e) {
    e.stopPropagation();
    if (currentIndex < lightboxImages.length - 1) openLightbox(currentIndex + 1);
  }

  function updateNavVisibility() {
    lightboxPrev.style.display = currentIndex > 0 ? '' : 'none';
    lightboxNext.style.display = currentIndex < lightboxImages.length - 1 ? '' : 'none';
  }

  // Attach click handlers to each lightbox image
  lightboxImages.forEach(function(img, index) {
    if (!img.closest('a')) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });
    }
    img.addEventListener('click', function(e) {
      if (img.closest('a')) return;
      e.preventDefault();
      openLightbox(index);
    });
  });

  // Close events
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showPrev(e);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      showNext(e);
    }
    if (e.key === 'Tab') {
      var focusable = getFocusableElements();
      if (focusable.length === 0) {
        e.preventDefault();
        lightboxClose.focus();
        return;
      }
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
