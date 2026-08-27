(function () {
    "use strict";

    // PRODUCT DATABASE
    function getProducts() {
        const possibleKeys = [
            "brandProducts",
            "products",
            "adminProducts"
        ];

        for (const key of possibleKeys) {
            try {
                const saved = localStorage.getItem(key);
                if (!saved) continue;
                const data = JSON.parse(saved);
                if (Array.isArray(data)) return data;
                if (data && typeof data === "object") {
                    if (Array.isArray(data.products)) return data.products;
                    if (Array.isArray(data.items)) return data.items;
                }
            } catch (error) {
                console.error("Product loading error:", error);
            }
        }
        return [];
    }
    window.getProducts = getProducts;

    // CART MANAGEMENT
    function getFashionCart() {
        try {
            const saved = localStorage.getItem("brandCart");
            const cart = saved ? JSON.parse(saved) : [];
            return Array.isArray(cart) ? cart : [];
        } catch (error) {
            console.error("Cart loading error:", error);
            return [];
        }
    }
    window.getFashionCart = getFashionCart;

    function saveFashionCart(cart) {
        try {
            localStorage.setItem("brandCart", JSON.stringify(Array.isArray(cart) ? cart : []));
        } catch (error) {
            console.error("Cart saving error:", error);
        }
    }
    window.saveFashionCart = saveFashionCart;

    function updateProductCartCount() {
        const cartCount = document.getElementById("cartCount");
        if (!cartCount) return;
        const cart = getFashionCart();
        const total = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
        if (total > 0) {
            cartCount.textContent = total;
            cartCount.style.display = "inline-flex";
        } else {
            cartCount.textContent = "";
            cartCount.style.display = "none";
        }
    }
    window.updateProductCartCount = updateProductCartCount;

    function notifyCartUpdated() {
        document.dispatchEvent(new CustomEvent("cartUpdated"));
    }

    function showMessage(message, type) {
        if (typeof window.showNotification === "function") {
            window.showNotification(message, type);
        } else {
            console.log(message);
        }
    }

    function getPrice(price) {
        return Number(String(price ?? 0).replace(/[^\d.]/g, "")) || 0;
    }
    window.getFashionPrice = getPrice;

    function normalizeText(value) {
        return String(value ?? "").trim().toLowerCase().replace(/['"]/g, "").replace(/[-_]/g, " ").replace(/\s+/g, " ");
    }

    function getProductGender(product) {
        const gender = normalizeText(product?.gender);
        if (["men", "man", "male", "mens"].includes(gender)) return "men";
        if (["women", "woman", "female", "womens"].includes(gender)) return "women";
        if (["unisex", "uni sex"].includes(gender)) return "unisex";
        return "";
    }

    function isMenProduct(product) {
        const gender = getProductGender(product);
        const category = normalizeText(product?.category);
        const name = normalizeText(product?.name);

        if (gender === "men") return true;
        if (gender === "women") return false;
        if (gender === "unisex") return true;

        if (["men", "mens", "male"].includes(category)) return true;
        if (category.startsWith("men ") || category.startsWith("mens ") || category.includes(" men ")) return true;

        const maleKeywords = ["men", "mens", "men shirt", "men tshirt", "men t shirt", "men hoodie", "men blazer", "men jacket", "men trouser", "men jeans", "men pants"];
        return maleKeywords.some(keyword => name.includes(keyword));
    }

    function isWomenProduct(product) {
        const gender = getProductGender(product);
        const category = normalizeText(product?.category);
        const name = normalizeText(product?.name);

        if (gender === "women") return true;
        if (gender === "men") return false;
        if (gender === "unisex") return true;

        if (["women", "womens", "female"].includes(category)) return true;
        if (category.startsWith("women ") || category.startsWith("womens ") || category.includes(" women ")) return true;

        const femaleKeywords = ["women", "womens", "women dress", "women top", "women kurti", "women saree", "women blouse", "women jacket", "women jeans", "women pants"];
        return femaleKeywords.some(keyword => name.includes(keyword));
    }

    function isNewProduct(product) {
        const category = normalizeText(product?.category);
        return (
            product?.isNew === true ||
            product?.newArrival === true ||
            String(product?.isNew).toLowerCase() === "true" ||
            String(product?.newArrival).toLowerCase() === "true" ||
            category === "new" ||
            category.includes("new arrival") ||
            category.includes("new arrivals")
        );
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function createProductCard(product) {
        const card = document.createElement("div");
        card.className = "product-card";

        const productId = product.id;
        const price = getPrice(product.price);
        const image = product.image || "placeholder.jpg";
        const name = product.name || "Brand Product";
        const category = product.category || "Apparel";
        const wishlistActive = typeof window.isInWishlist === "function" && window.isInWishlist(productId);

        card.innerHTML = `
            <div class="product-card-image-wrapper">
                <a href="product.html?product=${encodeURIComponent(productId)}" class="product-image">
                    <img src="${escapeHTML(image)}" alt="${escapeHTML(name)}" loading="lazy" onerror="this.src='placeholder.jpg'">
                </a>
                <button type="button" class="wishlist-btn ${wishlistActive ? "wishlist-active" : ""}" data-wishlist-id="${escapeHTML(productId)}" aria-label="${wishlistActive ? "Remove from Wishlist" : "Add to Wishlist"}">
                    ${wishlistActive ? "♥" : "♡"}
                </button>
            </div>
            <div class="product-info">
                <span class="product-category">${escapeHTML(category)}</span>
                <h3>${escapeHTML(name)}</h3>
                <p class="product-price">₹${price.toLocaleString("en-IN")}</p>
                <button type="button" class="add-cart" data-product-id="${escapeHTML(productId)}">ADD TO CART</button>
            </div>
        `;

        const wishlistButton = card.querySelector("[data-wishlist-id]");
        if (wishlistButton) {
            wishlistButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (typeof window.toggleWishlist === "function") {
                    window.toggleWishlist(this.dataset.wishlistId);
                }
            });
        }
        return card;
    }

    function addHomepageProductToCart(productId) {
        const products = getProducts();
        const product = products.find(item => String(item.id) === String(productId));

        if (!product) {
            showMessage("Product not found.", "error");
            return false;
        }

        const cart = getFashionCart();
        const existing = cart.find(item => String(item.id) === String(product.id) && String(item.size || "") === "");

        if (existing) {
            existing.quantity = Number(existing.quantity || 1) + 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name || "Brand Product",
                price: getPrice(product.price),
                image: product.image || "placeholder.jpg",
                category: product.category || "Apparel",
                gender: product.gender || "",
                size: "",
                quantity: 1
            });
        }

        saveFashionCart(cart);
        updateProductCartCount();
        notifyCartUpdated();
        showMessage((product.name || "Product") + " has been added to your cart.", "success");
        return true;
    }
    window.addHomepageProductToCart = addHomepageProductToCart;

    function displayProducts(products, title) {
        const productGrid = document.getElementById("productGrid");
        if (!productGrid) return;

        productGrid.innerHTML = "";
        if (!products.length) {
            productGrid.innerHTML = `
                <div class="admin-empty">
                    <h3>No products found</h3>
                    <p>No products are available in this category.</p>
                </div>
            `;
            updateProductsHeading(title);
            return;
        }

        products.forEach(product => productGrid.appendChild(createProductCard(product)));

        productGrid.querySelectorAll(".add-cart").forEach(button => {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                addHomepageProductToCart(this.dataset.productId);
            });
        });

        if (typeof window.updateWishlistButtons === "function") {
            window.updateWishlistButtons();
        }
        updateProductsHeading(title);
    }

    function updateProductsHeading(title) {
        const heading = document.querySelector(".products .section-heading h2");
        if (heading && title) heading.textContent = title;
    }

    function loadAdminProducts() {
        const products = getProducts();
        displayProducts(products.slice().reverse(), "Latest Products");
    }

    let currentFilter = "all";
    let currentSort = "default";

    function getFilteredProducts() {
        const products = getProducts();
        let filtered = products.slice();

        if (currentFilter === "men") filtered = filtered.filter(isMenProduct);
        else if (currentFilter === "women") filtered = filtered.filter(isWomenProduct);
        else if (currentFilter === "new") filtered = filtered.filter(isNewProduct);

        if (currentSort === "low") filtered.sort((a, b) => getPrice(a.price) - getPrice(b.price));
        else if (currentSort === "high") filtered.sort((a, b) => getPrice(b.price) - getPrice(a.price));
        else if (currentSort === "az") filtered.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
        else if (currentSort === "za") filtered.sort((a, b) => String(b.name || "").localeCompare(String(a.name || "")));
        else filtered = filtered.slice().reverse();

        return filtered;
    }

    function renderFilteredProducts() {
        let title = "Latest Products";
        if (currentFilter === "men") title = "Men's Collection";
        else if (currentFilter === "women") title = "Women's Collection";
        else if (currentFilter === "new") title = "New Arrivals";

        displayProducts(getFilteredProducts(), title);
    }

    function setupCategoryButtons() {
        const categoryCards = document.querySelectorAll(".category-card");
        categoryCards.forEach(card => {
            card.style.cursor = "pointer";
            card.addEventListener("click", function () {
                const category = normalizeText(this.dataset.category);
                if (!category) return;
                currentFilter = category;
                currentSort = "default";

                document.querySelectorAll(".filter-btn").forEach(button => {
                    button.classList.toggle("active", normalizeText(button.dataset.filter) === category);
                });

                const sortProducts = document.getElementById("sortProducts");
                if (sortProducts) sortProducts.value = "default";

                renderFilteredProducts();
                const shopSection = document.getElementById("shop");
                if (shopSection) {
                    setTimeout(() => shopSection.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }
            });
        });
    }

    function setupShopFilters() {
        const filterButtons = document.querySelectorAll(".filter-btn");
        const sortProducts = document.getElementById("sortProducts");

        filterButtons.forEach(button => {
            button.addEventListener("click", function () {
                currentFilter = normalizeText(this.dataset.filter || "all");
                filterButtons.forEach(btn => btn.classList.remove("active"));
                this.classList.add("active");
                renderFilteredProducts();
            });
        });

        if (sortProducts) {
            sortProducts.addEventListener("change", function () {
                currentSort = this.value || "default";
                renderFilteredProducts();
            });
        }
    }

    function loadProductDetails() {
        const productImage = document.getElementById("productImage");
        const productName = document.getElementById("productName");
        if (!productImage && !productName) return;

        const params = new URLSearchParams(window.location.search);
        const productId = params.get("product");
        const products = getProducts();
        const product = products.find(item => String(item.id) === String(productId));

        if (!product) {
            if (productName) productName.textContent = "Product Not Found";
            if (productImage) productImage.src = "placeholder.jpg";
            return;
        }

        const price = getPrice(product.price);

        if (productImage) {
            productImage.src = product.image || "placeholder.jpg";
            productImage.alt = product.name || "Brand Product";
            productImage.onerror = function () {
                this.onerror = null;
                this.src = "placeholder.jpg";
            };
        }

        if (productName) productName.textContent = product.name || "Brand Product";

        const productPrice = document.getElementById("productPrice");
        if (productPrice) productPrice.textContent = "₹" + price.toLocaleString("en-IN");

        const productCategory = document.getElementById("productCategory");
        if (productCategory) productCategory.textContent = product.category || "COLLECTION";

        const description = document.getElementById("productDescription");
        if (description) description.textContent = product.description || "Premium apparel engineered for quality.";

        const sizesContainer = document.getElementById("sizes");
        if (sizesContainer) {
            const sizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : ["S", "M", "L", "XL", "XXL"];
            sizesContainer.innerHTML = "";
            sizes.forEach(size => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "size-option";
                button.textContent = size;
                button.addEventListener("click", function () {
                    sizesContainer.querySelectorAll(".size-option").forEach(btn => btn.classList.remove("active"));
                    button.classList.add("active");
                });
                sizesContainer.appendChild(button);
            });
        }

        let quantity = 1;
        const quantityElement = document.getElementById("quantity");
        const minusBtn = document.getElementById("minusBtn");
        const plusBtn = document.getElementById("plusBtn");

        function updateQuantity() {
            quantity = Math.max(1, Math.min(99, quantity));
            if (quantityElement) quantityElement.textContent = quantity;
        }

        if (minusBtn) minusBtn.addEventListener("click", () => { quantity--; updateQuantity(); });
        if (plusBtn) plusBtn.addEventListener("click", () => { quantity++; updateQuantity(); });

        function getSelectedSize() {
            const selected = sizesContainer ? sizesContainer.querySelector(".size-option.active") : null;
            if (!selected) {
                showMessage("Please select a size.", "error");
                return null;
            }
            return selected.textContent.trim();
        }

        function addProductToCart() {
            const size = getSelectedSize();
            if (!size) return false;

            const cart = getFashionCart();
            const existing = cart.find(item => String(item.id) === String(product.id) && String(item.size || "") === String(size));

            if (existing) {
                existing.quantity = Number(existing.quantity || 1) + quantity;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name || "Brand Product",
                    price: price,
                    image: product.image || "placeholder.jpg",
                    category: product.category || "Apparel",
                    gender: product.gender || "",
                    size: size,
                    quantity: quantity
                });
            }

            saveFashionCart(cart);
            updateProductCartCount();
            notifyCartUpdated();
            showMessage((product.name || "Product") + " has been added to your cart.", "success");
            return true;
        }

        const addProductCart = document.getElementById("addProductCart");
        if (addProductCart) {
            addProductCart.addEventListener("click", e => { e.preventDefault(); addProductToCart(); });
        }

        const buyNow = document.getElementById("buyNow");
        if (buyNow) {
            buyNow.addEventListener("click", e => {
                e.preventDefault();
                if (addProductToCart()) window.location.href = "checkout.html";
            });
        }
        updateQuantity();
    }

    function loadRelatedProducts() {
        const relatedContainer = document.getElementById("relatedProducts");
        if (!relatedContainer) return;

        const params = new URLSearchParams(window.location.search);
        const currentProductId = params.get("product");
        const products = getProducts();
        const currentProduct = products.find(p => String(p.id) === String(currentProductId));

        let relatedProducts = products.filter(p => String(p.id) !== String(currentProductId));

        if (currentProduct) {
            const sameCategory = relatedProducts.filter(p => normalizeText(p.category) === normalizeText(currentProduct.category));
            if (sameCategory.length) {
                relatedProducts = sameCategory.concat(relatedProducts.filter(p => !sameCategory.includes(p)));
            }
        }

        relatedProducts = relatedProducts.slice().reverse().slice(0, 4);
        relatedContainer.innerHTML = "";

        if (!relatedProducts.length) {
            relatedContainer.innerHTML = `
                <div class="admin-empty">
                    <h3>No related products</h3>
                    <p>More products coming soon.</p>
                </div>
            `;
            return;
        }

        relatedProducts.forEach(product => {
            const price = getPrice(product.price);
            const card = document.createElement("a");
            card.className = "related-card";
            card.href = "product.html?product=" + encodeURIComponent(product.id);
            card.innerHTML = `
                <img src="${escapeHTML(product.image || "placeholder.jpg")}" alt="${escapeHTML(product.name || "Product")}" loading="lazy" onerror="this.src='placeholder.jpg'">
                <div class="related-card-info">
                    <h3>${escapeHTML(product.name || "Brand Product")}</h3>
                    <p>₹${price.toLocaleString("en-IN")}</p>
                </div>
            `;
            relatedContainer.appendChild(card);
        });
    }

    function initProductReviews() {
        const productReviews = document.getElementById("productReviews");
        const productReviewSummary = document.getElementById("productReviewSummary");
        if (!productReviews) return;

        function getReviews() {
            const possibleKeys = ["brandReviews", "reviews", "productReviews"];
            for (const key of possibleKeys) {
                try {
                    const saved = localStorage.getItem(key);
                    if (!saved) continue;
                    const data = JSON.parse(saved);
                    if (Array.isArray(data)) return data;
                    if (data && typeof data === "object") {
                        if (Array.isArray(data.reviews)) return data.reviews;
                        if (Array.isArray(data.items)) return data.items;
                    }
                } catch (e) {
                    console.error("Review error:", e);
                }
            }
            return [];
        }

        function getCurrentProductId() {
            return new URLSearchParams(window.location.search).get("product");
        }

        function getCurrentProductReviews() {
            const productId = getCurrentProductId();
            if (!productId) return [];
            const product = getProducts().find(p => String(p.id) === String(productId));
            const productName = normalizeText(product?.name || "");

            return getReviews().filter(review => {
                const rId = review.productId ?? review.productID ?? review.product_id ?? review.product?.id ?? "";
                const rName = review.productName ?? review.product_name ?? review.product?.name ?? "";
                return (String(rId).trim() !== "" && String(rId).trim() === String(productId).trim()) ||
                       (productName !== "" && normalizeText(rName) === productName);
            });
        }

        function generateStars(rating) {
            rating = Math.max(0, Math.min(5, Number(rating) || 0));
            let stars = "";
            for (let i = 1; i <= 5; i++) stars += i <= rating ? "★" : "☆";
            return stars;
        }

        function formatReviewDate(date) {
            if (!date) return "";
            const parsed = new Date(date);
            return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        }

        function renderReviewSummary(reviews) {
            if (!productReviewSummary) return;
            if (!reviews.length) {
                productReviewSummary.innerHTML = `
                    <div class="review-average">0.0</div>
                    <div class="review-summary-info">
                        <div class="review-average-stars">☆☆☆☆☆</div>
                        <div class="review-count">No reviews yet</div>
                    </div>
                `;
                return;
            }
            const total = reviews.reduce((sum, r) => sum + (Number(r.rating ?? r.stars ?? 0) || 0), 0);
            const average = total / reviews.length;

            productReviewSummary.innerHTML = `
                <div class="review-average">${average.toFixed(1)}</div>
                <div class="review-summary-info">
                    <div class="review-average-stars">${generateStars(Math.round(average))}</div>
                    <div class="review-count">Based on ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}</div>
                </div>
            `;
        }

        function renderProductReviews() {
            const reviews = getCurrentProductReviews();
            renderReviewSummary(reviews);

            if (!reviews.length) {
                productReviews.innerHTML = `
                    <div class="no-product-reviews">
                        <div class="empty-review-stars">☆☆☆☆☆</div>
                        <h3>No reviews yet</h3>
                        <p>Be the first customer to review this product.</p>
                    </div>
                `;
                return;
            }

            reviews.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
            productReviews.innerHTML = "";

            reviews.forEach(review => {
                const reviewCard = document.createElement("div");
                reviewCard.className = "product-review-card";
                reviewCard.innerHTML = `
                    <div class="product-review-header">
                        <div class="product-review-user">${escapeHTML(review.userName ?? review.username ?? review.user ?? "Customer")}</div>
                        <div class="product-review-date">${formatReviewDate(review.date ?? review.createdAt)}</div>
                    </div>
                    <div class="product-review-stars">${generateStars(Number(review.rating ?? review.stars ?? 0))}</div>
                    <div class="product-review-comment">${escapeHTML(review.comment ?? review.review ?? "")}</div>
                `;
                productReviews.appendChild(reviewCard);
            });
        }

        renderProductReviews();

        window.addEventListener("storage", e => {
            if (["brandReviews", "reviews", "productReviews"].includes(e.key)) renderProductReviews();
        });

        ["brandReviewUpdated", "reviewUpdated", "reviewsUpdated"].forEach(evt => {
            document.addEventListener(evt, renderProductReviews);
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        loadAdminProducts();
        setupCategoryButtons();
        setupShopFilters();
        loadProductDetails();
        loadRelatedProducts();
        initProductReviews();
        updateProductCartCount();
    });

    window.addEventListener("storage", e => {
        if (e.key === "brandCart") updateProductCartCount();
    });
})();

