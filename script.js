/* ========================================
   DHFLIXPRO - Script
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {


    // ===========================
    // ELEMENTS
    // ===========================
    const ctaButton = document.getElementById('ctaButton');
    const premiumModal = document.getElementById('premiumModal');
    const premiumClose = document.getElementById('premiumClose');
    const btnPremium = document.getElementById('btnPremium');
    const btnSerieOnly = document.getElementById('btnSerieOnly');
    const exitModal = document.getElementById('exitModal');
    const exitClose = document.getElementById('exitClose');
    const btnExitAccept = document.getElementById('btnExitAccept');
    const btnExitReject = document.getElementById('btnExitReject');

    let exitShown = false;

    // ===========================
    // CAROUSEL AUTO-SLIDE
    // ===========================
    const track = document.getElementById('carouselTrack');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 3500);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    // Dot click navigation
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            goToSlide(index);
            startAutoSlide(); // reset timer
        });
    });

    // Touch/swipe support for carousel
    if (track) {
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    goToSlide(currentSlide + 1);
                } else {
                    goToSlide(currentSlide - 1);
                }
            }
            startAutoSlide();
        }, { passive: true });
    }

    // Start auto-slide
    startAutoSlide();

    // ===========================
    // CTA -> PREMIUM MODAL
    // ===========================
    ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(premiumModal);
    });

    premiumClose.addEventListener('click', () => {
        closeModal(premiumModal);
    });

    // Premium button -> payment
    btnPremium.addEventListener('click', () => {
        const params = window.location.search ? '&' + window.location.search.substring(1) : '';
        window.location.href = 'https://pay.lowify.com.br/checkout?product_id=WjRVtY' + params;
    });

    // Somente a série -> payment
    btnSerieOnly.addEventListener('click', () => {
        const params = window.location.search ? '&' + window.location.search.substring(1) : '';
        window.location.href = 'https://pay.lowify.com.br/checkout?product_id=LwmOnf' + params;
    });

    // ===========================
    // EXIT INTENT DETECTION
    // ===========================

    let pageLoadTime = Date.now();
    let exitModalCooldown = false;

    // -------------------------------------------------------
    // MOBILE: Botão voltar do navegador (principal método)
    // Empurra 2 estados no histórico pra garantir que o
    // usuário não saia da página na primeira tentativa
    // -------------------------------------------------------
    if (window.history && window.history.pushState) {
        // Empurra 2 estados falsos no histórico
        window.history.pushState({ page: 'dhflixpro-1' }, '', '');
        window.history.pushState({ page: 'dhflixpro-2' }, '', '');

        window.addEventListener('popstate', (e) => {
            // Previne saída: empurra estado de volta imediatamente
            window.history.pushState({ page: 'dhflixpro-2' }, '', '');

            // Só mostra o modal se:
            // - Ainda não foi mostrado OU já fechou e pode mostrar de novo
            // - Nenhum modal está aberto
            // - Sem cooldown (evita disparos múltiplos rápidos)
            if (!exitShown && !isModalOpen() && !exitModalCooldown) {
                exitModalCooldown = true;
                showExitModal();

                // Cooldown de 2s pra evitar disparos múltiplos
                setTimeout(() => {
                    exitModalCooldown = false;
                }, 2000);
            }
        });
    }

    // -------------------------------------------------------
    // DESKTOP: Mouse saindo do documento pelo topo
    // Só dispara após 10s na página e quando sai pela borda
    // superior (indica intenção de fechar/mudar de aba)
    // -------------------------------------------------------
    document.addEventListener('mouseleave', (e) => {
        const timeOnPage = Date.now() - pageLoadTime;
        if (e.clientY <= 0 && !exitShown && !isModalOpen() && timeOnPage > 10000) {
            showExitModal();
        }
    });

    function showExitModal() {
        exitShown = true;
        openModal(exitModal);
    }

    // Exit modal buttons
    exitClose.addEventListener('click', () => {
        closeModal(exitModal);
    });

    btnExitAccept.addEventListener('click', () => {
        const params = window.location.search ? '&' + window.location.search.substring(1) : '';
        window.location.href = 'https://pay.lowify.com.br/checkout?product_id=QED0NE' + params;
    });

    btnExitReject.addEventListener('click', () => {
        closeModal(exitModal);
    });

    // ===========================
    // CLOSE ON OVERLAY / ESC
    // ===========================
    premiumModal.addEventListener('click', (e) => {
        if (e.target === premiumModal) closeModal(premiumModal);
    });

    exitModal.addEventListener('click', (e) => {
        if (e.target === exitModal) closeModal(exitModal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (premiumModal.classList.contains('active')) closeModal(premiumModal);
            if (exitModal.classList.contains('active')) closeModal(exitModal);
        }
    });

    // ===========================
    // MODAL HELPERS
    // ===========================
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    function isModalOpen() {
        return premiumModal.classList.contains('active') || exitModal.classList.contains('active');
    }

    // ===========================
    // SCROLL REVEAL ANIMATIONS
    // ===========================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    // Animate features
    document.querySelectorAll('.features-list li').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `all 0.4s ease ${index * 0.1}s`;
        observer.observe(item);
    });
});
