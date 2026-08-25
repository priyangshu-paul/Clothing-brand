// =====================================================
// FASHION PRODUCT SYSTEM
// PRODUCT LIST + FILTER + SORT
// PRODUCT DETAILS + CART
// REVIEWS + RELATED PRODUCTS
// WISHLIST
// =====================================================

(function () {

    "use strict";

    // =====================================================
    // PRODUCT DATABASE
    // =====================================================

    function getProducts() {

        const possibleKeys = [
            "fashionProducts",
            "products",
            "adminProducts"
        ];

        for (const key of possibleKeys) {

            try {

                const saved = localStorage.getItem(key);

                if (!saved) continue;

                const data = JSON.parse(saved);

                if (Array.isArray(data)) {
                    return data;
                }

                if (data && typeof data === "object") {

                    if (Array.isArray(data.products)) {
                        return data.products;
                    }

                    if (Array.isArray(data.items)) {
                        return data.items;
                    }

                }

            } catch (error) {

                console.error(
                    "Product loading error:",
                    error
                );

            }

        }

        return [];

    }

    // GLOBAL
    window.getProducts = getProducts;


    // =====================================================
    // CART
    // =====================================================

    function getFashionCart() {

        try {

            const saved =
                localStorage.getItem("fashionCart");

            const cart =
                saved ? JSON.parse(saved) : [];

            return Array.isArray(cart)
                ? cart
                : [];

        } catch (error) {

            console.error(
                "Cart loading error:",
                error
            );

            return [];

        }

    }

    // GLOBAL
    window.getFashionCart = getFashionCart;


    function saveFashionCart(cart) {

        try {

            localStorage.setItem(
                "fashionCart",
                JSON.stringify(
                    Array.isArray(cart)
                        ? cart
                        : []
                )
            );

        } catch (error) {

            console.error(
                "Cart saving error:",
                error
            );

        }

    }

    // GLOBAL
    window.saveFashionCart = saveFashionCart;


    function updateProductCartCount() {

        const cartCount =
            document.getElementById("cartCount");

        if (!cartCount) return;

        const cart =
            getFashionCart();

        const total =
            cart.reduce(function (sum, item) {

                return (
                    sum +
                    (
                        Number(item.quantity) || 1
                    )
                );

            }, 0);

        if (total > 0) {

            cartCount.textContent = total;
            cartCount.style.display = "inline-flex";

        } else {

            cartCount.textContent = "";
            cartCount.style.display = "none";

        }

    }

    // GLOBAL
    window.updateProductCartCount =
        updateProductCartCount;


    function notifyCartUpdated() {

        document.dispatchEvent(
            new CustomEvent("cartUpdated")
        );

    }


    // =====================================================
    // NOTIFICATION
    // =====================================================

    function showMessage(message, type) {

        if (
            typeof window.showNotification ===
            "function"
        ) {

            window.showNotification(
                message,
                type
            );

        } else {

            console.log(message);

        }

    }


    // =====================================================
    // PRICE
    // =====================================================

    function getPrice(price) {

        return Number(
            String(price ?? 0)
                .replace(/[^\d.]/g, "")
        ) || 0;

    }

    window.getFashionPrice = getPrice;


    // =====================================================
    // TEXT NORMALIZATION
    // =====================================================

    function normalizeText(value) {

        return String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/['"]/g, "")
            .replace(/[-_]/g, " ")
            .replace(/\s+/g, " ");

    }


    // =====================================================
    // PRODUCT GENDER
    // =====================================================

    function getProductGender(product) {

        const gender =
            normalizeText(product?.gender);

        if (
            [
                "men",
                "man",
                "male",
                "mens"
            ].includes(gender)
        ) {

            return "men";

        }

        if (
            [
                "women",
                "woman",
                "female",
                "womens"
            ].includes(gender)
        ) {

            return "women";

        }

        if (
            [
                "unisex",
                "uni sex"
            ].includes(gender)
        ) {

            return "unisex";

        }

        return "";

    }


    // =====================================================
    // MEN PRODUCT
    // =====================================================

    function isMenProduct(product) {

        const gender =
            getProductGender(product);

        const category =
            normalizeText(product?.category);

        const name =
            normalizeText(product?.name);


        // Explicit gender
        if (gender === "men") {
            return true;
        }

        if (gender === "women") {
            return false;
        }

        if (gender === "unisex") {
            return true;
        }


        // Category
        if (
            [
                "men",
                "mens",
                "male"
            ].includes(category)
        ) {

            return true;

        }


        if (
            category.startsWith("men ") ||
            category.startsWith("mens ") ||
            category.includes(" men ")
        ) {

            return true;

        }


        // Product name
        const maleKeywords = [
            "men",
            "mens",
            "men shirt",
            "men tshirt",
            "men t shirt",
            "men hoodie",
            "men blazer",
            "men jacket",
            "men trouser",
            "men jeans",
            "men pants"
        ];

        return maleKeywords.some(function (keyword) {

            return name.includes(keyword);

        });

    }


    // =====================================================
    // WOMEN PRODUCT
    // =====================================================

    function isWomenProduct(product) {

        const gender =
            getProductGender(product);

        const category =
            normalizeText(product?.category);

        const name =
            normalizeText(product?.name);


        // Explicit gender
        if (gender === "women") {
            return true;
        }

        if (gender === "men") {
            return false;
        }

        if (gender === "unisex") {
            return true;
        }


        // Category
        if (
            [
                "women",
                "womens",
                "female"
            ].includes(category)
        ) {

            return true;

        }


        if (
            category.startsWith("women ") ||
            category.startsWith("womens ") ||
            category.includes(" women ")
        ) {

            return true;

        }


        // Product name
        const femaleKeywords = [
            "women",
            "womens",
            "women dress",
            "women top",
            "women kurti",
            "women saree",
            "women blouse",
            "women jacket",
            "women jeans",
            "women pants"
        ];

        return femaleKeywords.some(function (keyword) {

            return name.includes(keyword);

        });

    }


    // =====================================================
    // NEW PRODUCT
    // =====================================================

    function isNewProduct(product) {

        const category =
            normalizeText(product?.category);

        return (

            product?.isNew === true ||

            product?.newArrival === true ||

            String(product?.isNew)
                .toLowerCase() === "true" ||

            String(product?.newArrival)
                .toLowerCase() === "true" ||

            category === "new" ||

            category.includes("new arrival") ||

            category.includes("new arrivals")

        );

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // PRODUCT CARD
    // =====================================================

    function createProductCard(product) {

        const card =
            document.createElement("div");

        card.className =
            "product-card";


        const productId =
            product.id;


        const price =
            getPrice(product.price);


        const image =
            product.image ||
            "images/product1.jpg";


        const name =
            product.name ||
            "Fashion Product";


        const category =
            product.category ||
            "Fashion";


        const wishlistActive =
            typeof window.isInWishlist ===
            "function" &&
            window.isInWishlist(productId);


        card.innerHTML = `

            <div class="product-card-image-wrapper">

                <a
                    href="product.html?product=${encodeURIComponent(productId)}"
                    class="product-image"
                >

                    <img
                        src="${escapeHTML(image)}"
                        alt="${escapeHTML(name)}"
                        loading="lazy"
                        onerror="this.src='images/product1.jpg'"
                    >

                </a>


                <button
                    type="button"
                    class="wishlist-btn ${wishlistActive
                ? "wishlist-active"
                : ""
            }"
                    data-wishlist-id="${escapeHTML(productId)}"
                    aria-label="${wishlistActive
                ? "Remove from Wishlist"
                : "Add to Wishlist"
            }"
                >
                    ${wishlistActive ? "♥" : "♡"}
                </button>

            </div>


            <div class="product-info">

                <span class="product-category">
                    ${escapeHTML(category)}
                </span>

                <h3>
                    ${escapeHTML(name)}
                </h3>

                <p class="product-price">
                    ₹${price.toLocaleString("en-IN")}
                </p>

                <button
                    type="button"
                    class="add-cart"
                    data-product-id="${escapeHTML(productId)}"
                >
                    ADD TO CART
                </button>

            </div>

        `;


        // =================================================
        // WISHLIST BUTTON
        // =================================================

        const wishlistButton =
            card.querySelector(
                "[data-wishlist-id]"
            );


        if (wishlistButton) {

            wishlistButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    const id =
                        this.dataset.wishlistId;

                    if (
                        typeof window.toggleWishlist ===
                        "function"
                    ) {

                        window.toggleWishlist(id);

                    }

                }
            );

        }


        return card;

    }


    // =====================================================
    // ADD HOMEPAGE PRODUCT TO CART
    // =====================================================

    function addHomepageProductToCart(productId) {

        const products =
            getProducts();


        const product =
            products.find(function (item) {

                return (
                    String(item.id) ===
                    String(productId)
                );

            });


        if (!product) {

            showMessage(
                "Product not found.",
                "error"
            );

            return false;

        }


        const cart =
            getFashionCart();


        const existing =
            cart.find(function (item) {

                return (
                    String(item.id) ===
                    String(product.id) &&
                    String(item.size || "") === ""
                );

            });


        if (existing) {

            existing.quantity =
                Number(existing.quantity || 1) + 1;

        } else {

            cart.push({

                id:
                    product.id,

                name:
                    product.name ||
                    "Fashion Product",

                price:
                    getPrice(product.price),

                image:
                    product.image ||
                    "images/product1.jpg",

                category:
                    product.category ||
                    "Fashion",

                gender:
                    product.gender ||
                    "",

                size:
                    "",

                quantity:
                    1

            });

        }


        saveFashionCart(cart);

        updateProductCartCount();

        notifyCartUpdated();


        showMessage(
            (
                product.name ||
                "Product"
            ) +
            " has been added to your cart.",
            "success"
        );


        return true;

    }


    window.addHomepageProductToCart =
        addHomepageProductToCart;


    // =====================================================
    // DISPLAY PRODUCTS
    // =====================================================

    function displayProducts(products, title) {

        const productGrid =
            document.getElementById(
                "productGrid"
            );


        if (!productGrid) {
            return;
        }


        productGrid.innerHTML = "";


        if (!products.length) {

            productGrid.innerHTML = `

                <div class="admin-empty">

                    <h3>
                        No products found
                    </h3>

                    <p>
                        No products are available
                        in this category.
                    </p>

                </div>

            `;

            updateProductsHeading(title);

            return;

        }


        products.forEach(function (product) {

            productGrid.appendChild(
                createProductCard(product)
            );

        });


        // =================================================
        // ADD CART BUTTONS
        // =================================================

        productGrid
            .querySelectorAll(".add-cart")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();

                        addHomepageProductToCart(
                            this.dataset.productId
                        );

                    }
                );

            });


        if (
            typeof window.updateWishlistButtons ===
            "function"
        ) {

            window.updateWishlistButtons();

        }


        updateProductsHeading(title);

    }


    // =====================================================
    // PRODUCTS HEADING
    // =====================================================

    function updateProductsHeading(title) {

        const heading =
            document.querySelector(
                ".products .section-heading h2"
            );


        if (
            heading &&
            title
        ) {

            heading.textContent =
                title;

        }

    }


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    function loadAdminProducts() {

        const products =
            getProducts();


        displayProducts(
            products.slice().reverse(),
            "Latest Products"
        );

    }


    // =====================================================
    // CATEGORY FILTER
    // =====================================================

    let currentFilter = "all";

    let currentSort = "default";


    function getFilteredProducts() {

        const products =
            getProducts();


        let filtered =
            products.slice();


        // FILTER
        if (currentFilter === "men") {

            filtered =
                filtered.filter(isMenProduct);

        }

        else if (currentFilter === "women") {

            filtered =
                filtered.filter(isWomenProduct);

        }

        else if (currentFilter === "new") {

            filtered =
                filtered.filter(isNewProduct);

        }


        // SORT
        if (currentSort === "low") {

            filtered.sort(function (a, b) {

                return (
                    getPrice(a.price) -
                    getPrice(b.price)
                );

            });

        }

        else if (currentSort === "high") {

            filtered.sort(function (a, b) {

                return (
                    getPrice(b.price) -
                    getPrice(a.price)
                );

            });

        }

        else if (currentSort === "az") {

            filtered.sort(function (a, b) {

                return String(
                    a.name || ""
                ).localeCompare(
                    String(
                        b.name || ""
                    )
                );

            });

        }

        else if (currentSort === "za") {

            filtered.sort(function (a, b) {

                return String(
                    b.name || ""
                ).localeCompare(
                    String(
                        a.name || ""
                    )
                );

            });

        }

        else {

            filtered =
                filtered.slice().reverse();

        }


        return filtered;

    }


    function renderFilteredProducts() {

        let title =
            "Latest Products";


        if (currentFilter === "men") {

            title =
                "Men's Collection";

        }

        else if (currentFilter === "women") {

            title =
                "Women's Collection";

        }

        else if (currentFilter === "new") {

            title =
                "New Arrivals";

        }


        displayProducts(
            getFilteredProducts(),
            title
        );

    }


    // =====================================================
    // CATEGORY CARDS
    // =====================================================

    function setupCategoryButtons() {

        const categoryCards =
            document.querySelectorAll(
                ".category-card"
            );


        categoryCards.forEach(function (card) {

            card.style.cursor =
                "pointer";


            card.addEventListener(
                "click",
                function () {

                    const category =
                        normalizeText(
                            this.dataset.category
                        );


                    if (!category) {
                        return;
                    }


                    currentFilter =
                        category;


                    currentSort =
                        "default";


                    document
                        .querySelectorAll(
                            ".filter-btn"
                        )
                        .forEach(function (button) {

                            button.classList.toggle(
                                "active",
                                normalizeText(
                                    button.dataset.filter
                                ) === category
                            );

                        });


                    const sortProducts =
                        document.getElementById(
                            "sortProducts"
                        );


                    if (sortProducts) {

                        sortProducts.value =
                            "default";

                    }


                    renderFilteredProducts();


                    const shopSection =
                        document.getElementById(
                            "shop"
                        );


                    if (shopSection) {

                        setTimeout(function () {

                            shopSection.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }, 100);

                    }

                }
            );

        });

    }


    // =====================================================
    // SHOP FILTERS
    // =====================================================

    function setupShopFilters() {

        const filterButtons =
            document.querySelectorAll(
                ".filter-btn"
            );


        const sortProducts =
            document.getElementById(
                "sortProducts"
            );


        filterButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    currentFilter =
                        normalizeText(
                            this.dataset.filter ||
                            "all"
                        );


                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    renderFilteredProducts();

                }
            );

        });


        if (sortProducts) {

            sortProducts.addEventListener(
                "change",
                function () {

                    currentSort =
                        this.value ||
                        "default";


                    renderFilteredProducts();

                }
            );

        }

    }


    // =====================================================
    // PRODUCT DETAILS
    // =====================================================

    function loadProductDetails() {

        const productImage =
            document.getElementById(
                "productImage"
            );


        const productName =
            document.getElementById(
                "productName"
            );


        if (
            !productImage &&
            !productName
        ) {

            return;

        }


        const params =
            new URLSearchParams(
                window.location.search
            );


        const productId =
            params.get("product");


        const products =
            getProducts();


        const product =
            products.find(function (item) {

                return (
                    String(item.id) ===
                    String(productId)
                );

            });


        // PRODUCT NOT FOUND
        if (!product) {

            if (productName) {

                productName.textContent =
                    "Product Not Found";

            }


            if (productImage) {

                productImage.src =
                    "images/product1.jpg";

            }

            return;

        }


        const price =
            getPrice(product.price);


        // =================================================
        // IMAGE
        // =================================================

        if (productImage) {

            productImage.src =
                product.image ||
                "images/product1.jpg";

            productImage.alt =
                product.name ||
                "Fashion Product";


            productImage.onerror =
                function () {

                    this.onerror = null;

                    this.src =
                        "images/product1.jpg";

                };

        }


        // =================================================
        // NAME
        // =================================================

        if (productName) {

            productName.textContent =
                product.name ||
                "Fashion Product";

        }


        // =================================================
        // PRICE
        // =================================================

        const productPrice =
            document.getElementById(
                "productPrice"
            );


        if (productPrice) {

            productPrice.textContent =
                "₹" +
                price.toLocaleString(
                    "en-IN"
                );

        }


        // =================================================
        // CATEGORY
        // =================================================

        const productCategory =
            document.getElementById(
                "productCategory"
            );


        if (productCategory) {

            productCategory.textContent =
                product.category ||
                "FASHION";

        }


        // =================================================
        // DESCRIPTION
        // =================================================

        const description =
            document.getElementById(
                "productDescription"
            );


        if (description) {

            description.textContent =
                product.description ||
                "Premium quality fashion product.";

        }


        // =================================================
        // SIZE
        // =================================================

        const sizesContainer =
            document.getElementById(
                "sizes"
            );


        if (sizesContainer) {

            const sizes =
                Array.isArray(product.sizes) &&
                    product.sizes.length
                    ? product.sizes
                    : [
                        "S",
                        "M",
                        "L",
                        "XL",
                        "XXL"
                    ];


            sizesContainer.innerHTML = "";


            sizes.forEach(function (size) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "size-option";


                button.textContent =
                    size;


                button.addEventListener(
                    "click",
                    function () {

                        sizesContainer
                            .querySelectorAll(
                                ".size-option"
                            )
                            .forEach(function (btn) {

                                btn.classList.remove(
                                    "active"
                                );

                            });


                        button.classList.add(
                            "active"
                        );

                    }
                );


                sizesContainer.appendChild(
                    button
                );

            });

        }


        // =================================================
        // QUANTITY
        // =================================================

        let quantity = 1;


        const quantityElement =
            document.getElementById(
                "quantity"
            );


        const minusBtn =
            document.getElementById(
                "minusBtn"
            );


        const plusBtn =
            document.getElementById(
                "plusBtn"
            );


        function updateQuantity() {

            quantity =
                Math.max(
                    1,
                    Math.min(
                        99,
                        quantity
                    )
                );


            if (quantityElement) {

                quantityElement.textContent =
                    quantity;

            }

        }


        if (minusBtn) {

            minusBtn.addEventListener(
                "click",
                function () {

                    quantity--;

                    updateQuantity();

                }
            );

        }


        if (plusBtn) {

            plusBtn.addEventListener(
                "click",
                function () {

                    quantity++;

                    updateQuantity();

                }
            );

        }


        // =================================================
        // SELECTED SIZE
        // =================================================

        function getSelectedSize() {

            const selected =
                sizesContainer
                    ? sizesContainer.querySelector(
                        ".size-option.active"
                    )
                    : null;


            if (!selected) {

                showMessage(
                    "Please select a size.",
                    "error"
                );

                return null;

            }


            return selected.textContent.trim();

        }


        // =================================================
        // ADD PRODUCT TO CART
        // =================================================

        function addProductToCart() {

            const size =
                getSelectedSize();


            if (!size) {
                return false;
            }


            const cart =
                getFashionCart();


            const existing =
                cart.find(function (item) {

                    return (
                        String(item.id) ===
                        String(product.id) &&
                        String(item.size || "") ===
                        String(size)
                    );

                });


            if (existing) {

                existing.quantity =
                    Number(
                        existing.quantity || 1
                    ) + quantity;

            } else {

                cart.push({

                    id:
                        product.id,

                    name:
                        product.name ||
                        "Fashion Product",

                    price:
                        price,

                    image:
                        product.image ||
                        "images/product1.jpg",

                    category:
                        product.category ||
                        "Fashion",

                    gender:
                        product.gender ||
                        "",

                    size:
                        size,

                    quantity:
                        quantity

                });

            }


            saveFashionCart(cart);

            updateProductCartCount();

            notifyCartUpdated();


            showMessage(
                (
                    product.name ||
                    "Product"
                ) +
                " has been added to your cart.",
                "success"
            );


            return true;

        }


        // =================================================
        // ADD TO CART
        // =================================================

        const addProductCart =
            document.getElementById(
                "addProductCart"
            );


        if (addProductCart) {

            addProductCart.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    addProductToCart();

                }
            );

        }


        // =================================================
        // BUY NOW
        // =================================================

        const buyNow =
            document.getElementById(
                "buyNow"
            );


        if (buyNow) {

            buyNow.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const added =
                        addProductToCart();


                    if (!added) {
                        return;
                    }


                    window.location.href =
                        "checkout.html";

                }
            );

        }


        updateQuantity();

    }


    // =====================================================
    // RELATED PRODUCTS
    // =====================================================

    function loadRelatedProducts() {

        const relatedContainer =
            document.getElementById(
                "relatedProducts"
            );


        if (!relatedContainer) {
            return;
        }


        const params =
            new URLSearchParams(
                window.location.search
            );


        const currentProductId =
            params.get("product");


        const products =
            getProducts();


        const currentProduct =
            products.find(function (product) {

                return (
                    String(product.id) ===
                    String(currentProductId)
                );

            });


        let relatedProducts =
            products.filter(function (product) {

                return (
                    String(product.id) !==
                    String(currentProductId)
                );

            });


        // SAME CATEGORY FIRST
        if (currentProduct) {

            const sameCategory =
                relatedProducts.filter(
                    function (product) {

                        return (
                            normalizeText(
                                product.category
                            ) ===
                            normalizeText(
                                currentProduct.category
                            )
                        );

                    }
                );


            if (sameCategory.length) {

                relatedProducts =
                    sameCategory.concat(
                        relatedProducts.filter(
                            function (product) {

                                return !sameCategory.includes(
                                    product
                                );

                            }
                        )
                    );

            }

        }


        relatedProducts =
            relatedProducts
                .slice()
                .reverse()
                .slice(0, 4);


        relatedContainer.innerHTML = "";


        if (!relatedProducts.length) {

            relatedContainer.innerHTML = `

                <div class="admin-empty">

                    <h3>
                        No related products
                    </h3>

                    <p>
                        More products coming soon.
                    </p>

                </div>

            `;

            return;

        }


        relatedProducts.forEach(function (product) {

            const price =
                getPrice(product.price);


            const card =
                document.createElement("a");


            card.className =
                "related-card";


            card.href =
                "product.html?product=" +
                encodeURIComponent(
                    product.id
                );


            card.innerHTML = `

                <img
                    src="${escapeHTML(
                product.image ||
                "images/product1.jpg"
            )}"
                    alt="${escapeHTML(
                product.name ||
                "Fashion Product"
            )}"
                    loading="lazy"
                    onerror="this.src='images/product1.jpg'"
                >

                <div class="related-card-info">

                    <h3>
                        ${escapeHTML(
                product.name ||
                "Fashion Product"
            )}
                    </h3>

                    <p>
                        ₹${price.toLocaleString("en-IN")}
                    </p>

                </div>

            `;


            relatedContainer.appendChild(
                card
            );

        });

    }


    // =====================================================
    // REVIEWS
    // =====================================================

    function initProductReviews() {

        const productReviews =
            document.getElementById(
                "productReviews"
            );


        const productReviewSummary =
            document.getElementById(
                "productReviewSummary"
            );


        if (!productReviews) {
            return;
        }


        // =================================================
        // GET REVIEWS
        // =================================================

        function getReviews() {

            const possibleKeys = [
                "fashionReviews",
                "reviews",
                "productReviews"
            ];


            for (const key of possibleKeys) {

                try {

                    const saved =
                        localStorage.getItem(key);


                    if (!saved) {
                        continue;
                    }


                    const data =
                        JSON.parse(saved);


                    if (Array.isArray(data)) {
                        return data;
                    }


                    if (
                        data &&
                        typeof data === "object"
                    ) {

                        if (
                            Array.isArray(
                                data.reviews
                            )
                        ) {

                            return data.reviews;

                        }


                        if (
                            Array.isArray(
                                data.items
                            )
                        ) {

                            return data.items;

                        }

                    }

                } catch (error) {

                    console.error(
                        "Review loading error:",
                        error
                    );

                }

            }


            return [];

        }


        // =================================================
        // CURRENT PRODUCT ID
        // =================================================

        function getCurrentProductId() {

            const params =
                new URLSearchParams(
                    window.location.search
                );


            return params.get("product");

        }


        // =================================================
        // CURRENT PRODUCT
        // =================================================

        function getCurrentProduct() {

            const productId =
                getCurrentProductId();


            if (!productId) {
                return null;
            }


            return getProducts().find(
                function (product) {

                    return (
                        String(product.id) ===
                        String(productId)
                    );

                }
            ) || null;

        }


        // =================================================
        // CURRENT PRODUCT REVIEWS
        // =================================================

        function getCurrentProductReviews() {

            const productId =
                getCurrentProductId();


            if (!productId) {
                return [];
            }


            const product =
                getCurrentProduct();


            const productName =
                normalizeText(
                    product?.name || ""
                );


            return getReviews().filter(
                function (review) {

                    const reviewProductId =
                        review.productId ??
                        review.productID ??
                        review.product_id ??
                        review.product?.id ??
                        "";


                    const reviewProductName =
                        review.productName ??
                        review.product_name ??
                        review.product?.name ??
                        "";


                    const idMatch =
                        String(
                            reviewProductId
                        ).trim() !== "" &&
                        String(
                            reviewProductId
                        ).trim() ===
                        String(
                            productId
                        ).trim();


                    const nameMatch =
                        productName !== "" &&
                        normalizeText(
                            reviewProductName
                        ) ===
                        productName;


                    return (
                        idMatch ||
                        nameMatch
                    );

                }
            );

        }


        // =================================================
        // STARS
        // =================================================

        function generateStars(rating) {

            rating =
                Math.max(
                    0,
                    Math.min(
                        5,
                        Number(rating) || 0
                    )
                );


            let stars = "";


            for (
                let i = 1;
                i <= 5;
                i++
            ) {

                stars +=
                    i <= rating
                        ? "★"
                        : "☆";

            }


            return stars;

        }


        // =================================================
        // DATE
        // =================================================

        function formatReviewDate(date) {

            if (!date) {
                return "";
            }


            const parsedDate =
                new Date(date);


            if (
                Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                return "";

            }


            return parsedDate.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        }


        // =================================================
        // SUMMARY
        // =================================================

        function renderReviewSummary(reviews) {

            if (!productReviewSummary) {
                return;
            }


            if (!reviews.length) {

                productReviewSummary.innerHTML = `

                    <div class="review-average">
                        0.0
                    </div>

                    <div class="review-summary-info">

                        <div class="review-average-stars">
                            ☆☆☆☆☆
                        </div>

                        <div class="review-count">
                            No reviews yet
                        </div>

                    </div>

                `;

                return;

            }


            const total =
                reviews.reduce(
                    function (sum, review) {

                        return (
                            sum +
                            (
                                Number(
                                    review.rating ??
                                    review.stars ??
                                    0
                                ) || 0
                            )
                        );

                    },
                    0
                );


            const average =
                total / reviews.length;


            productReviewSummary.innerHTML = `

                <div class="review-average">
                    ${average.toFixed(1)}
                </div>

                <div class="review-summary-info">

                    <div class="review-average-stars">
                        ${generateStars(
                Math.round(average)
            )}
                    </div>

                    <div class="review-count">
                        Based on
                        ${reviews.length}
                        ${reviews.length === 1
                    ? "review"
                    : "reviews"
                }
                    </div>

                </div>

            `;

        }


        // =================================================
        // RENDER REVIEWS
        // =================================================

        function renderProductReviews() {

            const reviews =
                getCurrentProductReviews();


            renderReviewSummary(
                reviews
            );


            if (!reviews.length) {

                productReviews.innerHTML = `

                    <div class="no-product-reviews">

                        <div class="empty-review-stars">
                            ☆☆☆☆☆
                        </div>

                        <h3>
                            No reviews yet
                        </h3>

                        <p>
                            Be the first customer to
                            review this product.
                        </p>

                    </div>

                `;

                return;

            }


            reviews.sort(
                function (a, b) {

                    const dateA =
                        new Date(
                            a.date ||
                            a.createdAt ||
                            a.created_at ||
                            0
                        );


                    const dateB =
                        new Date(
                            b.date ||
                            b.createdAt ||
                            b.created_at ||
                            0
                        );


                    return dateB - dateA;

                }
            );


            productReviews.innerHTML = "";


            reviews.forEach(
                function (review) {

                    const reviewCard =
                        document.createElement(
                            "div"
                        );


                    reviewCard.className =
                        "product-review-card";


                    const userName =
                        review.userName ??
                        review.username ??
                        review.user ??
                        review.name ??
                        "Customer";


                    const comment =
                        review.comment ??
                        review.review ??
                        review.message ??
                        "";


                    const rating =
                        Number(
                            review.rating ??
                            review.stars ??
                            0
                        ) || 0;


                    const date =
                        review.date ??
                        review.createdAt ??
                        review.created_at ??
                        "";


                    reviewCard.innerHTML = `

                        <div class="product-review-header">

                            <div class="product-review-user">
                                ${escapeHTML(userName)}
                            </div>

                            <div class="product-review-date">
                                ${formatReviewDate(date)}
                            </div>

                        </div>

                        <div class="product-review-stars">
                            ${generateStars(rating)}
                        </div>

                        <div class="product-review-comment">
                            ${escapeHTML(comment)}
                        </div>

                    `;


                    productReviews.appendChild(
                        reviewCard
                    );

                }
            );

        }


        renderProductReviews();


        // CROSS TAB REVIEWS
        window.addEventListener(
            "storage",
            function (event) {

                if (
                    [
                        "fashionReviews",
                        "reviews",
                        "productReviews"
                    ].includes(event.key)
                ) {

                    renderProductReviews();

                }

            }
        );


        // CUSTOM REVIEW EVENTS
        [
            "fashionReviewUpdated",
            "reviewUpdated",
            "reviewsUpdated"
        ].forEach(function (eventName) {

            document.addEventListener(
                eventName,
                renderProductReviews
            );

        });

    }


    // =====================================================
    // PAGE LOAD
    // =====================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            loadAdminProducts();

            setupCategoryButtons();

            setupShopFilters();

            loadProductDetails();

            loadRelatedProducts();

            initProductReviews();

            updateProductCartCount();

        }
    );


    // =====================================================
    // CART STORAGE UPDATE
    // =====================================================

    window.addEventListener(
        "storage",
        function (event) {

            if (event.key === "fashionCart") {

                updateProductCartCount();

            }

        }
    );

})();

