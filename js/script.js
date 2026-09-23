document.addEventListener('DOMContentLoaded', () => {
    console.log('Dr. Sudhir Shah Website Initialized');
    
    // Sticky header shadow transition on scroll
    const headerEl = document.querySelector('header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    window.addEventListener('scroll', () => {
        // Toggle sticky header shadow
        if (headerEl) {
            if (window.scrollY > 20) {
                headerEl.classList.add('header-scrolled');
            } else {
                headerEl.classList.remove('header-scrolled');
            }
        }
        
        // Toggle Scroll to Top Button visibility past hero section
        if (scrollToTopBtn) {
            if (window.scrollY > 500) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        }
    });

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Mobile navigation toggling
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Close menu when clicking a nav item
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Smooth scrolling with sticky header offset for all internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                // Calculate position with sticky header offset
                const stickyHeader = document.querySelector('header');
                const headerHeight = stickyHeader ? stickyHeader.offsetHeight : 80;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 16; // Add extra padding
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Appointment Form Validation & Handler
    const appointmentForm = document.getElementById('appointmentForm');
    const fullNameInput = document.getElementById('fullName');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const serviceSelect = document.getElementById('service');
    const preferredDateInput = document.getElementById('preferredDate');

    // Modal elements (keeping variables intact for compatibility)
    const successModal = document.getElementById('bookingSuccessModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    // Inline validation helpers
    const setFieldError = (inputEl, errorId, hasError) => {
        const group = inputEl.closest('.form-group');
        if (hasError) {
            group.classList.add('has-error');
        } else {
            group.classList.remove('has-error');
        }
    };

    // Global/Reusable Premium Toast System
    window.showToast = function(title, message, type = 'info', duration = null) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Limit to max 3 visible toasts
        const existingToasts = container.querySelectorAll('.toast');
        if (existingToasts.length >= 3) {
            const oldestToast = existingToasts[0];
            oldestToast.classList.add('hide');
            setTimeout(() => oldestToast.remove(), 300);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.setAttribute('aria-live', 'polite');

        // Select the icon SVG based on type
        let iconSvg = '';
        if (type === 'success') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        } else if (type === 'info') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        } else if (type === 'warning') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        } else if (type === 'error') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        } else if (type === 'loading') {
            iconSvg = `<svg class="toast-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke-dasharray="16 4"></circle></svg>`;
        } else if (type === 'dark') {
            iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        }

        toast.innerHTML = `
            <div class="toast-icon-wrapper">
                ${iconSvg}
            </div>
            <div class="toast-content">
                <h4 class="toast-title">${title}</h4>
                <p class="toast-message">${message}</p>
            </div>
            <button class="toast-close-btn" aria-label="Close notification">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            ${type !== 'loading' ? '<div class="toast-progress"></div>' : ''}
        `;

        container.appendChild(toast);

        // Force reflow
        toast.offsetHeight;
        toast.classList.add('show');

        let autoDismissTimer = null;

        // Resolve Auto-dismiss duration
        let resolvedDuration = duration;
        if (resolvedDuration === null) {
            if (type === 'success') resolvedDuration = 5000;
            else if (type === 'info') resolvedDuration = 4000;
            else if (type === 'warning') resolvedDuration = 5000;
            else if (type === 'error') resolvedDuration = 5000;
            else if (type === 'dark') resolvedDuration = 4000;
        }

        // Animate progress bar if timed dismiss
        if (resolvedDuration && type !== 'loading') {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.animation = `toastProgress ${resolvedDuration}ms linear forwards`;
            }

            autoDismissTimer = setTimeout(() => {
                dismiss();
            }, resolvedDuration);
        }

        function dismiss() {
            if (autoDismissTimer) clearTimeout(autoDismissTimer);
            toast.classList.add('hide');
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }

        // Handle Manual Close
        const closeBtn = toast.querySelector('.toast-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dismiss();
            });
        }

        return {
            element: toast,
            dismiss: dismiss
        };
    };

    // Inline input listeners to clear errors on user typing/choosing
    if (fullNameInput) {
        fullNameInput.addEventListener('input', () => {
            if (fullNameInput.value.trim().length >= 2) {
                setFieldError(fullNameInput, 'fullNameError', false);
            }
        });
    }
    if (phoneNumberInput) {
        phoneNumberInput.addEventListener('input', () => {
            if (phoneNumberInput.value.trim().replace(/[^0-9]/g, '').length >= 7) {
                setFieldError(phoneNumberInput, 'phoneNumberError', false);
            }
        });
    }
    if (serviceSelect) {
        serviceSelect.addEventListener('change', () => {
            if (serviceSelect.value !== '') {
                setFieldError(serviceSelect, 'serviceError', false);
            }
        });
    }
    if (preferredDateInput) {
        preferredDateInput.addEventListener('change', () => {
            if (preferredDateInput.value !== '') {
                setFieldError(preferredDateInput, 'preferredDateError', false);
            }
        });
    }

    // Form submission flow
    let isSubmitting = false;
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (isSubmitting) return;

            const fullName = fullNameInput.value.trim();
            const phoneNumber = phoneNumberInput.value.trim();
            const selectedService = serviceSelect.value;
            const bsDate = preferredDateInput.value.trim();

            // STEP 1: Form Validation Checks
            let errors = [];

            if (!fullName) {
                errors.push({
                    input: fullNameInput,
                    title: "Please Check Your Details",
                    message: "Please enter your full name.",
                    type: 'error',
                    errorId: 'fullNameError'
                });
            } else if (fullName.length < 2) {
                errors.push({
                    input: fullNameInput,
                    title: "Invalid Full Name",
                    message: "Please enter a valid full name.",
                    type: 'error',
                    errorId: 'fullNameError'
                });
            } else {
                setFieldError(fullNameInput, 'fullNameError', false);
            }

            if (!phoneNumber) {
                errors.push({
                    input: phoneNumberInput,
                    title: "Please Check Your Details",
                    message: "Please enter your phone number.",
                    type: 'error',
                    errorId: 'phoneNumberError'
                });
            } else if (phoneNumber.replace(/[^0-9]/g, '').length < 7) {
                errors.push({
                    input: phoneNumberInput,
                    title: "Invalid Phone Number",
                    message: "Please enter a valid phone number (at least 7 digits).",
                    type: 'error',
                    errorId: 'phoneNumberError'
                });
            } else {
                setFieldError(phoneNumberInput, 'phoneNumberError', false);
            }

            if (!selectedService) {
                errors.push({
                    input: serviceSelect,
                    title: "Please Check Your Details",
                    message: "Please select a service.",
                    type: 'warning',
                    errorId: 'serviceError'
                });
            } else {
                setFieldError(serviceSelect, 'serviceError', false);
            }

            if (!bsDate) {
                errors.push({
                    input: preferredDateInput,
                    title: "Please Check Your Details",
                    message: "Please select your preferred appointment date.",
                    type: 'warning',
                    errorId: 'preferredDateError'
                });
            } else {
                setFieldError(preferredDateInput, 'preferredDateError', false);
            }

            // Check if full form is completely empty
            if (!fullName && !phoneNumber && !selectedService && !bsDate) {
                showToast("Please Check Your Details", "Please complete all required appointment fields.", "warning");
                setFieldError(fullNameInput, 'fullNameError', true);
                setFieldError(phoneNumberInput, 'phoneNumberError', true);
                setFieldError(serviceSelect, 'serviceError', true);
                setFieldError(preferredDateInput, 'preferredDateError', true);
                return;
            }

            if (errors.length > 0) {
                errors.forEach((err, idx) => {
                    setFieldError(err.input, err.errorId, true);
                    if (idx < 3) {
                        showToast(err.title, err.message, err.type);
                    }
                });
                return;
            }

            // STEP 2: Loading State
            isSubmitting = true;

            const submitBtn = appointmentForm.querySelector('.submit-btn');
            const btnText = submitBtn.querySelector('.submit-btn-text');
            const originalText = btnText ? btnText.textContent : "Book Appointment on WhatsApp";

            if (btnText) {
                btnText.textContent = "Opening WhatsApp...";
            }
            submitBtn.disabled = true;

            // Show Premium Loading Toast
            const loadingToast = showToast("Please Wait", "Opening WhatsApp...", "loading");

            // Build encoded message template
            const serviceLabel = serviceSelect.options[serviceSelect.selectedIndex].text;
            const waMessage = 
