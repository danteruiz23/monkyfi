/* Public brochure helpers — language overlay + mobile nav.
   Chat and intake live on www.monkyfi.com (same-origin Claude widget). */
(function () {
  'use strict';

  var DEMO = {
    EN: {
      'demo.liveNote': 'The live AI Assessment and chatbot run on monkyfi.com — this repository is the public brochure only.',
      'demo.website': 'Website',
      'nav.chat': 'Complete it with the chatbot'
    },
    ES: {
      'demo.liveNote': 'La evaluación de IA y el chatbot en vivo están en monkyfi.com — este repositorio es solo el brochure público.',
      'demo.website': 'Sitio web',
      'nav.chat': 'Complétalo con el chatbot'
    },
    PT: {
      'demo.liveNote': 'A avaliação de IA e o chatbot ao vivo estão em monkyfi.com — este repositório é só o brochure público.',
      'demo.website': 'Site',
      'nav.chat': 'Complete com o chatbot'
    }
  };

  function applyDemo(lang) {
    var dict = DEMO[lang] || DEMO.EN;
    document.querySelectorAll('[data-demo-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-demo-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });
  }

  document.addEventListener('monkyfi:langchange', function (e) {
    applyDemo((e.detail && e.detail.lang) || 'EN');
  });

  document.addEventListener('DOMContentLoaded', function () {
    var lang = (window.MonkyfiI18n && window.MonkyfiI18n.getLang && window.MonkyfiI18n.getLang()) || 'EN';
    applyDemo(lang);

    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = this.classList.toggle('open');
        links.classList.toggle('open');
        this.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          toggle.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          links.classList.remove('open');
        });
      });
    }
  });
})();