// WISHLIST MODULE
(function () {
    "use strict";

    function getWishlist() {
        try {
            const saved = localStorage.getItem("brandWishlist");
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Wishlist error:", error);
            return [];
        }
    }
    window.getWishlist = getWishlist;

    function saveWishlist(wishlist) {
        try {
            localStorage.setItem("brandWishlist", JSON.stringify(Array.isArray(wishlist) ? wishlist : []));
            return true;
        } catch (error) {
            console.error("Wishlist saving error:", error);
            return false;
        }
    }
    window.saveWishlist = saveWishlist;

    function isInWishlist(productId) {
        return getWishlist().some(item => String(item.id) === String(productId));
    }
    window.isInWishlist = isInWishlist;

    function updateWishlistButtons() {
        document.querySelectorAll("[data-wishlist-id]").forEach(button => {
            const active = isInWishlist(button.dataset.wishlistId);
            button.classList.toggle("wishlist-active", active);
            button.textContent = active ? "♥" : "♡";
            button.setAttribute("aria-label", active ? "Remove from Wishlist" : "Add to Wishlist");
        });

        const productButton = document.getElementById("productWishlistBtn");
        if (productButton) {
            const productId = new URLSearchParams(window.location.search).get("product");
            const active = isInWishlist(productId);
            productButton.classList.toggle("wishlist-active", active);
            productButton.innerHTML = active ? "♥ <span>REMOVE FROM WISHLIST</span>" : "♡ <span>ADD TO WISHLIST</span>";
        }
    }
    window.updateWishlistButtons = updateWishlistButtons;

    function toggleWishlist(productId) {
        const products = typeof window.getProducts === "function" ? window.getProducts() : [];
        const product = products.find(item => String(item.id) === String(productId));

        if (!product) return false;
        let wishlist = getWishlist();
        const existingIndex = wishlist.findIndex(item => String(item.id) === String(productId));

        if (existingIndex !== -1) {
            wishlist.splice(existingIndex, 1);
            saveWishlist(wishlist);
            updateWishlistButtons();
            document.dispatchEvent(new CustomEvent("wishlistUpdated"));
            if (typeof window.showNotification === "function") window.showNotification("Removed from Wishlist", "success");
            return true;
        }

        const price = typeof window.getFashionPrice === "function" ? window.getFashionPrice(product.price) : Number(product.price || 0);
        wishlist.push({
            id: product.id,
            name: product.name || "Brand Product",
            price: price,
            image: product.image || "placeholder.jpg",
            category: product.category || "Apparel",
            gender: product.gender || ""
        });

        if (saveWishlist(wishlist)) {
            updateWishlistButtons();
            document.dispatchEvent(new CustomEvent("wishlistUpdated"));
            if (typeof window.showNotification === "function") window.showNotification("Added to Wishlist ♡", "success");
            return true;
        }
        return false;
    }
    window.toggleWishlist = toggleWishlist;

    document.addEventListener("click", e => {
        const button = e.target.closest("#productWishlistBtn");
        if (!button) return;
        e.preventDefault();
        e.stopPropagation();
        const productId = new URLSearchParams(window.location.search).get("product");
        if (productId) toggleWishlist(productId);
    }, true);

    function loadWishlistPage() {
        const container = document.getElementById("wishlistContainer");
        if (!container) return;
        const wishlist = getWishlist();

        if (!wishlist.length) {
            container.innerHTML = `
                <div class="empty-wishlist">
                    <div class="empty-wishlist-icon">♡</div>
                    <h2>Your Wishlist is Empty</h2>
                    <p>Save your favourite products here.</p>
                    <a href="index.html#shop" class="btn primary-btn">EXPLORE PRODUCTS</a>
                </div>
            `;
            return;
        }

        function escapeHTML(str) {
            return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        container.innerHTML = `
            <div class="wishlist-grid">
                ${wishlist.map(product => `
                    <div class="wishlist-card" data-wishlist-card="${escapeHTML(product.id)}">
                        <a href="product.html?product=${encodeURIComponent(product.id)}" class="wishlist-image">
                            <img src="${escapeHTML(product.image || "placeholder.jpg")}" alt="${escapeHTML(product.name || "Product")}" loading="lazy" onerror="this.src='placeholder.jpg'">
                        </a>
                        <div class="wishlist-info">
                            <span class="wishlist-category">${escapeHTML(product.category || "Apparel")}</span>
                            <h3>${escapeHTML(product.name || "Brand Product")}</h3>
                            <p class="wishlist-price">₹${Number(product.price || 0).toLocaleString("en-IN")}</p>
                            <div class="wishlist-actions">
                                <button type="button" class="wishlist-cart-btn" data-cart-product="${escapeHTML(product.id)}">ADD TO CART</button>
                                <button type="button" class="wishlist-remove-btn" data-remove-wishlist="${escapeHTML(product.id)}">♡ REMOVE</button>
                            </div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

        container.querySelectorAll("[data-cart-product]").forEach(button => {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                if (typeof window.addHomepageProductToCart === "function") {
                    if (window.addHomepageProductToCart(this.dataset.cartProduct)) {
                        this.textContent = "ADDED TO CART";
                        this.disabled = true;
                        setTimeout(() => { this.textContent = "ADD TO CART"; this.disabled = false; }, 1500);
                    }
                }
            });
        });

        container.querySelectorAll("[data-remove-wishlist]").forEach(button => {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                const updated = getWishlist().filter(item => String(item.id) !== String(this.dataset.removeWishlist));
                if (saveWishlist(updated)) {
                    loadWishlistPage();
                    updateWishlistButtons();
                    document.dispatchEvent(new CustomEvent("wishlistUpdated"));
                }
            });
        });
    }

    window.loadWishlistPage = loadWishlistPage;

    document.addEventListener("DOMContentLoaded", () => {
        updateWishlistButtons();
        loadWishlistPage();
    });

    document.addEventListener("wishlistUpdated", () => {
        updateWishlistButtons();
        loadWishlistPage();
    });

    window.addEventListener("storage", e => {
        if (e.key === "brandWishlist") {
            updateWishlistButtons();
            loadWishlistPage();
        }
    });
})();