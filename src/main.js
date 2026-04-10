import './style.css'
import { translations } from './js/translations.js';
import { initAdmin } from './js/admin.js';
import Swiper from 'swiper';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './css/admin.css'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Initialize AOS (Refined for Luxury)
AOS.init({
  duration: 1000,
  easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  once: true,
  offset: 30
})

// Initialize Admin Dashboard
initAdmin();

// Hero Animation (Precise Upward Reveal)
window.addEventListener('DOMContentLoaded', () => {
  const heroTitle = document.querySelector('.hero-name-big');
  if (heroTitle) {
    // Use requestAnimationFrame to ensure the browser has registered the hidden state
    requestAnimationFrame(() => {
      heroTitle.classList.add('animate-reveal');
    });
  }
});

// Skills Animation
gsap.utils.toArray('.skill-progress').forEach(skill => {
  ScrollTrigger.create({
    trigger: skill,
    start: 'top 80%',
    onEnter: () => {
      skill.style.width = skill.getAttribute('data-width')
    }
  })
})

// Stats Counter Animation
gsap.utils.toArray('.stat-number').forEach(stat => {
  const target = parseInt(stat.getAttribute('data-target'))

  ScrollTrigger.create({
    trigger: stat,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(stat, {
        innerHTML: target,
        duration: 2,
        snap: { innerHTML: 1 },
        ease: 'power1.out'
      })
    }
  })
})

// Portfolio Filtering
const filterBtns = document.querySelectorAll('.filter-btn')

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class
    filterBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')

    const filter = btn.getAttribute('data-filter')
    const projectCards = document.querySelectorAll('.project-card')

    projectCards.forEach(card => {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = 'block'
        gsap.fromTo(card, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 })
      } else {
        card.style.display = 'none'
      }
    })
  })
})

// Swiper Init
const swiper = new Swiper(".mySwiper", {
  modules: [Pagination, Autoplay],
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  autoplay: {
    delay: 3500,
    disableOnInteraction: false,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

// Contact Form
const form = document.getElementById('contact-form')
form.addEventListener('submit', (e) => {
  e.preventDefault()

  // Simulation of sending
  const btn = form.querySelector('button')
  const originalText = btn.innerText
  btn.innerText = 'Sending...'

  setTimeout(() => {
    btn.innerText = 'Sent Successfully!'
    btn.style.backgroundColor = '#10b981' // Green
    form.reset()

    setTimeout(() => {
      btn.innerText = originalText
      btn.style.backgroundColor = ''
    }, 3000)
  }, 1500)
})







// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'dark';

if (savedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', 'light');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  });
}

// Language Switching Logic
const langSelect = document.getElementById('lang-select');
// Initial setup
const savedLang = localStorage.getItem('preferredLang') || 'ar';

if (langSelect) {
  langSelect.value = savedLang;
  setLanguage(savedLang);

  // Event Listener
  langSelect.addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });
}

function setLanguage(lang) {
  const html = document.documentElement;
  // Update HTML attributes
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  // Update Text Content
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      const content = translations[lang][key];
      // If the content contains <br>, use innerHTML, otherwise use innerText for safety
      if (content.includes('<br>')) {
        element.innerHTML = content;
      } else {
        element.innerText = content;
      }
    }
  });

  // Save to LocalStorage
  localStorage.setItem('preferredLang', lang);
}

// Mobile Menu Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links-new');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
});
