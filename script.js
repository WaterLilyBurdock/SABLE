(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.header');
  const burger = document.querySelector('.nav__burger');
  const drawer = document.querySelector('.mobile-drawer');
  const preloader = document.querySelector('.preloader');

  /* --------------------------------------------------------------------------
     Мобильное меню и форма
     -------------------------------------------------------------------------- */
  const toggleDrawer = (forceClose = false) => {
    if (!burger || !drawer) return;
    const isOpen = forceClose ? false : !drawer.classList.contains('is-open');
    burger.classList.toggle('is-open', isOpen);
    drawer.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    drawer.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger?.addEventListener('click', () => toggleDrawer());
  drawer?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleDrawer(true));
  });

  const reserveForm = document.getElementById('reserveForm');
  const reserveStatus = document.querySelector('.reserve__status');
  const timeInput = reserveForm?.querySelector('input[name="time"]');

  document.querySelectorAll('.slot-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.slot-pill').forEach((p) => p.classList.remove('is-active'));
      pill.classList.add('is-active');
      if (timeInput) timeInput.value = pill.dataset.slot || '18:30';
    });
  });

  reserveForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const guest = reserveForm.querySelector('input[name="name"]')?.value.trim() || 'Гость';
    const slot = timeInput?.value || '18:30';
    if (reserveStatus) {
      reserveStatus.textContent = `${guest}, стол на ${slot} предварительно забронирован. Перезвоним в течение 15 минут.`;
    }
    reserveForm.reset();
  });

  /* --------------------------------------------------------------------------
     Модальное окно блюд (открытие каждого блюда)
     -------------------------------------------------------------------------- */
  const dishesData = {
    striploin: {
      category: 'Горячее',
      weight: '260 г',
      title: 'Стриплойн 45 дней выдержки',
      price: '2 450 ₽',
      img: 'images/dish-steak.jpg',
      story: 'Мраморная говядина сухого вызревания в камере с гималайской солью. Обжаривается на открытых берёзовых углях до корочки и отдыхает в топлёном масле с тимьяном.',
      ingredients: ['Стриплойн 45 дней', 'Печёный пастернак', 'Демиглас', 'Чёрный трюфель', 'Можжевельник'],
      pairing: 'Château Musar, Bekaa Valley или настой чёрной смородины с дымным чаем.',
    },
    scallop: {
      category: 'Закуска',
      weight: '140 г',
      title: 'Сахалинский гребешок',
      price: '1 680 ₽',
      img: 'images/dish-scallop.jpg',
      story: 'Крупный дикий гребешок, обжаренный на раскалённой чугунной сковороде за 40 секунд с одной стороны. Подаётся с эмульсией на сухом шампанском.',
      ingredients: ['Гребешок', 'Берблан на шампанском', 'Масло зелёного лука', 'Икра форели', 'Морская соль'],
      pairing: 'Chablis Premier Cru Montmains или комбуча из крыжовника.',
    },
    ganache: {
      category: 'Десерт',
      weight: '130 г',
      title: 'Ганаш из 75% какао и белых грибов',
      price: '980 ₽',
      img: 'images/dish-dessert.jpg',
      story: 'Шелковистый ганаш на основе перуанского какао, настоянного на сушёных белых грибах, с контрастом солёной мисо-карамели и мороженого из жжёного молока.',
      ingredients: ['Какао 75%', 'Белые грибы', 'Мисо-карамель', 'Жжёное молоко', 'Сусальное золото'],
      pairing: 'Sauternes 2016 или тёплый отвар бобов тонка и кардамона.',
    },
    halibut: {
      category: 'Горячее',
      weight: '220 г',
      title: 'Мурманский палтус на углях',
      price: '2 150 ₽',
      img: 'images/dish-halibut.jpg',
      story: 'Филе северного палтуса с хрустящей кожей готовится на живом жару, сохраняя сочность. Подаётся на бархатном креме из карамелизованной цветной капусты.',
      ingredients: ['Палтус', 'Цветная капуста', 'Икорный берблан', 'Хрустящий кейл', 'Лимонный тимьян'],
      pairing: 'Meursault Les Narvaux или белый чай с морским фенхелем.',
    },
    tartare: {
      category: 'Закуска',
      weight: '155 г',
      title: 'Тартар из оленины и брусники',
      price: '1 490 ₽',
      img: 'images/dish-tartare.jpg',
      story: 'Вырезка северного оленя ручной рубки с лёгким ароматом можжевелового дыма, дополненная кислотностью ферментированной брусники и хвойным маслом.',
      ingredients: ['Вырезка оленя', 'Копчёный желток', 'Брусника', 'Масло хвои', 'Бриошь'],
      pairing: 'Gevrey-Chambertin или экстракт дикой брусники с можжевельником.',
    },
    duck: {
      category: 'Горячее',
      weight: '240 г',
      title: 'Утиная грудка 14 дней вызревания',
      price: '2 290 ₽',
      img: 'images/dish-duck.jpg',
      story: 'Двухнедельное вызревание делает кожу идеально хрустящей, а мясо — нежным. Глазируется редукцией из портвейна и дикой вишни.',
      ingredients: ['Утиная грудка', 'Дикая вишня', 'Портвейн', 'Печёная тыква', 'Пряный жю'],
      pairing: 'Barolo Serralunga или холодный настой гибискуса с гвоздикой.',
    },
  };

  const dishKeys = Object.keys(dishesData);
  const dishModal = document.getElementById('dishModal');
  let activeDishIndex = 0;

  const fillDishModal = (key) => {
    const data = dishesData[key];
    if (!data || !dishModal) return;
    activeDishIndex = dishKeys.indexOf(key);

    const img = document.getElementById('modalDishImg');
    if (img) {
      img.src = data.img;
      img.alt = data.title;
    }
    document.getElementById('modalDishCat').textContent = data.category;
    document.getElementById('modalDishWeight').textContent = data.weight;
    document.getElementById('modalDishTitle').textContent = data.title;
    document.getElementById('modalDishPrice').textContent = data.price;
    document.getElementById('modalDishStory').textContent = data.story;
    document.getElementById('modalDishPairing').textContent = data.pairing;

    const list = document.getElementById('modalDishIngredients');
    if (list) {
      list.innerHTML = data.ingredients.map((item) => `<li>${item}</li>`).join('');
    }
  };

  const openDishModal = (key) => {
    if (!dishModal) return;
    fillDishModal(key);
    dishModal.classList.add('is-open');
    dishModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
      gsap.fromTo(dishModal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(
        '.dish-modal__dialog',
        { y: 28, scale: 0.97, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    } else {
      dishModal.style.opacity = '1';
    }
  };

  const closeDishModal = () => {
    if (!dishModal || !dishModal.classList.contains('is-open')) return;
    const finish = () => {
      dishModal.classList.remove('is-open');
      dishModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
      gsap.to(dishModal, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: finish });
    } else {
      dishModal.style.opacity = '0';
      finish();
    }
  };

  document.querySelectorAll('.dish-card[data-dish]').forEach((card) => {
    const key = card.dataset.dish;
    card.addEventListener('click', () => openDishModal(key));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDishModal(key);
      }
    });
  });

  dishModal?.querySelectorAll('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeDishModal);
  });

  document.getElementById('modalReserveBtn')?.addEventListener('click', closeDishModal);

  document.getElementById('modalPrev')?.addEventListener('click', () => {
    const nextIdx = (activeDishIndex - 1 + dishKeys.length) % dishKeys.length;
    fillDishModal(dishKeys[nextIdx]);
  });

  document.getElementById('modalNext')?.addEventListener('click', () => {
    const nextIdx = (activeDishIndex + 1) % dishKeys.length;
    fillDishModal(dishKeys[nextIdx]);
  });

  document.addEventListener('keydown', (e) => {
    if (!dishModal?.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeDishModal();
    if (e.key === 'ArrowLeft') document.getElementById('modalPrev')?.click();
    if (e.key === 'ArrowRight') document.getElementById('modalNext')?.click();
  });

  const pairingMap = {
    wine: [
      'Шампань Blanc de Blancs Brut Nature',
      'Луара Chenin Blanc Sec',
      'Бургундия Pinot Noir Premier Cru',
      'Шабли Premier Cru Montmains',
      'Приорат Garnacha & Cariñena',
      'Сотерн 2016',
    ],
    na: [
      'Ферментированный чай из листа юдзу и мяты',
      'Комбуча из крыжовника и эстрагона',
      'Холодный настой жареного ячменя с трюфелем',
      'Белый чай Бай Му Дань с морским фенхелем',
      'Экстракт дикой брусники, можжевельника и гибискуса',
      'Тёплый отвар бобов тонка и кардамона',
    ],
  };

  const menuRows = document.querySelectorAll('.menu-row');
  const renderPairing = (mode) => {
    const notes = pairingMap[mode] || pairingMap.wine;
    menuRows.forEach((row, idx) => {
      let badge = row.querySelector('.menu-row__pairing');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'menu-row__pairing';
        row.querySelector('.menu-row__main')?.appendChild(badge);
      }
      badge.textContent = `Пейринг: ${notes[idx] || ''}`;
    });
  };
  renderPairing('wine');

  document.querySelectorAll('.pairing-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.pairing-tab').forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-pressed', String(active));
      });
      renderPairing(tab.dataset.pairing || 'wine');
      if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        gsap.fromTo(
          '.menu-row__pairing',
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.04, ease: 'power2.out' }
        );
      }
    });
  });

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* При prefers-reduced-motion сразу показываем страницу без прелоадера и анимаций */
  if (prefersReducedMotion || typeof gsap === 'undefined') {
    document.body.classList.remove('is-loading');
    preloader?.remove();
    document.querySelectorAll('.counter').forEach((el) => {
      el.textContent = el.dataset.target || '0';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  if (typeof SplitText !== 'undefined') {
    gsap.registerPlugin(SplitText);
  }

  gsap.to('.scroll-progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
    },
  });

  /* --------------------------------------------------------------------------
     1. Smooth Scroll (Lenis)
     -------------------------------------------------------------------------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      toggleDrawer(true);

      if (lenis) {
        lenis.scrollTo(target, { offset: -72, duration: 1.25 });
      } else {
        gsap.to(window, { duration: 1.1, scrollTo: { y: target, offsetY: 72 }, ease: 'power3.inOut' });
      }
    });
  });

  /* --------------------------------------------------------------------------
     2. Кастомный курсор-кольцо
     -------------------------------------------------------------------------- */
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const cursor = document.querySelector('.ring-cursor');
  const cursorLabel = document.querySelector('.ring-cursor__label');

  if (canHover && cursor) {
    document.body.classList.add('has-ring-cursor');
    gsap.set(cursor, { xPercent: -50, yPercent: -50, x: -120, y: -120 });

    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.24, ease: 'power3.out' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.24, ease: 'power3.out' });

    window.addEventListener('mousemove', (e) => {
      moveX(e.clientX);
      moveY(e.clientY);
    });

    const hoverTargets = 'a, button, [data-cursor], .dish-card';
    document.addEventListener('mouseover', (e) => {
      const el = e.target.closest(hoverTargets);
      if (!el) return;
      cursor.classList.add('is-hover');
      const label = el.getAttribute('data-cursor');
      if (label && cursorLabel) {
        cursorLabel.textContent = label;
        cursor.classList.add('has-label');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const el = e.target.closest(hoverTargets);
      if (!el || el.contains(e.relatedTarget)) return;
      cursor.classList.remove('is-hover', 'has-label');
    });
  }

  /* --------------------------------------------------------------------------
     3. Прелоадер «накрываем на стол» + Кинетический заголовок (SplitText)
     -------------------------------------------------------------------------- */
  const heroTitle = document.querySelector('.split-kinetic');
  let heroSplit = null;

  if (heroTitle && typeof SplitText !== 'undefined') {
    heroSplit = new SplitText(heroTitle, {
      type: 'lines,words',
      linesClass: 'split-line',
    });
  }

  const heroWords = heroSplit ? heroSplit.words : heroTitle ? [heroTitle] : [];
  gsap.set(heroWords, { yPercent: 115, opacity: 0 });
  gsap.set('.hero__top, .hero__bottom', { opacity: 0, y: 24 });

  const tableStrokes = document.querySelectorAll('.table-stroke');
  tableStrokes.forEach((path) => {
    const len = typeof path.getTotalLength === 'function' ? path.getTotalLength() : 260;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  });

  const masterTl = gsap.timeline({
    onComplete: () => {
      document.body.classList.remove('is-loading');
      preloader?.remove();
      ScrollTrigger.refresh();
    },
  });

  masterTl
    .to(tableStrokes, {
      strokeDashoffset: 0,
      duration: 1.05,
      stagger: 0.14,
      ease: 'power2.inOut',
    })
    .from('.preloader__text, .preloader__brand', {
      opacity: 0,
      y: 10,
      duration: 0.45,
      stagger: 0.1,
    }, '-=0.75')
    .to('.preloader__inner', {
      opacity: 0,
      y: -16,
      duration: 0.4,
      ease: 'power2.in',
    }, '+=0.15')
    .to(preloader, {
      yPercent: -100,
      duration: 0.85,
      ease: 'power4.inOut',
    }, '-=0.15')
    .to(heroWords, {
      yPercent: 0,
      opacity: 1,
      duration: 1.0,
      stagger: 0.08,
      ease: 'power4.out',
    }, '-=0.4')
    .to('.hero__top, .hero__bottom', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
    }, '-=0.55');

  /* Кинетический сдвиг заголовка при прокрутке */
  if (heroSplit && heroSplit.lines?.length) {
    heroSplit.lines.forEach((line, idx) => {
      gsap.to(line, {
        x: idx % 2 === 0 ? -36 : 36,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. Parallax (Hero + фото блюд и интерьера)
     -------------------------------------------------------------------------- */
  gsap.to('.hero__bg', {
    yPercent: 18,
    scale: 1.06,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  document.querySelectorAll('.parallax-photo').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -8 },
      {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );
  });

  /* --------------------------------------------------------------------------
     5. Curtain-переходы между секциями
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.curtain-wipe').forEach((line) => {
    gsap.to(line, {
      scaleX: 1,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: line.parentElement,
        start: 'top 85%',
        once: true,
      },
    });
  });

  document.querySelectorAll('.curtain-frame').forEach((frame) => {
    gsap.fromTo(
      frame,
      { clipPath: 'inset(100% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        duration: 1.2,
        ease: 'power4.inOut',
        scrollTrigger: {
          trigger: frame,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });

  /* --------------------------------------------------------------------------
     6. Scroll-reveal с SplitText и stagger
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.split-reveal').forEach((heading) => {
    if (typeof SplitText !== 'undefined') {
      const split = new SplitText(heading, { type: 'lines,words', linesClass: 'split-line' });
      gsap.fromTo(
        split.words,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.045,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 88%',
            once: true,
          },
        }
      );
    }
  });

  document.querySelectorAll('.stagger-group').forEach((group) => {
    const items = group.querySelectorAll('.stagger-item');
    gsap.fromTo(
      items,
      { opacity: 0, y: 36 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 86%',
          once: true,
        },
      }
    );
  });

  gsap.utils.toArray('.section .stagger-item').forEach((el) => {
    if (el.closest('.stagger-group')) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      }
    );
  });

  /* --------------------------------------------------------------------------
     7. Reveal-анимация дегустационного меню
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.menu-row').forEach((row, index) => {
    const line = row.querySelector('.menu-row__line');
    const content = row.querySelectorAll('.menu-row__num, .menu-row__main, .menu-row__weight');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: row,
        start: 'top 90%',
        once: true,
      },
      delay: index * 0.04,
    });

    tl.fromTo(
      content,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out' }
    ).fromTo(
      line,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.85, ease: 'power3.inOut' },
      '-=0.45'
    );
  });

  /* --------------------------------------------------------------------------
     8. Счётчики
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.counter').forEach((el) => {
    const target = Number(el.dataset.target || 0);
    const state = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(state, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = String(Math.round(state.val));
          },
        });
      },
    });
  });

  /* --------------------------------------------------------------------------
     9. Магнитные кнопки + Hover-эффекты карточек блюд
     -------------------------------------------------------------------------- */
  if (canHover) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      const inner = btn.querySelector('.magnetic__inner');
      const xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' });
      const innerX = inner ? gsap.quickTo(inner, 'x', { duration: 0.45, ease: 'power3.out' }) : null;
      const innerY = inner ? gsap.quickTo(inner, 'y', { duration: 0.45, ease: 'power3.out' }) : null;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - rect.left - rect.width / 2;
        const dy = e.clientY - rect.top - rect.height / 2;
        xTo(dx * 0.28);
        yTo(dy * 0.28);
        innerX?.(dx * 0.14);
        innerY?.(dy * 0.14);
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        if (inner) {
          gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
        }
      });
    });

    document.querySelectorAll('.dish-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;

        gsap.to(card, {
          rotateX: (0.5 - py) * 6,
          rotateY: (px - 0.5) * 6,
          y: -6,
          duration: 0.35,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          y: 0,
          duration: 0.65,
          ease: 'elastic.out(1, 0.55)',
        });
      });
    });
  }
})();