// =====================================================
// FASHION WISHLIST SYSTEM - FINAL
// =====================================================

(function () {

    "use strict";


    // =================================================
    // GET WISHLIST
    // =================================================

    function getWishlist() {

        try {

            const saved =
                localStorage.getItem("fashionWishlist");

            if (!saved) {
                return [];
            }

            const data =
                JSON.parse(saved);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Wishlist loading error:",
                error
            );

            return [];

        }

    }


    window.getWishlist =
        getWishlist;


    // =================================================
    // SAVE WISHLIST
    // =================================================

    function saveWishlist(wishlist) {

        try {

            localStorage.setItem(
                "fashionWishlist",
                JSON.stringify(
                    Array.isArray(wishlist)
                        ? wishlist
                        : []
                )
            );

            return true;

        } catch (error) {

            console.error(
                "Wishlist saving error:",
                error
            );

            return false;

        }

    }


    window.saveWishlist =
        saveWishlist;


    // =================================================
    // CHECK PRODUCT IN WISHLIST
    // =================================================

    function isInWishlist(productId) {

        return getWishlist().some(
            function (item) {

                return (
                    String(item.id) ===
                    String(productId)
                );

            }
        );

    }


    window.isInWishlist =
        isInWishlist;


    // =================================================
    // UPDATE ALL WISHLIST BUTTONS
    // =================================================

    function updateWishlistButtons() {

        // PRODUCT CARDS

        document
            .querySelectorAll(
                "[data-wishlist-id]"
            )
            .forEach(
                function (button) {

                    const productId =
                        button.dataset.wishlistId;

                    const active =
                        isInWishlist(productId);


                    button.classList.toggle(
                        "wishlist-active",
                        active
                    );


                    button.textContent =
                        active
                            ? "♥"
                            : "♡";


                    button.setAttribute(
                        "aria-label",
                        active
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"
                    );

                }
            );


        // PRODUCT DETAILS PAGE

        const productButton =
            document.getElementById(
                "productWishlistBtn"
            );


        if (productButton) {

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const productId =
                params.get("product");


            const active =
                isInWishlist(productId);


            productButton.classList.toggle(
                "wishlist-active",
                active
            );


            productButton.innerHTML =
                active
                    ? "♥ <span>REMOVE FROM WISHLIST</span>"
                    : "♡ <span>ADD TO WISHLIST</span>";

        }

    }


    window.updateWishlistButtons =
        updateWishlistButtons;


    // =================================================
    // TOGGLE WISHLIST
    // =================================================

    function toggleWishlist(productId) {

        const products =
            typeof window.getProducts === "function"
                ? window.getProducts()
                : [];


        const product =
            products.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(productId)
                    );

                }
            );


        if (!product) {

            console.error(
                "Wishlist product not found:",
                productId
            );

            if (
                typeof window.showNotification ===
                "function"
            ) {

                window.showNotification(
                    "Product not found.",
                    "error"
                );

            }

            return false;

        }


        let wishlist =
            getWishlist();


        const existingIndex =
            wishlist.findIndex(
                function (item) {

                    return (
                        String(item.id) ===
                        String(productId)
                    );

                }
            );


        // =================================================
        // REMOVE
        // =================================================

        if (existingIndex !== -1) {

            wishlist.splice(
                existingIndex,
                1
            );


            saveWishlist(
                wishlist
            );


            updateWishlistButtons();


            document.dispatchEvent(
                new CustomEvent(
                    "wishlistUpdated"
                )
            );


            if (
                typeof window.showNotification ===
                "function"
            ) {

                window.showNotification(
                    "Removed from Wishlist",
                    "success"
                );

            }


            return true;

        }


        // =================================================
        // ADD
        // =================================================

        const price =
            typeof window.getFashionPrice ===
            "function"
                ? window.getFashionPrice(
                    product.price
                )
                : (
                    Number(
                        String(
                            product.price ?? 0
                        ).replace(
                            /[^\d.]/g,
                            ""
                        )
                    ) || 0
                );


        const wishlistProduct = {

            id:
                product.id,

            name:
                product.name ||
                "Fashion Product",

            price:
                price,

            image:
                product.image ||
                "images/product1.jpg",

            category:
                product.category ||
                "Fashion",

            gender:
                product.gender ||
                ""

        };


        wishlist.push(
            wishlistProduct
        );


        const saved =
            saveWishlist(
                wishlist
            );


        if (!saved) {

            return false;

        }


        updateWishlistButtons();


        document.dispatchEvent(
            new CustomEvent(
                "wishlistUpdated"
            )
        );


        if (
            typeof window.showNotification ===
            "function"
        ) {

            window.showNotification(
                "Added to Wishlist ♡",
                "success"
            );

        }


        return true;

    }


    window.toggleWishlist =
        toggleWishlist;


    // =================================================
    // PRODUCT PAGE WISHLIST BUTTON
    // =================================================

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "#productWishlistBtn"
                );


            if (!button) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();


            const params =
                new URLSearchParams(
                    window.location.search
                );


            const productId =
                params.get("product");


            if (!productId) {
                return;
            }


            toggleWishlist(
                productId
            );

        },
        true
    );


    // =================================================
    // WISHLIST PAGE
    // =================================================

    function loadWishlistPage() {

        const container =
            document.getElementById(
                "wishlistContainer"
            );


        if (!container) {
            return;
        }


        const wishlist =
            getWishlist();


        // =================================================
        // EMPTY WISHLIST
        // =================================================

        if (!wishlist.length) {

            container.innerHTML = `

                <div class="empty-wishlist">

                    <div class="empty-wishlist-icon">
                        ♡
                    </div>

                    <h2>
                        Your Wishlist is Empty
                    </h2>

                    <p>
                        Save your favourite products here.
                    </p>

                    <a
                        href="index.html#shop"
                        class="btn primary-btn"
                    >
                        EXPLORE PRODUCTS
                    </a>

                </div>

            `;

            return;

        }


        // =================================================
        // WISHLIST PRODUCTS
        // =================================================

        container.innerHTML = `

            <div class="wishlist-grid">

                ${wishlist.map(
                    function (product) {

                        const price =
                            typeof window.getFashionPrice ===
                            "function"
                                ? window.getFashionPrice(
                                    product.price
                                )
                                : Number(
                                    product.price || 0
                                );


                        return `

                            <div
                                class="wishlist-card"
                                data-wishlist-card="${escapeHTML(
                                    product.id
                                )}"
                            >

                                <!-- IMAGE -->

                                <a
                                    href="product.html?product=${encodeURIComponent(
                                        product.id
                                    )}"
                                    class="wishlist-image"
                                >

                                    <img
                                        src="${escapeHTML(
                                            product.image ||
                                            "images/product1.jpg"
                                        )}"
                                        alt="${escapeHTML(
                                            product.name ||
                                            "Fashion Product"
                                        )}"
                                        loading="lazy"
                                        onerror="this.src='images/product1.jpg'"
                                    >

                                </a>


                                <!-- INFO -->

                                <div class="wishlist-info">

                                    <span class="wishlist-category">
                                        ${escapeHTML(
                                            product.category ||
                                            "Fashion"
                                        )}
                                    </span>


                                    <h3>
                                        ${escapeHTML(
                                            product.name ||
                                            "Fashion Product"
                                        )}
                                    </h3>


                                    <p class="wishlist-price">
                                        ₹${price.toLocaleString(
                                            "en-IN"
                                        )}
                                    </p>


                                    <!-- ACTIONS -->

                                    <div class="wishlist-actions">

                                        <button
                                            type="button"
                                            class="wishlist-cart-btn"
                                            data-cart-product="${escapeHTML(
                                                product.id
                                            )}"
                                        >
                                            ADD TO CART
                                        </button>


                                        <button
                                            type="button"
                                            class="wishlist-remove-btn"
                                            data-remove-wishlist="${escapeHTML(
                                                product.id
                                            )}"
                                        >
                                            ♡ REMOVE
                                        </button>

                                    </div>

                                </div>

                            </div>

                        `;

                    }
                ).join("")}

            </div>

        `;


        // =================================================
        // ADD TO CART BUTTONS
        // =================================================

        container
            .querySelectorAll(
                "[data-cart-product]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();
                            event.stopPropagation();


                            const productId =
                                this.dataset.cartProduct;


                            // USE EXISTING CART FUNCTION

                            if (
                                typeof window.addHomepageProductToCart !==
                                "function"
                            ) {

                                console.error(
                                    "addHomepageProductToCart function not found."
                                );

                                return;

                            }


                            const added =
                                window.addHomepageProductToCart(
                                    productId
                                );


                            if (added) {

                                const currentButton =
                                    this;


                                currentButton.textContent =
                                    "ADDED TO CART";


                                currentButton.disabled =
                                    true;


                                setTimeout(
                                    function () {

                                        currentButton.textContent =
                                            "ADD TO CART";

                                        currentButton.disabled =
                                            false;

                                    },
                                    1500
                                );

                            }

                        }
                    );

                }
            );


        // =================================================
        // REMOVE BUTTONS
        // =================================================

        container
            .querySelectorAll(
                "[data-remove-wishlist]"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function (event) {

                            event.preventDefault();
                            event.stopPropagation();


                            const productId =
                                this.dataset.removeWishlist;


                            const updated =
                                getWishlist().filter(
                                    function (item) {

                                        return (
                                            String(item.id) !==
                                            String(productId)
                                        );

                                    }
                                );


                            const saved =
                                saveWishlist(
                                    updated
                                );


                            if (!saved) {
                                return;
                            }


                            // RELOAD WISHLIST

                            loadWishlistPage();


                            // UPDATE HEART BUTTONS

                            updateWishlistButtons();


                            // NOTIFY OTHER SYSTEMS

                            document.dispatchEvent(
                                new CustomEvent(
                                    "wishlistUpdated"
                                )
                            );


                            if (
                                typeof window.showNotification ===
                                "function"
                            ) {

                                window.showNotification(
                                    "Removed from Wishlist",
                                    "success"
                                );

                            }

                        }
                    );

                }
            );

    }


    window.loadWishlistPage =
        loadWishlistPage;


    // =================================================
    // ESCAPE HTML
    // =================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // =================================================
    // PAGE LOAD
    // =================================================

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            updateWishlistButtons();

            loadWishlistPage();

        }
    );


    // =================================================
    // WISHLIST UPDATED
    // =================================================

    document.addEventListener(
        "wishlistUpdated",
        function () {

            updateWishlistButtons();

            loadWishlistPage();

        }
    );


    // =================================================
    // STORAGE UPDATE
    // =================================================

    window.addEventListener(
        "storage",
        function (event) {

            if (
                event.key ===
                "fashionWishlist"
            ) {

                updateWishlistButtons();

                loadWishlistPage();

            }

        }
    );

})();