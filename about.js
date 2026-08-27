(function () {
    "use strict";

    function updateAboutCartCount() {
        const cartCount = document.getElementById("cartCount");
        if (!cartCount) return;

        try {
            const saved = localStorage.getItem("brandCart");
            const cart = saved ? JSON.parse(saved) : [];
            const total = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

            if (total > 0) {
                cartCount.textContent = total;
                cartCount.style.display = "inline-flex";
            } else {
                cartCount.textContent = "";
                cartCount.style.display = "none";
            }
        } catch (error) {
            console.error("Cart count error:", error);
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        updateAboutCartCount();
    });

    window.addEventListener("storage", function (e) {
        if (e.key === "brandCart") {
            updateAboutCartCount();
        }
    });
})();

// Populate initial products, cart, wishlist, and reviews
localStorage.setItem("brandProducts", JSON.stringify([
  { id: "101", name: "Minimal Oversized Tee", price: 1499, category: "T-Shirts", gender: "unisex", image: "https://via.placeholder.com/600x800", description: "Heavyweight 240 GSM cotton tee.", sizes: ["S", "M", "L", "XL"] },
  { id: "102", name: "Architectural Trench Coat", price: 4999, category: "Jackets", gender: "women", image: "https://via.placeholder.com/600x800", description: "Structured tailored coat.", sizes: ["S", "M", "L"] }
]));

localStorage.setItem("brandWishlist", JSON.stringify([
  { id: "101", name: "Minimal Oversized Tee", price: 1499, category: "T-Shirts", image: "https://via.placeholder.com/600x800" }
]));

localStorage.setItem("brandReviews", JSON.stringify([
  { productId: "101", userName: "Aarav S.", rating: 5, comment: "Exceeded expectations. Top tier fit!", date: "2026-03-15" }
]));

console.log("Test data seeded successfully!");