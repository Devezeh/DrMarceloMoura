/**
 * Script for Dr. Marcelo Moura Website
 * Version: 1.2 - Added dynamic date update, improved comments, minor refactoring.
 */

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Smooth Scrolling for Internal Links
     * Finds all links starting with '#' and scrolls smoothly to the target element,
     * accounting for the sticky header height.
     */
    const smoothScrollHandler = () => {
        const internalLinks = document.querySelectorAll('a[href^="#"]');

        internalLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                // Ensure it's a valid internal link (e.g., #contato, not just #)
                if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        e.preventDefault(); // Prevent default jump

                        // Calculate offset considering sticky header
                        const header = document.querySelector('.site-header');
                        const headerOffset = header ? header.offsetHeight : 0;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        // Add window.pageYOffset for absolute position, subtract header, add small buffer
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 10;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });

                        // Optional: Close mobile menu if open (implementation needed if menu exists)
                        // closeMobileMenu();

                        // Update navigation active state immediately after click for better UX
                        updateNavActiveStateOnClick(this);
                    }
                }
            });
        });
    };

    /**
     * Updates the active state ('active' class, aria-current) in the main navigation
     * immediately when a nav link or a button pointing to a section is clicked.
     * @param {HTMLElement} clickedElement - The link or button that was clicked.
     */
    const updateNavActiveStateOnClick = (clickedElement) => {
        const targetId = clickedElement.getAttribute('href');
        if (!targetId || !targetId.startsWith('#')) return;

        const navLinks = document.querySelectorAll('.main-nav .nav-link');

        navLinks.forEach(nav => {
            nav.classList.remove('active');
            nav.removeAttribute('aria-current');
        });

        // Find the corresponding nav link for the clicked target
        const correspondingNavLink = document.querySelector(`.main-nav .nav-link[href="${targetId}"]`);
        if (correspondingNavLink) {
            correspondingNavLink.classList.add('active');
            correspondingNavLink.setAttribute('aria-current', 'page');
        }
    };


    /**
     * Updates Active Navigation Link based on Scroll Position
     * Highlights the navigation link corresponding to the section currently in view.
     */
    const scrollSpyHandler = () => {
        const sections = document.querySelectorAll('main section[id]'); // Target sections within main
        const navLinks = document.querySelectorAll('.main-nav .nav-link[href^="#"]');
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        let currentSectionId = '';

        // Determine which section is currently in view
        const scrollPosition = window.pageYOffset + headerHeight + 50; // Offset to trigger earlier

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Special case: If scrolled close to the bottom, activate the last nav link
        if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 50) {
             const lastSectionNavLink = Array.from(navLinks).reverse().find(link => {
                 const href = link.getAttribute('href');
                 // Ensure the link points to an existing section ID on the page
                 return href && href.startsWith('#') && href.length > 1 && document.getElementById(href.substring(1));
             });
             if (lastSectionNavLink) {
                 currentSectionId = lastSectionNavLink.getAttribute('href').substring(1);
             }
        }

        // Update nav links based on the current section
        let foundActive = false;
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            link.classList.remove('active');
            link.removeAttribute('aria-current');

            if (linkHref === `#${currentSectionId}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
                foundActive = true;
            }
        });

        // Special case: If scrolled to the very top or above the first section, activate 'Início'
        const firstSection = sections[0];
        const firstSectionTop = firstSection ? firstSection.offsetTop : 0;
        if (!foundActive && window.pageYOffset < firstSectionTop - headerHeight) {
            const homeLink = document.querySelector('.main-nav .nav-link[href="#home"]');
            if (homeLink) {
                // Ensure others are inactive first
                 navLinks.forEach(link => {
                     link.classList.remove('active');
                     link.removeAttribute('aria-current');
                 });
                homeLink.classList.add('active');
                homeLink.setAttribute('aria-current', 'page');
            }
        }
    };

    /**
     * Throttles the execution of a function. Ensures that the function is
     * not called more frequently than the specified delay.
     * @param {Function} func - The function to throttle.
     * @param {number} delay - The throttle delay in milliseconds.
     * @returns {Function} - The throttled function.
     */
    const throttle = (func, delay) => {
        let timeoutId = null;
        let lastExecTime = 0;

        return function(...args) {
            const context = this;
            const currentTime = Date.now();

            const execute = () => {
                func.apply(context, args);
                lastExecTime = currentTime;
            };

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            if (currentTime - lastExecTime >= delay) {
                execute();
            } else {
                timeoutId = setTimeout(execute, delay);
            }
        };
    };

    // Attach throttled scroll listener
    const throttledScrollSpy = throttle(scrollSpyHandler, 150); // Adjust delay as needed
    window.addEventListener('scroll', throttledScrollSpy);


    /**
     * Updates the Copyright Year
     * Finds all elements designated to display the year and updates them.
     */
    const updateCopyrightYear = () => {
        // Selects elements with IDs 'current-year' OR 'current-year-footer'
        const yearSpans = document.querySelectorAll('#current-year, #current-year-footer');
        if (yearSpans.length > 0) {
            const currentYear = new Date().getFullYear();
            yearSpans.forEach(span => {
                span.textContent = currentYear;
            });
        }
    };

    /**
     * Updates the LGPD Last Updated Date
     * Finds the <time> element in lgpd.html and sets its text and datetime attribute.
     */
    const updateLgpdDate = () => {
        const lgpdDateElement = document.getElementById('lgpd-update-date');
        if (lgpdDateElement) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(now.getDate()).padStart(2, '0');

            const formattedDate = `${day}/${month}/${year}`; // Format for display (DD/MM/YYYY)
            const isoDate = `${year}-${month}-${day}`; // Format for datetime attribute (YYYY-MM-DD)

            lgpdDateElement.textContent = formattedDate;
            lgpdDateElement.setAttribute('datetime', isoDate);
        }
    };


    // --- Initializations ---
    smoothScrollHandler();
    scrollSpyHandler(); // Initial call to set active link on page load/refresh
    updateCopyrightYear();
    updateLgpdDate(); // Update date specifically on the LGPD page if element exists

}); // End DOMContentLoaded
