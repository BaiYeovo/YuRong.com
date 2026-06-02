/**
 * 裕荣机电（大连）有限公司 - 前台交互脚本
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

});
