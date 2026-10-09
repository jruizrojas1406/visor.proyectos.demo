// Interactions Module - Handles UI interactions and effects

// Add interactive effects
export function addInteractiveEffects() {
    addParallaxEffect();
    addSmoothScrollBehavior();
}

function addParallaxEffect() {
    // Add parallax effect to floating elements (if any exist)
    document.addEventListener('mousemove', function(e) {
        const floatingElements = document.querySelectorAll('.floating-element');
        if (floatingElements.length === 0) return;
        
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

function addSmoothScrollBehavior() {
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Handle window resize events
export function handleWindowResize() {
    window.addEventListener('resize', () => {
        setTimeout(() => {
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }, 100);
    });
}