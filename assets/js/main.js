/**
 * 裕荣机电（大连）有限公司 - 前台交互脚本
 * Yu Rong Mechanical and Electrical (Dalian) Co., Ltd.
 */

document.addEventListener('DOMContentLoaded', function() {

  // --- Hamburger Menu ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function() {
      if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  });

  // --- Header scroll effect ---
  const header = document.querySelector('.site-header');

  function updateHeader() {
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
    var page = path.split('/').pop() || 'index.html';

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
            counter.textContent = Math.floor(progress * target);
            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              counter.textContent = target;
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

  // --- Contact Form ---
  var contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn.textContent;
      btn.textContent = '发送中...';
      btn.disabled = true;

      // Simulate submission (no backend needed)
      setTimeout(function() {
        btn.textContent = '✓ 已发送！';
        btn.style.background = '#2ecc71';
        btn.style.borderColor = '#2ecc71';
        contactForm.reset();

        setTimeout(function() {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.borderColor = '';
          btn.disabled = false;
        }, 2500);
      }, 800);
    });
  }

  // --- Partners Carousel ---
  initPartnersCarousel();

  // --- Image Lightbox ---
  initLightbox();

});

/**
 * Initialize partners carousel: horizontal auto-scrolling logo slider.
 * Adapts visible slide count to viewport width on resize.
 */
function initPartnersCarousel() {
  var carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  var track = carousel.querySelector('[data-carousel-track]');
  var viewport = carousel.querySelector('[data-carousel-viewport]');
  var prevBtn = carousel.querySelector('[data-carousel-prev]');
  var nextBtn = carousel.querySelector('[data-carousel-next]');
  var slides = track.querySelectorAll('.carousel-slide');
  if (slides.length === 0) return;

  var currentIndex = 0;
  var visibleCount = getVisibleCount();
  var maxIndex = Math.max(0, slides.length - visibleCount);
  var autoTimer = null;
  var isTransitioning = false;

  function getVisibleCount() {
    var w = viewport.clientWidth;
    if (w <= 576) return 2;
    if (w <= 992) return 3;
    return 5;
  }

  function getSlideWidth() {
    var gap = parseInt(getComputedStyle(track).gap) || 24;
    return (viewport.clientWidth + gap) / visibleCount;
  }

  function goTo(index) {
    if (isTransitioning) return;
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    var offset = currentIndex * getSlideWidth();
    track.style.transform = 'translateX(-' + offset + 'px)';
  }

  function goNext() {
    isTransitioning = true;
    if (currentIndex >= maxIndex) {
      // Loop back to start
      currentIndex = 0;
      track.style.transition = 'none';
      track.style.transform = 'translateX(0)';
      // Force reflow
      track.offsetHeight;
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    } else {
      currentIndex++;
      var offset = currentIndex * getSlideWidth();
      track.style.transform = 'translateX(-' + offset + 'px)';
    }
    setTimeout(function() { isTransitioning = false; }, 500);
  }

  function goPrev() {
    isTransitioning = true;
    if (currentIndex <= 0) {
      // Jump to end
      currentIndex = maxIndex;
      track.style.transition = 'none';
      track.style.transform = 'translateX(-' + (currentIndex * getSlideWidth()) + 'px)';
      track.offsetHeight;
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    } else {
      currentIndex--;
      var offset = currentIndex * getSlideWidth();
      track.style.transform = 'translateX(-' + offset + 'px)';
    }
    setTimeout(function() { isTransitioning = false; }, 500);
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(goNext, 3500);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function recalc() {
    visibleCount = getVisibleCount();
    maxIndex = Math.max(0, slides.length - visibleCount);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    track.style.transition = 'none';
    track.style.transform = 'translateX(-' + (currentIndex * getSlideWidth()) + 'px)';
    track.offsetHeight;
    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
  }

  // Events
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
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  // Touch swipe
  var touchStartX = 0;
  var touchEndX = 0;
  viewport.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  viewport.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      stopAuto();
      if (diff > 0) goNext();
      else goPrev();
      startAuto();
    }
  }, { passive: true });

  // Resize
  var resizeDebounce;
  window.addEventListener('resize', function() {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(recalc, 150);
  });

  // Init
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
  lightbox.setAttribute('aria-label', '图片预览');
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

  function openLightbox(index) {
    if (index < 0 || index >= lightboxImages.length) return;
    currentIndex = index;
    var img = lightboxImages[currentIndex];
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || '';
    lightboxCaption.textContent = img.alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNavVisibility();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
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
    img.addEventListener('click', function(e) {
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
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev(e);
    if (e.key === 'ArrowRight') showNext(e);
  });
}
