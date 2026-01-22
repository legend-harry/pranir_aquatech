// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.querySelector('.nav-menu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');
    });
}

// AR/VR Parallax Scrolling Effect
const parallaxElements = document.querySelectorAll('[data-parallax]');
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    parallaxElements.forEach(element => {
        const speed = element.dataset.parallax || 0.5;
        element.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Mouse Tracking for 3D Card Effects
const solutionCards = document.querySelectorAll('.solution-card');
solutionCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        }
    });
});

// Smooth scroll for buttons with data-scroll-target
document.querySelectorAll('[data-scroll-target]').forEach(button => {
    button.addEventListener('click', (e) => {
        const targetSelector = button.getAttribute('data-scroll-target');
        const target = document.querySelector(targetSelector);
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

// Navbar Background on Scroll
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 20px rgba(0, 102, 204, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.solution-card, .testimonial-card, .feature-content, .sustainability-content, .register-card, .register-copy').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Counter Animation for Stats
const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };

    updateCounter();
};

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber) {
                const targetText = statNumber.textContent;
                const targetNumber = parseInt(targetText.replace(/\D/g, ''));
                if (!isNaN(targetNumber)) {
                    statNumber.textContent = '0';
                    animateCounter(statNumber, targetNumber);
                    setTimeout(() => {
                        statNumber.textContent = targetText;
                    }, 2000);
                }
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-item').forEach(stat => {
    statsObserver.observe(stat);
});

// Form Validation (if forms are added later)
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Handle early access form submission
const earlyAccessForm = document.getElementById('earlyAccessForm');
const formFeedback = document.getElementById('formFeedback');

if (earlyAccessForm) {
    earlyAccessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = earlyAccessForm.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            formFeedback.textContent = 'Please enter a valid work email.';
            formFeedback.className = 'form-feedback error';
            emailInput.focus();
            return;
        }

        formFeedback.textContent = 'Thanks! You’re on the list. We’ll reach out shortly.';
        formFeedback.className = 'form-feedback success';
        earlyAccessForm.reset();
    });
}

// Button Click Handlers
document.querySelectorAll('.btn-primary, .btn-primary-large').forEach(button => {
    button.addEventListener('click', (e) => {
        if (!button.closest('form')) {
            // Add your button action here
            // For demo purposes, scroll to contact section or show modal
        }
    });
});

// Dynamic Year in Footer
const currentYear = new Date().getFullYear();
const footerYear = document.querySelector('.footer-bottom p');
if (footerYear) {
    footerYear.textContent = footerYear.textContent.replace('2026', currentYear);
}

// Parallax Effect for Hero Section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const waveAnimation = document.querySelector('.wave-animation');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }
    
    if (waveAnimation) {
        waveAnimation.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Add active state to navigation based on scroll position
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 150;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.style.color = 'var(--primary-blue)';
                } else {
                    link.style.color = 'var(--dark-gray)';
                }
            });
        }
    });
});

// Loading Animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Cost Simulation Interactive Effects
const costMetricCards = document.querySelectorAll('.cost-metric-card');

if (costMetricCards.length > 0) {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, observerOptions);

    costMetricCards.forEach(card => observer.observe(card));

    // Enhanced hover effect with smooth transitions
    costMetricCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Animate bar fill on hover
            const barFill = card.querySelector('.bar-fill');
            if (barFill) {
                barFill.style.animation = 'none';
                setTimeout(() => {
                    barFill.style.animation = 'barGrowth 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
                }, 10);
            }

            // Subtle scale and glow effect
            card.style.transform = 'translateY(-12px) scale(1.02)';
            
            // Pulse effect on metric value
            const metricValue = card.querySelector('.metric-value');
            if (metricValue) {
                metricValue.style.color = 'rgba(126, 200, 255, 1)';
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            const metricValue = card.querySelector('.metric-value');
            if (metricValue) {
                metricValue.style.color = '';
            }
        });
    });
}

// Animate shader lights on mouse move for dynamic effect
document.addEventListener('mousemove', (e) => {
    const shaderLights = document.querySelectorAll('.shader-light');
    
    if (shaderLights.length > 0) {
        const xPercent = (e.clientX / window.innerWidth) * 20;
        const yPercent = (e.clientY / window.innerHeight) * 20;

        shaderLights.forEach((light, index) => {
            // Subtle movement based on light position
            const sensitivity = 0.5 + (index * 0.2);
            light.style.transform = `translate(${xPercent * sensitivity}px, ${yPercent * sensitivity}px)`;
        });
    }
});

