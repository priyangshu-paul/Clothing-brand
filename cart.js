// =====================================================
// FASHION CART SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTS
    // =====================================================

    const cartBtn =
        document.getElementById("cartBtn");

    const cartSidebar =
        document.getElementById("cartSidebar");

    const cartOverlay =
        document.getElementById("cartOverlay");

    const closeCart =
        document.getElementById("closeCart");

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");

    const cartCount =
        document.getElementById("cartCount");

    const checkoutBtn =
        document.getElementById("homeCheckoutBtn");


    // =====================================================
    // GET CART
    // =====================================================

    function getCart() {

        const savedCart =
            localStorage.getItem("fashionCart");

        if (!savedCart) {
            return [];
        }

        try {

            const cart =
                JSON.parse(savedCart);

            if (Array.isArray(cart)) {
                return cart;
            }

            return [];

        } catch (error) {

            console.error(
                "Fashion cart error:",
                error
            );

            return [];
        }
    }


    // =====================================================
    // SAVE CART
    // =====================================================

    function saveCart(cart) {

        localStorage.setItem(
            "fashionCart",
            JSON.stringify(cart)
        );

    }


    // =====================================================
    // UPDATE CART COUNT
    // =====================================================

    function updateCartCount() {

        if (!cartCount) {
            return;
        }

        const cart =
            getCart();

        let count = 0;

        cart.forEach(function (item) {

            count +=
                Number(item.quantity) || 1;

        });


        if (count > 0) {

            cartCount.textContent =
                count;

            cartCount.style.display =
                "flex";

        } else {

            cartCount.textContent =
                "";

            cartCount.style.display =
                "none";

        }

    }


    // =====================================================
    // DISPLAY CART
    // =====================================================

    function displayCart() {

        if (!cartItems) {
            return;
        }

        const cart =
            getCart();


        // Clear old content

        cartItems.innerHTML = "";


        // =================================================
        // EMPTY CART
        // =================================================

        if (
            !Array.isArray(cart) ||
            cart.length === 0
        ) {

            cartItems.innerHTML = `

                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🛍️
                    </div>

                    <h3>
                        Your cart is empty
                    </h3>

                    <p>
                        Looks like you haven't added
                        anything yet.
                    </p>

                </div>

            `;


            if (cartTotal) {

                cartTotal.textContent =
                    "₹0";

            }

            return;
        }


        // =================================================
        // TOTAL
        // =================================================

        let total = 0;


        // =================================================
        // CREATE PRODUCTS
        // =================================================

        cart.forEach(function (item, index) {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;

            const itemTotal =
                price * quantity;


            total += itemTotal;


            // =============================================
            // CART ITEM
            // =============================================

            const cartItem =
                document.createElement("div");

            cartItem.className =
                "cart-item";


            // =============================================
            // IMAGE
            // =============================================

            const imageBox =
                document.createElement("div");

            imageBox.className =
                "cart-product-image";


            const image =
                document.createElement("img");

            image.src =
                item.image ||
                "product1.jpg";

            image.alt =
                item.name ||
                "Product";


            image.onerror =
                function () {

                    this.src =
                        "product1.jpg";

                };


            imageBox.appendChild(
                image
            );


            // =============================================
            // PRODUCT INFO
            // =============================================

            const info =
                document.createElement("div");

            info.className =
                "cart-item-info";


            // NAME

            const name =
                document.createElement("strong");

            name.textContent =
                item.name ||
                "Product";


            info.appendChild(
                name
            );


            // CATEGORY

            if (item.category) {

                const category =
                    document.createElement("p");

                category.textContent =
                    item.category;

                info.appendChild(
                    category
                );

            }


            // SIZE

            if (item.size) {

                const size =
                    document.createElement("p");

                size.textContent =
                    "Size: " +
                    item.size;

                info.appendChild(
                    size
                );

            }


            // UNIT PRICE

            const unitPrice =
                document.createElement("p");

            unitPrice.textContent =
                "₹" +
                price.toLocaleString(
                    "en-IN"
                );

            info.appendChild(
                unitPrice
            );


            // =============================================
            // QUANTITY
            // =============================================

            const quantityBox =
                document.createElement("div");

            quantityBox.className =
                "cart-quantity";


            const minus =
                document.createElement("button");

            minus.type =
                "button";

            minus.textContent =
                "−";

            minus.dataset.index =
                index;

            minus.className =
                "quantity-minus";


            const quantityText =
                document.createElement("span");

            quantityText.textContent =
                quantity;


            const plus =
                document.createElement("button");

            plus.type =
                "button";

            plus.textContent =
                "+";

            plus.dataset.index =
                index;

            plus.className =
                "quantity-plus";


            quantityBox.appendChild(
                minus
            );

            quantityBox.appendChild(
                quantityText
            );

            quantityBox.appendChild(
                plus
            );


            info.appendChild(
                quantityBox
            );


            // =============================================
            // ITEM TOTAL
            // =============================================

            const itemPrice =
                document.createElement("strong");

            itemPrice.className =
                "cart-item-price";

            itemPrice.textContent =
                "₹" +
                itemTotal.toLocaleString(
                    "en-IN"
                );


            info.appendChild(
                itemPrice
            );


            // =============================================
            // REMOVE
            // =============================================

            const remove =
                document.createElement("button");

            remove.type =
                "button";

            remove.textContent =
                "REMOVE";

            remove.className =
                "remove-cart-item";

            remove.dataset.index =
                index;


            info.appendChild(
                remove
            );


            // =============================================
            // APPEND
            // =============================================

            cartItem.appendChild(
                imageBox
            );

            cartItem.appendChild(
                info
            );

            cartItems.appendChild(
                cartItem
            );

        });


        // =================================================
        // TOTAL
        // =================================================

        if (cartTotal) {

            cartTotal.textContent =
                "₹" +
                total.toLocaleString(
                    "en-IN"
                );

        }


        // =================================================
        // QUANTITY MINUS
        // =================================================

        cartItems
            .querySelectorAll(".quantity-minus")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        const cart =
                            getCart();


                        if (!cart[index]) {
                            return;
                        }


                        let quantity =
                            Number(
                                cart[index].quantity
                            ) || 1;


                        if (quantity > 1) {

                            quantity--;

                            cart[index].quantity =
                                quantity;

                        } else {

                            cart.splice(
                                index,
                                1
                            );

                        }


                        saveCart(cart);

                        updateCartCount();

                        displayCart();

                    }
                );

            });


        // =================================================
        // QUANTITY PLUS
        // =================================================

        cartItems
            .querySelectorAll(".quantity-plus")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        const cart =
                            getCart();


                        if (!cart[index]) {
                            return;
                        }


                        const quantity =
                            Number(
                                cart[index].quantity
                            ) || 1;


                        cart[index].quantity =
                            quantity + 1;


                        saveCart(cart);

                        updateCartCount();

                        displayCart();

                    }
                );

            });


        // =================================================
        // REMOVE
        // =================================================

        cartItems
            .querySelectorAll(".remove-cart-item")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );

                        const cart =
                            getCart();


                        if (!cart[index]) {
                            return;
                        }


                        cart.splice(
                            index,
                            1
                        );


                        saveCart(cart);

                        updateCartCount();

                        displayCart();

                    }
                );

            });

    }


    // =====================================================
    // OPEN CART
    // =====================================================

    function openCart() {

        // IMPORTANT
        // Read latest localStorage every time

        updateCartCount();

        displayCart();


        if (cartSidebar) {

            cartSidebar.classList.add(
                "active"
            );

        }


        if (cartOverlay) {

            cartOverlay.classList.add(
                "active"
            );

        }

    }


    // =====================================================
    // CLOSE CART
    // =====================================================

    function closeCartSidebar() {

        if (cartSidebar) {

            cartSidebar.classList.remove(
                "active"
            );

        }


        if (cartOverlay) {

            cartOverlay.classList.remove(
                "active"
            );

        }

    }


    // =====================================================
    // CART BUTTON
    // =====================================================

    if (cartBtn) {

        cartBtn.addEventListener(
            "click",
            openCart
        );

    }


    // =====================================================
    // CLOSE BUTTON
    // =====================================================

    if (closeCart) {

        closeCart.addEventListener(
            "click",
            closeCartSidebar
        );

    }


    // =====================================================
    // OVERLAY
    // =====================================================

    if (cartOverlay) {

        cartOverlay.addEventListener(
            "click",
            closeCartSidebar
        );

    }


    // =====================================================
    // CHECKOUT
    // =====================================================

    if (checkoutBtn) {

        checkoutBtn.addEventListener(
            "click",
            function () {

                const cart =
                    getCart();


                if (
                    !Array.isArray(cart) ||
                    cart.length === 0
                ) {

                    if (
                        typeof showNotification ===
                        "function"
                    ) {

                        showNotification(
                            "Your cart is empty.",
                            "error"
                        );

                    } else {

                        alert(
                            "Your cart is empty."
                        );

                    }

                    return;
                }


                closeCartSidebar();


                window.location.href =
                    "checkout.html";

            }
        );

    }


    // =====================================================
    // CART UPDATED EVENT
    // =====================================================

    document.addEventListener(
        "cartUpdated",
        function () {

            updateCartCount();

            displayCart();

        }
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    updateCartCount();

    displayCart();

    // =====================================================
// REFRESH CART WHEN PAGE IS SHOWN AGAIN
// =====================================================

window.addEventListener("pageshow", function () {

    updateCartCount();

    displayCart();

});

});