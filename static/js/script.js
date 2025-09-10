// Countdown Timer Functionality
function updateCountdown() {
    // Calculate days until the festival (using a future date)
    const festivalDate = new Date('2025-06-15'); // Example festival date
    const now = new Date();
    const timeDiff = festivalDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    const countdownElement = document.getElementById('countdown-text');
    if (countdownElement) {
        if (daysDiff > 0) {
            countdownElement.textContent = `${daysDiff} DAYS UNTIL KICKOFF`;
        } else if (daysDiff === 0) {
            countdownElement.textContent = 'FESTIVAL TODAY!';
        } else {
            countdownElement.textContent = 'FESTIVAL HAS ENDED';
        }
    }
}

// Button Click Animations
function addButtonAnimations() {
    const buttons = document.querySelectorAll('.btn, .nav-link');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Feature Card Hover Effects
function addFeatureCardEffects() {
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Smooth Scroll Animation for Internal Links
function addSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateCountdown();
    addButtonAnimations();
    addFeatureCardEffects();
    addSmoothScroll();
    
    // Update countdown every hour
    setInterval(updateCountdown, 3600000);
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .feature-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .sponsor-logo:hover {
        animation: wiggle 0.5s ease-in-out;
    }
    
    @keyframes wiggle {
        0%, 100% { transform: rotate(0deg) scale(1.05); }
        25% { transform: rotate(1deg) scale(1.05); }
        75% { transform: rotate(-1deg) scale(1.05); }
    }
`;
document.head.appendChild(style);
