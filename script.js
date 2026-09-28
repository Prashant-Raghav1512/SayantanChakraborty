document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll progress bar
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  // Back-to-top button
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.innerHTML = '&#8593;';
  document.body.appendChild(backToTop);

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  let ticking = false;
  const updateOnScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = pct + '%';
    backToTop.classList.toggle('visible', scrollTop > 500);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  updateOnScroll();

  // Auto-built "on this page" contents sidebar (functional, runs regardless of motion prefs)
  const toc = document.getElementById('pageToc');
  if (toc) {
    const subs = document.querySelectorAll('.page-content .sub');
    if (subs.length) {
      const label = document.createElement('p');
      label.className = 'page-toc-label';
      label.textContent = 'On this page';
      toc.appendChild(label);

      subs.forEach((sub, i) => {
        if (!sub.id) {
          const slug = sub.textContent
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          sub.id = 'toc-' + slug + '-' + i;
        }
        const link = document.createElement('a');
        link.href = '#' + sub.id;
        link.textContent = sub.textContent;
        toc.appendChild(link);
      });

      if ('IntersectionObserver' in window) {
        const tocLinks = toc.querySelectorAll('a');
        const tocObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            const link = toc.querySelector('a[href="#' + entry.target.id + '"]');
            if (!link) return;
            if (entry.isIntersecting) {
              tocLinks.forEach(l => l.classList.remove('active'));
              link.classList.add('active');
            }
          });
        }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
        subs.forEach(sub => tocObserver.observe(sub));
      }
    }
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointerFine = window.matchMedia('(pointer: fine)').matches;

  // Cursor glow + 3D tilt (decorative — skipped under reduced motion or on touch)
  if (!reduceMotion && pointerFine) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);

    let tx = 0, ty = 0, gx = 0, gy = 0;
    let glowActive = false;

    document.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!glowActive) {
        glow.classList.add('active');
        glowActive = true;
      }
    });

    document.addEventListener('mouseleave', () => {
      glow.classList.remove('active');
      glowActive = false;
    });

    const animateGlow = () => {
      gx += (tx - gx) * 0.18;
      gy += (ty - gy) * 0.18;
      glow.style.transform = 'translate(' + gx + 'px, ' + gy + 'px) translate(-50%, -50%)';
      requestAnimationFrame(animateGlow);
    };
    requestAnimationFrame(animateGlow);

    const hoverTargets = document.querySelectorAll(
      'a, button, .interest-card, .proj-card, .quicklink-card, .row-list-item, .timeline li'
    );
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => glow.classList.add('hovering'));
      el.addEventListener('mouseleave', () => glow.classList.remove('hovering'));
    });

    const tiltTargets = document.querySelectorAll('.interest-card, .proj-card, .quicklink-card');
    tiltTargets.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        const ry = (px * 6).toFixed(2);
        const rx = (py * -6).toFixed(2);
        card.style.transform = 'perspective(700px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // Scroll-reveal (decorative, skipped under prefers-reduced-motion)
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('.section, .proj-card, .interest-card, .quicklink-card');
  targets.forEach(el => el.classList.add('reveal-pending'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
});
