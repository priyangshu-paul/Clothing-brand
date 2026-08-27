(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        const form = document.getElementById("newsletterForm");
        const emailInput = document.getElementById("newsletterEmail");
        const submitBtn = document.getElementById("newsletterBtn");
        const feedback = document.getElementById("newsletterFeedback");

        if (!form || !emailInput || !submitBtn || !feedback) return;

        // Simple standard email Regex validation
        function isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function setFeedback(message, statusClass) {
            feedback.textContent = message;
            feedback.className = `newsletter-feedback ${statusClass}`;
        }

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            const email = emailInput.value.trim();

            // Clear previous states
            emailInput.classList.remove("error");
            setFeedback("", "");

            // UX Input Validation
            if (!email) {
                emailInput.classList.add("error");
                setFeedback("Please enter your email address.", "error");
                emailInput.focus();
                return;
            }

            if (!isValidEmail(email)) {
                emailInput.classList.add("error");
                setFeedback("Please enter a valid email address (e.g. name@domain.com).", "error");
                emailInput.focus();
                return;
            }

            // Check if user already subscribed locally
            try {
                const existingSubscribers = JSON.parse(localStorage.getItem("brandSubscribers") || "[]");
                if (existingSubscribers.includes(email.toLowerCase())) {
                    setFeedback("You're already on our VIP list! Check your inbox for updates.", "info");
                    return;
                }
            } catch (err) {
                console.error("Storage error:", err);
            }

            // High UX Trigger: Button Loading State
            submitBtn.classList.add("loading");
            submitBtn.disabled = true;

            // Simulate API request delay
            setTimeout(() => {
                try {
                    const subscribers = JSON.parse(localStorage.getItem("brandSubscribers") || "[]");
                    subscribers.push(email.toLowerCase());
                    localStorage.setItem("brandSubscribers", JSON.stringify(subscribers));
                } catch (err) {
                    console.error("Storage save error:", err);
                }

                submitBtn.classList.remove("loading");
                submitBtn.disabled = false;
                
                // Show Success State
                emailInput.value = "";
                setFeedback("Welcome to the brand! Your 10% discount code is on its way.", "success");
                
                if (typeof window.showNotification === "function") {
                    window.showNotification("Subscription successful!", "success");
                }
            }, 900);
        });

        // Dynamic clear error on typing
        emailInput.addEventListener("input", function () {
            if (emailInput.classList.contains("error")) {
                emailInput.classList.remove("error");
                feedback.textContent = "";
                feedback.className = "newsletter-feedback";
            }
        });
    });
})();