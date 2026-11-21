document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic Footer Copyright Year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile Navigation & Accessible Drawer
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.getElementById('main-nav') || document.querySelector('.nav');
  const navDrop = document.querySelector('.nav-drop');
  const dropBtn = document.querySelector('.nav-drop-btn');
  const dropdownMenu = document.querySelector('.dropdown');

  // Create or retrieve Backdrop Overlay
  let navBackdrop = document.querySelector('.nav-backdrop');
  if (!navBackdrop) {
    navBackdrop = document.createElement('div');
    navBackdrop.className = 'nav-backdrop';
    navBackdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(navBackdrop);
  }

  function openMobileNav() {
    if (!mainNav || !menuToggle) return;
    menuToggle.setAttribute('aria-expanded', 'true');
    mainNav.classList.add('open');
    document.body.classList.add('nav-open');
  }

  function closeMobileNav() {
    if (!mainNav || !menuToggle) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('open');
    document.body.classList.remove('nav-open');
    if (navDrop) navDrop.classList.remove('open');
    if (dropdownMenu) dropdownMenu.classList.remove('open');
    if (dropBtn) dropBtn.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close mobile nav when clicking on any navigation link (except the dropdown toggle button)
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });

    // Close on backdrop click
    navBackdrop.addEventListener('click', closeMobileNav);

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileNav();
      }
    });

    // Close when clicking outside header
    document.addEventListener('click', (e) => {
      const header = document.querySelector('.header');
      if (header && !header.contains(e.target) && !navBackdrop.contains(e.target)) {
        if (mainNav.classList.contains('open')) {
          closeMobileNav();
        }
      }
    });

    // Auto-close mobile nav if screen resized to desktop width
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820 && mainNav.classList.contains('open')) {
        closeMobileNav();
      }
    });
  }

  // 3. Accessible Services Dropdown (Touch & Keyboard)
  if (navDrop && dropBtn && dropdownMenu) {
    dropBtn.addEventListener('click', (e) => {
      if (window.innerWidth <= 820) {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = navDrop.classList.toggle('open');
        dropdownMenu.classList.toggle('open', isOpen);
        dropBtn.setAttribute('aria-expanded', String(isOpen));
      }
    });

    // Keyboard support for desktop dropdown
    dropBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dropdownMenu.classList.add('open');
        dropBtn.setAttribute('aria-expanded', 'true');
        const firstLink = dropdownMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  }

  // 4. Thank-You Modal Controls
  const thankYouModal = document.getElementById('thankYouModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function showThankYouModal() {
    if (!thankYouModal) return;
    thankYouModal.classList.add('active');
    thankYouModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (modalCloseBtn) {
      setTimeout(() => modalCloseBtn.focus(), 120);
    }
  }

  function hideThankYouModal() {
    if (!thankYouModal) return;
    thankYouModal.classList.remove('active');
    thankYouModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', hideThankYouModal);
  }

  if (thankYouModal) {
    thankYouModal.addEventListener('click', (e) => {
      if (e.target === thankYouModal) {
        hideThankYouModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && thankYouModal.classList.contains('active')) {
        hideThankYouModal();
      }
    });
  }

  // 5. Contact Form Integration (Preserved with Backend & SMTP)
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const btnArrow = document.getElementById('btnArrow');
  const formError = document.getElementById('formError');

  const nameInput = document.getElementById('formName');
  const companyInput = document.getElementById('formCompany');
  const emailInput = document.getElementById('formEmail');
  const phoneInput = document.getElementById('formPhone');
  const interestSelect = document.getElementById('formInterest');
  const messageInput = document.getElementById('formMessage');

  [nameInput, emailInput, messageInput].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const errSpan = document.getElementById(input.name + 'Error');
        if (errSpan) errSpan.textContent = '';
      });
    }
  });

  function clearAllErrors() {
    if (formError) {
      formError.style.display = 'none';
      formError.innerHTML = '';
    }
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
  }

  function setSubmittingState(isSubmitting) {
    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
      submitBtn.style.opacity = isSubmitting ? '0.75' : '';
      submitBtn.style.cursor = isSubmitting ? 'not-allowed' : 'pointer';
    }
    if (btnSpinner) {
      btnSpinner.style.display = isSubmitting ? 'inline-block' : 'none';
    }
    if (btnText) {
      btnText.textContent = isSubmitting ? 'Sending enquiry...' : 'Send enquiry';
    }
    if (btnArrow) {
      btnArrow.style.display = isSubmitting ? 'none' : 'inline-block';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    const nameVal = (nameInput ? nameInput.value : '').trim();
    const companyVal = (companyInput ? companyInput.value : '').trim();
    const emailVal = (emailInput ? emailInput.value : '').trim();
    const phoneVal = (phoneInput ? phoneInput.value : '').trim();
    const interestVal = (interestSelect ? interestSelect.value : '').trim();
    const messageVal = (messageInput ? messageInput.value : '').trim();
    const honeypotVal = form.querySelector('[name="_gotcha"]')?.value || '';

    let hasValidationError = false;

    if (!nameVal || nameVal.length < 2) {
      if (nameInput) nameInput.classList.add('input-error');
      const err = document.getElementById('nameError');
      if (err) err.textContent = 'Please enter your full name (at least 2 characters).';
      hasValidationError = true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailPattern.test(emailVal)) {
      if (emailInput) emailInput.classList.add('input-error');
      const err = document.getElementById('emailError');
      if (err) err.textContent = 'Please enter a valid work email address.';
      hasValidationError = true;
    }

    if (!messageVal || messageVal.length < 10) {
      if (messageInput) messageInput.classList.add('input-error');
      const err = document.getElementById('messageError');
      if (err) err.textContent = 'Please describe your requirement (minimum 10 characters).';
      hasValidationError = true;
    }

    if (hasValidationError) {
      if (formError) {
        formError.innerHTML = '<b>Please check the highlighted fields</b> Complete all required details before submitting.';
        formError.style.display = 'block';
      }
      return;
    }

    const payload = {
      name: nameVal,
      company: companyVal,
      email: emailVal,
      phone: phoneVal,
      interest: interestVal,
      message: messageVal,
      _gotcha: honeypotVal
    };

    setSubmittingState(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (response.ok && result.success) {
        showThankYouModal();
        form.reset();
        if (interestSelect) {
          interestSelect.selectedIndex = 0;
        }
        clearAllErrors();
      } else {
        const errorMsg = result.message || 'We were unable to process your enquiry at this moment. Please try again or reach out to us directly.';
        if (formError) {
          formError.innerHTML = `<b>Submission Failed</b>${errorMsg}`;
          formError.style.display = 'block';
          formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    } catch (networkError) {
      if (formError) {
        formError.innerHTML = '<b>Network Connection Error</b>Unable to connect to the enquiry service. Please check your internet connection and try again.';
        formError.style.display = 'block';
        formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } finally {
      setSubmittingState(false);
    }
  });
});
