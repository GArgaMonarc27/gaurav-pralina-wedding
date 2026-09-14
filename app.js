(() => {
  'use strict';
  const config = window.WEDDING || {};
  const root = document.documentElement;
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ } }
  };
  // A new preference key gives existing preview visitors the new Nepali default.
  const languagePreferenceKey = 'wedding-language-v2';
  let language = storage.get(languagePreferenceKey) || 'ne';
  if (!['en', 'ne', 'both'].includes(language)) language = 'ne';
  const bilingual = (en, ne) => {
    const fragment = document.createDocumentFragment();
    for (const [lang, text] of [['en', en], ['ne', ne]]) {
      const span = document.createElement('span');
      span.className = lang;
      span.lang = lang;
      span.textContent = text;
      fragment.append(span);
    }
    return fragment;
  };
  const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(config.date || '') ? new Date(`${config.date}T00:00:00Z`) : null;
  const validDate = parsedDate && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === config.date;
  const date = validDate ? parsedDate : null;
  const nepaliNumber = value => String(value).replace(/\d/g, digit => '०१२३४५६७८९'[Number(digit)]);
  const nepaliMonths = ['जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर'];
  const nepaliWeekdays = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];
  const nepaliDate = config.nepaliDate;
  const format = (locale, options) => {
    if (locale !== 'ne-NP') return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(date);
    const parts = [];
    if (options.day) parts.push(nepaliNumber(options.day === '2-digit' ? String(date.getUTCDate()).padStart(2, '0') : date.getUTCDate()));
    if (options.month) parts.push(nepaliMonths[date.getUTCMonth()]);
    if (options.year) parts.push(nepaliNumber(date.getUTCFullYear()));
    return (options.weekday ? nepaliWeekdays[date.getUTCDay()] + (parts.length ? ', ' : '') : '') + parts.join(' ');
  };
  const formatNepaliCalendarDate = includeWeekday => {
    if (!nepaliDate) return '';
    const value = `${nepaliNumber(nepaliDate.day)} ${nepaliDate.month} ${nepaliNumber(nepaliDate.year)}`;
    return includeWeekday ? `${nepaliWeekdays[date.getUTCDay()]}, ${value}` : value;
  };
  function renderDate() {
    const full = document.querySelector('.date-full');
    if (!date) {
      full.removeAttribute('datetime');
      full.replaceChildren(bilingual('Date to be announced', 'मिति पछि जानकारी गराइनेछ'));
      document.querySelector('.monogram small').textContent = 'G & P';
      document.querySelector('.day-number').textContent = '✧';
      document.querySelector('.month-year').textContent = language === 'ne' ? 'मिति पछि जानकारी गराइनेछ' : 'Date to be announced';
      document.querySelector('.weekday').textContent = '';
      document.querySelector('#save-date').hidden = true;
      document.querySelector('.calendar-note').hidden = true;
      return;
    }
    const englishFullDate = format('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const nepaliFullDate = formatNepaliCalendarDate(true);
    full.dateTime = config.date;
    full.replaceChildren(bilingual(englishFullDate, nepaliFullDate));
    document.querySelector('.monogram small').replaceChildren(bilingual(`${config.date.slice(8)} · ${config.date.slice(5, 7)} · ${config.date.slice(2, 4)}`, `${nepaliNumber(nepaliDate.day)} · ${nepaliNumber(String(nepaliDate.monthNumber).padStart(2, '0'))} · ${nepaliNumber(String(nepaliDate.year).slice(-2))}`));
    document.querySelector('.day-number').replaceChildren(bilingual(nepaliNumber(date.getUTCDate()), nepaliNumber(nepaliDate.day)));
    document.querySelector('.month-year').replaceChildren(bilingual(format('en-GB', { month: 'long', year: 'numeric' }), `${nepaliDate.month} ${nepaliNumber(nepaliDate.year)}`));
    document.querySelector('.weekday').replaceChildren(bilingual(format('en-GB', { weekday: 'long' }), nepaliWeekdays[date.getUTCDay()]));
  }
  function renderTimes() {
    let allConfirmed = true;
    document.querySelectorAll('[data-event]').forEach(row => {
      const value = config.times?.[row.dataset.event] || '';
      const time = row.querySelector('time');
      if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) {
        time.dateTime = value;
        const timeDate = new Date(`2000-01-01T${value}:00Z`);
        time.textContent = language === 'ne' ? nepaliNumber(value) : new Intl.DateTimeFormat('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(timeDate);
        time.title = language === 'ne' ? 'नेपालको स्थानीय समय' : 'Nepal local time';
      } else {
        time.removeAttribute('datetime');
        time.textContent = '';
        allConfirmed = false;
      }
    });
    document.querySelector('.schedule-note').replaceChildren(bilingual(allConfirmed ? 'All times are Nepal local time.' : 'Ceremony times will be announced. Any times shown are Nepal local time.', allConfirmed ? 'सबै समय नेपालको स्थानीय समयअनुसार छन्।' : 'कार्यक्रमको समय पछि जानकारी गराइनेछ। देखाइएका समय नेपालको स्थानीय समयअनुसार छन्।'));
  }
  const gallery = [...document.querySelectorAll('.gallery-trigger')];
  const dialog = document.querySelector('#photo-dialog');
  let photoIndex = 0;
  let photoOpener = null;
  function showPhoto(index) {
    photoIndex = (index + gallery.length) % gallery.length;
    const link = gallery[photoIndex];
    const img = document.querySelector('#lightbox-image');
    img.src = link.href;
    img.alt = link.querySelector('img').alt;
    document.querySelector('#lightbox-caption').replaceChildren(bilingual(link.dataset.captionEn, link.dataset.captionNe));
    const count = `${photoIndex + 1} / ${gallery.length}`;
    document.querySelector('#photo-count').textContent = language === 'ne' ? nepaliNumber(count) : count;
  }
  function setLanguage(value) {
    language = value;
    root.dataset.language = value;
    root.lang = value === 'ne' ? 'ne' : 'en';
    storage.set(languagePreferenceKey, value);
    document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === value)));
    document.querySelectorAll('[data-alt-en]').forEach(img => { img.alt = img.dataset[value === 'ne' ? 'altNe' : 'altEn']; });
    document.title = value === 'ne' ? 'गौरव र प्रलिना · शुभ विवाह' : 'Gaurav & Pralina · A celebration of love';
    renderDate();
    renderTimes();
    if (dialog.open) showPhoto(photoIndex);
  }
  const setContent = (selector, data) => {
    if (!data) return;
    document.querySelector(selector).replaceChildren(bilingual(data.en || data.ne || '', data.ne || data.en || ''));
  };
  setContent('.location', config.location);
  setContent('.venue-address', config.address);
  const venueKnown = Boolean(config.venueName?.en || config.venueName?.ne);
  if (venueKnown) setContent('.venue-name', config.venueName);
  else setContent('.venue-name', config.location);
  let mapUrl = '';
  try { const url = new URL(config.mapsUrl); if (url.protocol === 'https:') mapUrl = url.href; } catch { /* No confirmed map yet. */ }
  if (mapUrl) {
    const directions = document.querySelector('#directions');
    directions.href = mapUrl;
    directions.hidden = false;
    document.querySelector('.venue-detail').replaceChildren(bilingual('We look forward to welcoming you. Use the link below for directions.', 'यहाँलाई स्वागत गर्न आतुर छौँ। बाटो हेर्न तलको लिङ्क खोल्नुहोस्।'));
  } else if (venueKnown) {
    document.querySelector('.venue-detail').replaceChildren(bilingual('Directions will be shared soon.', 'बाटोको विवरण चाँडै जानकारी गराइनेछ।'));
  }
  document.querySelectorAll('[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  setLanguage(language);

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.motion-toggle');
  let paused = storage.get('wedding-motion') === 'paused' || reducedMotion.matches;
  function updateMotion() {
    root.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Enable animations / एनिमेसन चलाउनुहोस्' : 'Pause animations / एनिमेसन रोक्नुहोस्';
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.firstElementChild.textContent = paused ? '▷' : 'Ⅱ';
  }
  motionButton.addEventListener('click', () => { paused = !paused; storage.set('wedding-motion', paused ? 'paused' : 'enabled'); updateMotion(); });
  reducedMotion.addEventListener('change', event => { if (event.matches) { paused = true; updateMotion(); } });
  updateMotion();
  if ('IntersectionObserver' in window && !paused) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('is-waiting'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => { element.classList.add('is-waiting'); observer.observe(element); });
  }
  gallery.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      photoOpener = link;
      showPhoto(index);
      dialog.showModal();
      dialog.querySelector('.lightbox-close').focus();
    });
  });
  document.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  document.querySelector('#previous-photo').addEventListener('click', () => showPhoto(photoIndex - 1));
  document.querySelector('#next-photo').addEventListener('click', () => showPhoto(photoIndex + 1));
  dialog.addEventListener('close', () => { photoOpener?.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + (event.key === 'ArrowLeft' ? -1 : 1)); } });
  let touchStart = null;
  const lightboxImage = document.querySelector('#lightbox-image');
  lightboxImage.addEventListener('touchstart', event => { touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null; }, { passive: true });
  lightboxImage.addEventListener('touchend', event => { if (!touchStart) return; const dx = event.changedTouches[0].clientX - touchStart.x; const dy = event.changedTouches[0].clientY - touchStart.y; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(photoIndex + (dx < 0 ? 1 : -1)); touchStart = null; }, { passive: true });

  function icsEscape(value) { return String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;'); }
  // Fold by UTF-8 bytes, preserving Devanagari characters for calendar clients.
  function foldLine(line) {
    const encoder = new TextEncoder();
    let result = '', chunk = '', bytes = 0;
    for (const char of line) {
      const size = encoder.encode(char).length;
      if (bytes + size > 73) { result += chunk + '\r\n'; chunk = ' '; bytes = 1; }
      chunk += char; bytes += size;
    }
    return result + chunk;
  }
  document.querySelector('#save-date').addEventListener('click', () => {
    if (!date) return;
    const nextDay = new Date(date); nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const summary = language === 'ne' ? 'गौरव र प्रलिनाको शुभ विवाह' : 'Gaurav & Pralina — Wedding';
    const location = [config.venueName?.[language === 'ne' ? 'ne' : 'en'], config.location?.[language === 'ne' ? 'ne' : 'en']].filter(Boolean).join(', ');
    const description = language === 'ne' ? 'यहाँको उपस्थिति र आशीर्वादको हार्दिक अपेक्षा गर्दछौँ। कार्यक्रमको थप विवरण निमन्त्रणामा हेर्नुहोस्।' : 'Join us with your love and blessings. Check the invitation for the latest ceremony times and venue details.';
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Gaurav and Pralina//Wedding Invitation//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:gaurav-pralina-wedding@invitation.local',`DTSTAMP:${stamp}`,`DTSTART;VALUE=DATE:${config.date.replace(/-/g, '')}`,`DTEND;VALUE=DATE:${nextDay.toISOString().slice(0,10).replace(/-/g, '')}`,`SUMMARY:${icsEscape(summary)}`,`LOCATION:${icsEscape(location)}`,`DESCRIPTION:${icsEscape(description)}`,'TRANSP:TRANSPARENT','END:VEVENT','END:VCALENDAR'];
    const blob = new Blob([lines.map(foldLine).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'Gaurav-and-Pralina-wedding.ics'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    document.querySelector('#status').textContent = language === 'ne' ? 'पात्रो फाइल तयार भयो। पात्रोमा थप्न डाउनलोड गरिएको फाइल खोल्नुहोस्।' : 'Calendar file prepared. Open the downloaded file to add it to your calendar.';
  });
})();