// Smooth number counter for savings display
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = '₹' + value.toLocaleString('en-IN');
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

// Trigger number animation on scroll into view
const totalSavingsCard = document.querySelector('.total-savings-card');
if (totalSavingsCard) {
    const savingsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const savingsAmount = entry.target.querySelector('.savings-amount-total');
                if (savingsAmount && !savingsAmount.hasAttribute('data-animated')) {
                    savingsAmount.setAttribute('data-animated', 'true');
                    animateValue(savingsAmount, 0, 13600000, 2000);
                }
                savingsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    savingsObserver.observe(totalSavingsCard);
}


// Tech Cards Modal System
const techModal = document.getElementById('techModal');

if (techModal) {
    const techCards = document.querySelectorAll('.tech-card');
    const modalClose = document.querySelector('.tech-modal-close');

    const techData = {
        apps: {
            title: '📱 Smart Farm Management Apps',
            features: [
                'Real-time expense tracking with AI-powered insights and budget alerts',
                'Complete pond inventory management with stock levels and health monitoring',
                'Worker tracking and task assignment with performance analytics',
                'Automated reporting with customizable dashboards',
                'Mobile-first design for on-the-go farm management',
                'Integrated chatbot for instant answers and guidance',
                'Disease detection and stage identification with image recognition',
                'Multi-pond comparison and yield optimization tools'
            ],
            images: [
                'ai-aqua-app/Public/app_images/DashBoard.png',
                'ai-aqua-app/Public/app_images/Chatbot.png',
                'ai-aqua-app/Public/app_images/Documents_Upload.png',
                'ai-aqua-app/Public/app_images/CreationSummary.png'
            ]
        },
        iot: {
            title: '📡 IoT Sensor Network',
            features: [
                'Advanced water quality sensors (DO, pH, temperature, salinity)',
                'Real-time data streaming with 99.9% uptime',
                'Low-power consumption with solar charging options',
                'Weatherproof and corrosion-resistant design',
                'Wireless connectivity with long-range transmission',
                'Automatic calibration and self-diagnostics',
                'Multi-parameter monitoring from single device',
                'Cloud-based data storage with historical analytics'
            ],
            images: [
                'ai-aqua-app/Public/app_images/ParameterLogging.png',
                'ai-aqua-app/Public/app_images/Mineral_graphs.png',
                'ai-aqua-app/Public/app_images/Step1_Pond_creation.png',
                'ai-aqua-app/Public/app_images/Step2_pond_creation.png'
            ]
        },
        ai: {
            title: '🤖 AI-Powered Intelligence',
            features: [
                'Predictive analytics for disease outbreak prevention',
                'Smart feeding recommendations based on growth patterns',
                'Harvest optimization with yield forecasting',
                'Pattern recognition for early problem detection',
                'Cost-benefit analysis and ROI predictions',
                'Automated alerts for critical parameter changes',
                'Machine learning models trained on aquaculture data',
                'Personalized insights tailored to your farm conditions'
            ],
            images: [
                'ai-aqua-app/Public/app_images/Step3_Pond_creation.png',
                'ai-aqua-app/Public/app_images/Step4_pondCreation.png',
                'ai-aqua-app/Public/app_images/DashBoard.png',
                'ai-aqua-app/Public/app_images/Mineral_graphs.png'
            ]
        }
    };

    function typeText(element, text, speed = 30) {
        return new Promise((resolve) => {
            let index = 0;
            element.textContent = '';
            element.classList.add('typing-text');
            
            const interval = setInterval(() => {
                if (index < text.length) {
                    element.textContent += text[index];
                    index++;
                } else {
                    clearInterval(interval);
                    element.classList.remove('typing-text');
                    resolve();
                }
            }, speed);
        });
    }

    let currentSlideIndex = 0;
    let currentImages = [];

    async function showTechModal(techType) {
        const data = techData[techType];
        if (!data) return;
        
        const modalTitle = document.querySelector('.tech-modal-title');
        const modalDescription = document.querySelector('.tech-modal-description');
        const modalImages = document.querySelector('.tech-modal-images');
        
        // Clear previous content
        modalDescription.innerHTML = '';
        modalImages.innerHTML = '';
        currentSlideIndex = 0;
        currentImages = data.images;
        
        // Set title
        modalTitle.textContent = data.title;
        
        // Show modal
        techModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${window.scrollY}px`;
        
        // Display all features at once with fade-in animation
        data.features.forEach((feature, i) => {
            const featurePoint = document.createElement('div');
            featurePoint.className = 'feature-point';
            featurePoint.style.animationDelay = `${i * 0.05}s`;
            featurePoint.style.opacity = '0';
            featurePoint.style.animation = 'fadeInUp 0.5s ease forwards';
            featurePoint.style.animationDelay = `${i * 0.1}s`;
            
            const bullet = document.createElement('div');
            bullet.className = 'bullet';
            
            const textContainer = document.createElement('div');
            textContainer.textContent = feature;
            
            featurePoint.appendChild(bullet);
            featurePoint.appendChild(textContainer);
            modalDescription.appendChild(featurePoint);
        });
        
        // Create slideshow container
        const slideshowContainer = document.createElement('div');
        slideshowContainer.className = 'slideshow-container';
        
        // Add images
        data.images.forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = `${data.title} screenshot ${index + 1}`;
            img.className = 'slideshow-image';
            if (index === 0) img.classList.add('active');
            img.addEventListener('click', () => openLightbox(imgSrc));
            slideshowContainer.appendChild(img);
        });
        
        // Add navigation buttons if more than 1 image
        if (data.images.length > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'slideshow-nav slideshow-prev';
            prevBtn.innerHTML = '❮';
            prevBtn.addEventListener('click', () => changeSlide(-1));
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'slideshow-nav slideshow-next';
            nextBtn.innerHTML = '❯';
            nextBtn.addEventListener('click', () => changeSlide(1));
            
            const counter = document.createElement('div');
            counter.className = 'slideshow-counter';
            counter.id = 'slideshow-counter';
            counter.textContent = `1 / ${data.images.length}`;
            
            slideshowContainer.appendChild(prevBtn);
            slideshowContainer.appendChild(nextBtn);
            slideshowContainer.appendChild(counter);
        }
        
        modalImages.appendChild(slideshowContainer);
    }

    function changeSlide(direction) {
        const slides = document.querySelectorAll('.slideshow-image');
        slides[currentSlideIndex].classList.remove('active');
        
        currentSlideIndex += direction;
        if (currentSlideIndex >= slides.length) currentSlideIndex = 0;
        if (currentSlideIndex < 0) currentSlideIndex = slides.length - 1;
        
        slides[currentSlideIndex].classList.add('active');
        
        const counter = document.getElementById('slideshow-counter');
        if (counter) {
            counter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
        }
    }

    function openLightbox(imgSrc) {
        let lightbox = document.getElementById('image-lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'image-lightbox';
            lightbox.className = 'image-lightbox';
            
            const img = document.createElement('img');
            img.className = 'lightbox-image';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'lightbox-close';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', closeLightbox);
            
            lightbox.appendChild(img);
            lightbox.appendChild(closeBtn);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
            
            document.body.appendChild(lightbox);
        }
        
        const img = lightbox.querySelector('.lightbox-image');
        img.src = imgSrc;
        lightbox.classList.add('active');
    }

    function closeLightbox() {
        const lightbox = document.getElementById('image-lightbox');
        if (lightbox) {
            lightbox.classList.remove('active');
        }
    }

    function closeTechModal() {
        techModal.classList.remove('active');
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    // Event listeners for tech cards
    techCards.forEach(card => {
        card.addEventListener('click', () => {
            const techType = card.dataset.tech;
            showTechModal(techType);
        });
    });

    // Event listeners for demo buttons on home page
    document.querySelectorAll('[data-tech-demo]').forEach(button => {
        button.addEventListener('click', () => {
            const techType = button.dataset.techDemo;
            showTechModal(techType);
        });
    });

    // Close modal
    if (modalClose) {
        modalClose.addEventListener('click', closeTechModal);
    }

    // Close on outside click
    techModal.addEventListener('click', (e) => {
        if (e.target === techModal) {
            closeTechModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && techModal.classList.contains('active')) {
            closeTechModal();
        }
    });
}

