(function(window, document) {
    "use strict";

    var VOUCH_ORIGIN = (document.currentScript && document.currentScript.getAttribute("data-origin")) || "https://vouch-ai.com";

    // Validate origin is a proper URL
    try {
        new URL(VOUCH_ORIGIN);
    } catch (e) {
        console.error("Vouch Embed: Invalid origin");
        return;
    }

    // Validate widget ID format (alphanumeric + underscores only)
    var ID_PATTERN = /^[a-zA-Z0-9_]+$/;

    function initVouchWidgets() {
        var containers = document.querySelectorAll("[data-vouch-id]");

        containers.forEach(function(container) {
            if (container.getAttribute("data-vouch-loaded")) return;
            container.setAttribute("data-vouch-loaded", "true");

            var widgetId = container.getAttribute("data-vouch-id");
            var variant = container.getAttribute("data-vouch-variant") || "default";

            // Validate widgetId format
            if (!widgetId || !ID_PATTERN.test(widgetId) || widgetId.length > 64) {
                console.error("Vouch Embed: Invalid widget ID");
                return;
            }

            // Validate variant
            if (variant.length > 32 || !ID_PATTERN.test(variant.replace(/-/g, ""))) {
                variant = "default";
            }
            
            // Create Iframe
            var iframe = document.createElement("iframe");
            var src = new URL(VOUCH_ORIGIN + "/widget/" + encodeURIComponent(widgetId));
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
    window.addEventListener("message", function(event) {
        if (event.origin !== VOUCH_ORIGIN) return;
        
        try {
            var data = event.data;
            if (data && data.type === "vouch:resize" && typeof data.height === "number" && data.height > 0 && data.height < 10000) {
                if (data.widgetId && ID_PATTERN.test(data.widgetId)) {
                    var iframes = document.querySelectorAll('iframe[src*="' + CSS.escape(data.widgetId) + '"]');
                    iframes.forEach(function(iframe) {
                        iframe.style.height = data.height + "px";
                    });
                }
            }
        } catch (e) {
            // Silently ignore malformed messages
        }
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initVouchWidgets);
    } else {
        initVouchWidgets();
    }

})(window, document);
