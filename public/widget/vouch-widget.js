/**
 * Vouch Widget SDK
 * Elite Glassmorphic Review Widget
 * Studio Elite Design - backdrop-blur-[20px], sharp edges
 */
(function() {
    'use strict';
    
    // Get configuration from script tag data attributes
    const script = document.currentScript || document.querySelector('script[data-widget-id]');
    if (!script) return;
    
    const VOUCH_WIDGET_CONFIG = {
        widgetId: script.getAttribute('data-widget-id'),
        userId: script.getAttribute('data-user-id'),
        theme: script.getAttribute('data-theme') || 'auto',
        position: script.getAttribute('data-position') || 'bottom-right',
        apiUrl: script.getAttribute('data-api-url') || window.location.origin,
    };
    
    if (!VOUCH_WIDGET_CONFIG.widgetId) {
        console.error('Vouch Widget: widget-id is required');
        return;
    }
    
    // Fetch reviews from Convex public endpoint
    async function fetchReviews() {
        try {
            const response = await fetch(
                `${VOUCH_WIDGET_CONFIG.apiUrl}/api/public/reviews?widgetId=${VOUCH_WIDGET_CONFIG.widgetId}`
            );
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Vouch Widget: Failed to fetch reviews', error);
            return [];
        }
    }
    
    // Determine theme (light/dark)
    function getTheme() {
        if (VOUCH_WIDGET_CONFIG.theme === 'light') return 'light';
        if (VOUCH_WIDGET_CONFIG.theme === 'dark') return 'dark';
        // Auto: detect system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Get position classes
    function getPositionClasses() {
        const positions = {
            'bottom-right': 'bottom: 20px; right: 20px;',
            'bottom-left': 'bottom: 20px; left: 20px;',
            'top-right': 'top: 20px; right: 20px;',
            'top-left': 'top: 20px; left: 20px;',
        };
        return positions[VOUCH_WIDGET_CONFIG.position] || positions['bottom-right'];
    }
    
    // Render glassmorphic widget
    function renderWidget(reviews) {
        if (reviews.length === 0) return;
        
        // Remove existing widget if present
        const existing = document.getElementById('vouch-widget');
        if (existing) existing.remove();
        
        const widget = document.createElement('div');
        widget.id = 'vouch-widget';
        widget.className = 'vouch-widget';
        widget.setAttribute('data-theme', getTheme());
        
        widget.innerHTML = `
            <div class="vouch-widget-container">
                <div class="vouch-widget-header">
                    <div class="vouch-widget-logo">V</div>
                    <span class="vouch-widget-title">Reviews</span>
                    <button class="vouch-widget-close" aria-label="Close widget">×</button>
                </div>
                <div class="vouch-widget-body">
                    ${reviews.map(review => `
                        <div class="vouch-review-card">
                            <div class="vouch-review-header">
                                <div class="vouch-review-author">${escapeHtml(review.author)}</div>
                                <div class="vouch-review-rating">
                                    ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                                </div>
                            </div>
                            <div class="vouch-review-content">${escapeHtml(review.content)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
        
        // Close button handler
        const closeBtn = widget.querySelector('.vouch-widget-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => widget.remove());
        }
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Inject glassmorphic CSS (Studio Elite design)
    function injectStyles() {
        const styleId = 'vouch-widget-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .vouch-widget {
                position: fixed;
                ${getPositionClasses()}
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            }
            .vouch-widget-container {
                background: rgba(254, 249, 240, 0.6);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(0, 0, 0, 0.05);
                box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
                            inset 0 -1px 0 0 rgba(0, 0, 0, 0.05),
                            0 4px 20px rgba(0, 0, 0, 0.1);
                border-radius: 0;
                width: 320px;
                max-width: calc(100vw - 40px);
                max-height: 480px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .vouch-widget[data-theme="dark"] .vouch-widget-container {
                background: rgba(10, 10, 11, 0.6);
                border-color: rgba(255, 255, 255, 0.08);
            }
            .vouch-widget-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                font-weight: 600;
                font-size: 14px;
                letter-spacing: -0.01em;
            }
            .vouch-widget[data-theme="dark"] .vouch-widget-header {
                border-color: rgba(255, 255, 255, 0.08);
            }
            .vouch-widget-logo {
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 12px;
            }
            .vouch-widget-title {
                flex: 1;
            }
            .vouch-widget-close {
                background: none;
                border: none;
                font-size: 20px;
                line-height: 1;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            .vouch-widget-close:hover {
                opacity: 1;
            }
            .vouch-widget-body {
                overflow-y: auto;
                padding: 16px;
                max-height: 400px;
            }
            .vouch-review-card {
                padding: 12px 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }
            .vouch-widget[data-theme="dark"] .vouch-review-card {
                border-color: rgba(255, 255, 255, 0.08);
            }
            .vouch-review-card:last-child {
                border-bottom: none;
            }
            .vouch-review-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .vouch-review-author {
                font-weight: 500;
                font-size: 13px;
                letter-spacing: -0.01em;
            }
            .vouch-review-rating {
                font-size: 12px;
                color: #fbbf24;
            }
            .vouch-review-content {
                font-size: 13px;
                line-height: 1.5;
                color: rgba(0, 0, 0, 0.7);
                letter-spacing: -0.01em;
            }
            .vouch-widget[data-theme="dark"] .vouch-review-content {
                color: rgba(255, 255, 255, 0.7);
            }
            @media (max-width: 480px) {
                .vouch-widget-container {
                    width: calc(100vw - 40px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize widget
    async function init() {
        injectStyles();
        const reviews = await fetchReviews();
        renderWidget(reviews);
        
        // Listen for theme changes (auto mode)
        if (VOUCH_WIDGET_CONFIG.theme === 'auto') {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                const widget = document.getElementById('vouch-widget');
                if (widget) widget.setAttribute('data-theme', getTheme());
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
