// =====================================================
// FASHION PRODUCTS
// SUPABASE DATABASE + CART
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    "use strict";


    // =====================================================
    // CHECK SUPABASE
    // =====================================================

    if (typeof supabaseClient === "undefined") {

        console.error("supabaseClient is not defined.");

        alert(
            "Supabase is not connected. Please check supabase.js."
        );

        return;
    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const productGrid =
        document.getElementById("productGrid");

    if (!productGrid) {
        return;
    }


    // =====================================================
    // CART
    // =====================================================

    let cart =
        JSON.parse(
            localStorage.getItem("fashionCart")
        ) || [];


    function saveCart() {

        localStorage.setItem(
            "fashionCart",
            JSON.stringify(cart)
        );

    }


    // =====================================================
    // UPDATE CART COUNT
    // =====================================================

    function updateCartCount() {

        const cartCount =
            document.getElementById("cartCount");

        if (!cartCount) {
            return;
        }


        let total = 0;


        cart.forEach(function (item) {

            total +=
                Number(item.quantity) || 1;

        });


        cartCount.textContent =
            total;

    }


    // =====================================================
    // LOAD PRODUCTS FROM SUPABASE
    // =====================================================

    async function loadProducts() {

        productGrid.innerHTML = `

            <div class="admin-empty">

                <h3>Loading products...</h3>

                <p>
                    Please wait.
                </p>

            </div>

        `;


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("products")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


            if (error) {

                console.error(
                    "Supabase product loading error:",
                    error
                );


                productGrid.innerHTML = `

                    <div class="admin-empty">

                        <h3>Products could not be loaded</h3>

                        <p>
                            ${error.message}
                        </p>

                    </div>

                `;

                return;
            }


            const products =
                Array.isArray(data)
                    ? data
                    : [];


            displayProducts(products);


        } catch (error) {

            console.error(
                "Unexpected product loading error:",
                error
            );


            productGrid.innerHTML = `

                <div class="admin-empty">

                    <h3>Something went wrong</h3>

                    <p>
                        Please refresh the page.
                    </p>

                </div>

            `;

        }

    }


    // =====================================================
    // DISPLAY PRODUCTS
    // =====================================================

    function displayProducts(products) {

        productGrid.innerHTML = "";


        if (products.length === 0) {

            productGrid.innerHTML = `

                <div class="admin-empty">

                    <h3>No products available</h3>

                    <p>
                        Add products from Admin Dashboard.
                    </p>

                </div>

            `;

            return;

        }


        products.forEach(function (product) {

            const card =
                document.createElement("div");


            card.className =
                "product-card";


            const price =
                Number(product.price) || 0;


            card.innerHTML = `

                <a
                    href="product.html?product=${encodeURIComponent(product.id)}"
                    class="product-image"
                >

                    <img
                        src="${product.image || ""}"
                        alt="${escapeHTML(product.name || "Product")}"
                        loading="lazy"
                    >

                </a>


                <div class="product-info">

                    <span class="product-category">

                        ${escapeHTML(
                            product.category || "Fashion"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            product.name || "Product"
                        )}

                    </h3>


                    <p>

                        ₹${price.toLocaleString("en-IN")}

                    </p>


                    <button
                        type="button"
                        class="add-cart"
                        data-product-id="${product.id}"
                    >

                        ADD TO CART

                    </button>

                </div>

            `;


            productGrid.appendChild(card);

        });


        attachCartEvents();

    }


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // =====================================================
    // ADD TO CART EVENTS
    // =====================================================

    function attachCartEvents() {

        document
            .querySelectorAll(".add-cart")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();


                        const productId =
                            this.dataset.productId;


                        addProductToCart(productId);

                    }
                );

            });

    }


    // =====================================================
    // ADD PRODUCT TO CART
    // =====================================================

    async function addProductToCart(productId) {

        try {

            const {
                data: product,
                error
            } = await supabaseClient
                .from("products")
                .select("*")
                .eq("id", productId)
                .single();


            if (error) {

                console.error(
                    "Product fetch error:",
                    error
                );

                alert(
                    "Product could not be found."
                );

                return;

            }


            if (!product) {

                alert(
                    "Product not found."
                );

                return;

            }


            // =================================================
            // STOCK CHECK
            // =================================================

            const stock =
                Number(product.stock) || 0;


            if (stock <= 0) {

                showNotification(
                    "This product is out of stock.",
                    "error"
                );

                return;

            }


            const price =
                Number(product.price) || 0;


            // =================================================
            // CHECK EXISTING CART ITEM
            // =================================================

            const existingItem =
                cart.find(function (item) {

                    return String(item.id) ===
                        String(product.id);

                });


            if (existingItem) {

                const currentQuantity =
                    Number(
                        existingItem.quantity || 1
                    );


                if (currentQuantity >= stock) {

                    showNotification(
                        "Maximum available stock reached.",
                        "error"
                    );

                    return;

                }


                existingItem.quantity =
                    currentQuantity + 1;

            } else {

                cart.push({

                    id:
                        product.id,

                    name:
                        product.name,

                    price:
                        price,

                    image:
                        product.image || "",

                    category:
                        product.category || "Fashion",

                    gender:
                        product.gender || "unisex",

                    size:
                        "",

                    quantity:
                        1

                });

            }


            saveCart();

            updateCartCount();


            showNotification(
                product.name +
                " added to cart!",
                "success"
            );


        } catch (error) {

            console.error(
                "Add to cart error:",
                error
            );


            showNotification(
                "Could not add product to cart.",
                "error"
            );

        }

    }


    // =====================================================
    // NOTIFICATION FALLBACK
    // =====================================================

    function showNotification(message, type = "success") {

        if (
            typeof window.showNotification ===
            "function"
        ) {

            window.showNotification(
                message,
                type
            );

            return;

        }


        alert(message);

    }


    // =====================================================
    // INITIAL CART COUNT
    // =====================================================

    updateCartCount();


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    await loadProducts();

});