`Hello Dr. Sudhir Shah,

I would like to book an appointment.

Patient Name: ${fullName}
Phone Number: ${phoneNumber}
Service: ${serviceLabel}
Preferred Date (BS): ${bsDate}

Please confirm my appointment.

Thank you.`;

            const encodedMessage = encodeURIComponent(waMessage);
            const waUrl = `https://wa.me/9779702056299?text=${encodedMessage}`;

            // STEP 3 & 4: Redirect and update states
            setTimeout(() => {
                // Open WhatsApp link
                window.open(waUrl, '_blank');

                // Dismiss loading toast
                loadingToast.dismiss();

                // Show Success / Ready State Toast
                showToast(
                    "Appointment Request Ready", 
                    "Your appointment request is ready in WhatsApp. Please send the message to complete your request.", 
                    "success"
                );

                // STEP 19: Reset form with a safe visual buffer
                setTimeout(() => {
                    appointmentForm.reset();
                    document.querySelectorAll('.form-group').forEach(group => {
                        group.classList.remove('has-error');
                    });
                }, 1000);

                // Restore button loading state
                setTimeout(() => {
                    if (btnText) {
                        btnText.textContent = "Book Appointment →";
                    }
                    submitBtn.disabled = false;
                    isSubmitting = false;
                }, 2500);

            }, 1200);
        });
    }

    // Modal Close trigger handlers (for existing index.html modal compatibility)
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (successModal) successModal.classList.remove('active');
        });
    }
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.classList.remove('active');
            }
        });
    }

    // Intersection Observer for Scroll Animations (Service Items and Testimonial Cards)
    const animatedElements = document.querySelectorAll('.service-item-compact, .testimonial-card');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target); // Stop observing once revealed
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% of the element is visible in the viewport
        rootMargin: '0px 0px -40px 0px' // Slightly offset the trigger point for a natural scrolling feel
    });

    animatedElements.forEach(el => {
        revealObserver.observe(el);
    });
});

