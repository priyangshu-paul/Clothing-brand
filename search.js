// =====================================================
// FASHION WEBSITE SEARCH SYSTEM
// ADMIN PRODUCTS ONLY
// MEN + WOMEN + UNISEX + CATEGORY SEARCH
// RELATED PRODUCTS FALLBACK
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =================================================
    // ELEMENTS
    // =================================================

    const searchBtn =
        document.getElementById("searchBtn");

    const searchOverlay =
        document.getElementById("searchOverlay");

    const closeSearch =
        document.getElementById("closeSearch");

    const searchInput =
        document.getElementById("searchInput");

    const clearSearch =
        document.getElementById("clearSearch");

    const searchResults =
        document.getElementById("searchResults");

    const relatedSearch =
        document.getElementById("relatedSearch");


    // =================================================
    // CHECK ELEMENTS
    // =================================================

    if (
        !searchBtn ||
        !searchOverlay ||
        !searchInput
    ) {

        console.warn(
            "Search system: Search elements not found."
        );

        return;

    }


    // =================================================
    // GET ADMIN PRODUCTS
    // =================================================

    function getProducts() {

        try {

            const saved =
                localStorage.getItem(
                    "fashionProducts"
                );


            if (!saved) {

                return [];

            }


            const products =
                JSON.parse(saved);


            if (!Array.isArray(products)) {

                return [];

            }


            return products;

        } catch (error) {

            console.error(
                "Search product loading error:",
                error
            );

            return [];

        }

    }


    // =================================================
    // NORMALIZE TEXT
    // =================================================

    function normalizeText(value) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ");

    }


    // =================================================
    // GET GENDER
    // =================================================

    function getGender(product) {

        const gender =
            normalizeText(product.gender);


        if (
            gender === "men" ||
            gender === "man" ||
            gender === "male" ||
            gender === "mens" ||
            gender === "men's"
        ) {

            return "men";

        }


        if (
            gender === "women" ||
            gender === "woman" ||
            gender === "female" ||
            gender === "womens" ||
            gender === "women's"
        ) {

            return "women";

        }


        if (
            gender === "unisex" ||
            gender === "uni sex"
        ) {

            return "unisex";

        }


        return "";

    }


    // =================================================
    // PRODUCT BELONGS TO MEN
    // =================================================

    function isMenProduct(product) {

        const gender =
            getGender(product);


        // Direct Men
        if (gender === "men") {

            return true;

        }


        // Unisex also belongs to Men's collection
        if (gender === "unisex") {

            return true;

        }


        // IMPORTANT:
        // Do NOT use category.includes("men")
        // because "women" contains "men".

        return false;

    }


    // =================================================
    // PRODUCT BELONGS TO WOMEN
    // =================================================

    function isWomenProduct(product) {

        const gender =
            getGender(product);


        // Direct Women
        if (gender === "women") {

            return true;

        }


        // Unisex also belongs to Women's collection
        if (gender === "unisex") {

            return true;

        }


        return false;

    }


    // =================================================
    // OPEN SEARCH
    // =================================================

    function openSearch() {

        searchOverlay.classList.add("active");

        document.body.classList.add("search-open");

        searchInput.value = "";

        renderDefaultSearch();

        setTimeout(function () {

            searchInput.focus();

        }, 150);

    }


    // =================================================
    // CLOSE SEARCH
    // =================================================

    function closeSearchOverlay() {

        searchOverlay.classList.remove("active");

        document.body.classList.remove(
            "search-open"
        );

    }


    // =================================================
    // SEARCH BUTTON
    // =================================================

    searchBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            openSearch();

        }
    );


    // =================================================
    // CLOSE BUTTON
    // =================================================

    if (closeSearch) {

        closeSearch.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeSearchOverlay();

            }
        );

    }


    // =================================================
    // OVERLAY CLICK
    // =================================================

    searchOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                searchOverlay
            ) {

                closeSearchOverlay();

            }

        }
    );


    // =================================================
    // ESC
    // =================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeSearchOverlay();

            }

        }
    );


    // =================================================
    // CLEAR SEARCH
    // =================================================

    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            function () {

                searchInput.value = "";

                renderDefaultSearch();

                searchInput.focus();

            }
        );

    }


    // =================================================
    // SEARCH INPUT
    // =================================================

    searchInput.addEventListener(
        "input",
        function () {

            const query =
                normalizeText(this.value);


            if (!query) {

                renderDefaultSearch();

                return;

            }


            searchProducts(query);

        }
    );


    // =================================================
    // SEARCH PRODUCTS
    // =================================================

    function searchProducts(query) {

        const products =
            getProducts();


        if (!products.length) {

            renderRelatedProducts(
                [],
                query
            );

            return;

        }


        const normalizedQuery =
            normalizeText(query);


        // =================================================
        // SPECIAL GENDER SEARCH
        // =================================================

        let results = [];


        if (
            normalizedQuery === "men" ||
            normalizedQuery === "man" ||
            normalizedQuery === "male" ||
            normalizedQuery === "mens" ||
            normalizedQuery === "men s"
        ) {

            results =
                products.filter(function (product) {

                    return isMenProduct(product);

                });

        }


        else if (
            normalizedQuery === "women" ||
            normalizedQuery === "woman" ||
            normalizedQuery === "female" ||
            normalizedQuery === "womens" ||
            normalizedQuery === "women s"
        ) {

            results =
                products.filter(function (product) {

                    return isWomenProduct(product);

                });

        }


        else if (
            normalizedQuery === "unisex" ||
            normalizedQuery === "uni sex"
        ) {

            results =
                products.filter(function (product) {

                    return getGender(product) ===
                        "unisex";

                });

        }


        // =================================================
        // NORMAL PRODUCT / CATEGORY SEARCH
        // =================================================

        else {

            const queryWords =
                normalizedQuery
                    .split(" ")
                    .filter(Boolean);


            results =
                products.filter(function (product) {

                    const name =
                        normalizeText(
                            product.name
                        );


                    const category =
                        normalizeText(
                            product.category
                        );


                    const description =
                        normalizeText(
                            product.description
                        );


                    const productGender =
                        getGender(product);


                    // Exact text source
                    const searchableText =
                        [
                            name,
                            category,
                            description,
                            productGender
                        ]
                            .join(" ");


                    // Every search word must be
                    // present somewhere in the product
                    return queryWords.every(
                        function (word) {

                            return searchableText
                                .includes(word);

                        }
                    );

                });

        }


        // =================================================
        // RESULTS FOUND
        // =================================================

        if (results.length > 0) {

            displayResults(
                results,
                normalizedQuery
            );

            return;

        }


        // =================================================
        // NO EXACT RESULT
        // SHOW RELATED INSTEAD
        // =================================================

        const related =
            findRelatedProducts(
                products,
                normalizedQuery
            );


        renderRelatedProducts(
            related,
            normalizedQuery
        );

    }


    // =================================================
    // FIND RELATED PRODUCTS
    // =================================================

    function findRelatedProducts(
        products,
        query
    ) {

        const words =
            normalizeText(query)
                .split(" ")
                .filter(function (word) {

                    return word.length >= 2;

                });


        if (!words.length) {

            return products
                .slice()
                .reverse()
                .slice(0, 6);

        }


        const scoredProducts =
            products.map(
                function (product) {

                    const name =
                        normalizeText(
                            product.name
                        );


                    const category =
                        normalizeText(
                            product.category
                        );


                    const description =
                        normalizeText(
                            product.description
                        );


                    const gender =
                        getGender(product);


                    const text =
                        [
                            name,
                            category,
                            description,
                            gender
                        ].join(" ");


                    let score = 0;


                    words.forEach(
                        function (word) {

                            if (
                                name.includes(word)
                            ) {

                                score += 5;

                            }


                            if (
                                category.includes(word)
                            ) {

                                score += 4;

                            }


                            if (
                                description.includes(word)
                            ) {

                                score += 2;

                            }


                            if (
                                gender.includes(word)
                            ) {

                                score += 3;

                            }

                        }
                    );


                    return {

                        product: product,
                        score: score

                    };

                }
            );


        return scoredProducts
            .filter(function (item) {

                return item.score > 0;

            })
            .sort(function (a, b) {

                return b.score - a.score;

            })
            .slice(0, 6)
            .map(function (item) {

                return item.product;

            });

    }


    // =================================================
    // DISPLAY SEARCH RESULTS
    // =================================================

    function displayResults(
        products,
        query
    ) {

        if (!searchResults) {

            return;

        }


        let html = `

            <div class="search-result-title">

                <span>
                    SEARCH RESULTS
                </span>

                <h3>
                    ${products.length}
                    ${products.length === 1
                        ? "Product"
                        : "Products"}
                    Found
                </h3>

            </div>

            <div class="search-product-grid">

        `;


        products.forEach(
            function (product) {

                const price =
                    Number(
                        String(
                            product.price || 0
                        )
                            .replace(
                                /[^\d.]/g,
                                ""
                            )
                    ) || 0;


                html += `

                    <div
                        class="search-product-card"
                        data-product-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        <div
                            class="search-product-image"
                        >

                            <img
                                src="${escapeHTML(
                                    product.image ||
                                    "product1.jpg"
                                )}"
                                alt="${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}"
                                loading="lazy"
                            >

                        </div>


                        <div
                            class="search-product-info"
                        >

                            <span>
                                ${escapeHTML(
                                    product.category ||
                                    "Fashion"
                                )}
                            </span>

                            <h4>
                                ${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}
                            </h4>

                            <p>
                                ₹${price.toLocaleString(
                                    "en-IN"
                                )}
                            </p>

                        </div>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;


        searchResults.innerHTML =
            html;


        setupSearchProductClicks();

    }


    // =================================================
    // RELATED PRODUCTS
    // =================================================

    function renderRelatedProducts(
        products,
        query
    ) {

        if (!searchResults) {

            return;

        }


        // If nothing related at all,
        // show latest admin products instead.

        if (!products.length) {

            products =
                getProducts()
                    .slice()
                    .reverse()
                    .slice(0, 6);

        }


        let html = `

            <div class="search-result-title">

                <span>
                    YOU MAY ALSO LIKE
                </span>

                <h3>
                    Related Products
                </h3>

            </div>

        `;


        if (query) {

            html += `

                <p class="search-related-message">
                    Showing products related to
                    "<strong>${escapeHTML(
                        query
                    )}</strong>"
                </p>

            `;

        }


        html += `

            <div class="search-product-grid">

        `;


        products.forEach(
            function (product) {

                const price =
                    Number(
                        String(
                            product.price || 0
                        )
                            .replace(
                                /[^\d.]/g,
                                ""
                            )
                    ) || 0;


                html += `

                    <div
                        class="search-product-card"
                        data-product-id="${escapeHTML(
                            product.id
                        )}"
                    >

                        <div
                            class="search-product-image"
                        >

                            <img
                                src="${escapeHTML(
                                    product.image ||
                                    "product1.jpg"
                                )}"
                                alt="${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}"
                                loading="lazy"
                            >

                        </div>


                        <div
                            class="search-product-info"
                        >

                            <span>
                                ${escapeHTML(
                                    product.category ||
                                    "Fashion"
                                )}
                            </span>


                            <h4>
                                ${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}
                            </h4>


                            <p>
                                ₹${price.toLocaleString(
                                    "en-IN"
                                )}
                            </p>

                        </div>

                    </div>

                `;

            }
        );


        html += `

            </div>

        `;


        searchResults.innerHTML =
            html;


        setupSearchProductClicks();

    }


    // =================================================
    // SEARCH PRODUCT CLICK
    // =================================================

    function setupSearchProductClicks() {

        searchResults
            .querySelectorAll(
                ".search-product-card"
            )
            .forEach(
                function (card) {

                    card.addEventListener(
                        "click",
                        function () {

                            const productId =
                                this.dataset.productId;


                            if (!productId) {

                                return;

                            }


                            window.location.href =
                                "product.html?product=" +
                                encodeURIComponent(
                                    productId
                                );

                        }
                    );

                }
            );

    }


    // =================================================
    // ESCAPE HTML
    // =================================================

    function escapeHTML(value) {

        return String(value || "")
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
    // DEFAULT SEARCH
    // =================================================

    function renderDefaultSearch() {

        if (relatedSearch) {

            relatedSearch.style.display =
                "";

        }


        const products =
            getProducts();


        if (searchResults) {

            searchResults.innerHTML = `

                <div class="search-empty">

                    <div class="search-empty-icon">
                        ⌕
                    </div>

                    <p>
                        Search from
                        ${products.length}
                        available products.
                    </p>

                </div>

            `;

        }


        // =================================================
        // POPULAR SEARCH BUTTONS
        // ONLY IF THEY EXIST
        // =================================================

        if (relatedSearch) {

            relatedSearch
                .querySelectorAll(
                    "[data-search]"
                )
                .forEach(
                    function (button) {

                        button.onclick =
                            function (event) {

                                event.preventDefault();


                                const value =
                                    this.dataset.search ||
                                    "";


                                searchInput.value =
                                    value;


                                searchProducts(
                                    normalizeText(
                                        value
                                    )
                                );

                            };

                    }
                );

        }

    }


    // =================================================
    // HIDE POPULAR SEARCHES DURING SEARCH
    // =================================================

    searchInput.addEventListener(
        "input",
        function () {

            if (
                relatedSearch &&
                this.value.trim()
            ) {

                relatedSearch.style.display =
                    "none";

            }

        }
    );


    // =================================================
    // START
    // =================================================

    renderDefaultSearch();

});