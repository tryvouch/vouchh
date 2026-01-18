(function(window, document) {
    "use strict";

    const VOUCH_ORIGIN = document.currentScript?.getAttribute("data-origin") || "https://vouch-ai.com";

    function initVouchWidgets() {
        const containers = document.querySelectorAll("[data-vouch-id]");

        containers.forEach((container) => {
            if (container.getAttribute("data-vouch-loaded")) return;
            container.setAttribute("data-vouch-loaded", "true");

            const widgetId = container.getAttribute("data-vouch-id");
            const variant = container.getAttribute("data-vouch-variant") || "default";
            
            // Create Iframe
            const iframe = document.createElement("iframe");
            const src = new URL(`${VOUCH_ORIGIN}/widget/${widgetId}`);
            src.searchParams.set("variant", variant);
            
            iframe.src = src.toString();
            iframe.title = "Vouch Reviews";
            iframe.style.width = "100%";
            iframe.style.border = "none";
            iframe.style.overflow = "hidden";
            iframe.style.minHeight = "400px";
            iframe.style.transition = "height 0.2s ease";
            iframe.setAttribute("loading", "lazy");
            iframe.setAttribute("scrolling", "no");

            // Security: Sandbox
            iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");

            container.appendChild(iframe);
        });
    }

    // Message Listener for Resize
    window.addEventListener("message", (event) => {
        if (event.origin !== VOUCH_ORIGIN) return;
        
        try {
            const data = event.data;
            if (data.type === "vouch:resize" && data.height) {
                const iframes = document.querySelectorAll(`iframe[src*="${data.widgetId}"]`);
                iframes.forEach(iframe => {
                    iframe.style.height = `${data.height}px`;
                });
            }
        } catch (e) {
            console.error("Vouch Embed Error:", e);
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initVouchWidgets);
    } else {
        initVouchWidgets();
    }

})(window, document);
