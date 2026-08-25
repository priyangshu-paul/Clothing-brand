// =====================================================
// FASHION WEBSITE MAIN SCRIPT
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // CART DATA
    // =====================================================

    let cart =
        JSON.parse(
            localStorage.getItem("fashionCart")
        ) || [];


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
    // SAVE CART
    // =====================================================

    function saveCart() {

        localStorage.setItem(
            "fashionCart",
            JSON.stringify(cart)
        );

        if (typeof showNotification === "function") {

    showNotification(
        selectedProduct.name +
        " has been added to your cart."
    );

}

    }


    // =====================================================
    // UPDATE CART COUNT
    // =====================================================

    function updateCartCount() {

        if (!cartCount) {
            return;
        }


        let totalItems = 0;


        cart.forEach(function (item) {

            totalItems +=
                Number(item.quantity) || 1;

        });


        cartCount.textContent =
            totalItems;

    }


    // =====================================================
    // DISPLAY CART
    // =====================================================

    function displayCart() {

        if (!cartItems) {
            return;
        }


        cartItems.innerHTML = "";


        if (cart.length === 0) {

            cartItems.innerHTML = `

                <p class="empty-cart">
                    Your cart is empty.
                </p>

            `;


            if (cartTotal) {

                cartTotal.textContent =
                    "₹0";

            }

            return;

        }


        let total = 0;


        cart.forEach(function (item, index) {

            const price =
                Number(item.price) || 0;

            const quantity =
                Number(item.quantity) || 1;


            total +=
                price * quantity;


            const cartItem =
                document.createElement("div");


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <img
                    src="${item.image || ""}"
                    alt="${item.name || "Product"}"
                >


                <div class="cart-item-info">

                    <strong>
                        ${item.name || "Product"}
                    </strong>


                    ${
                        item.size
                        ? `<p>Size: ${item.size}</p>`
                        : ""
                    }


                    <div class="cart-quantity">

                        <button
                            type="button"
                            class="cart-minus"
                            data-index="${index}"
                        >
                            −
                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            class="cart-plus"
                            data-index="${index}"
                        >
                            +
                        </button>

                    </div>


                    <strong>

                        ₹${(
                            price * quantity
                        ).toLocaleString("en-IN")}

                    </strong>


                    <button
                        type="button"
                        class="remove-cart-item"
                        data-index="${index}"
                    >
                        REMOVE
                    </button>

                </div>

            `;


            cartItems.appendChild(cartItem);

        });


        if (cartTotal) {

            cartTotal.textContent =
                "₹" +
                total.toLocaleString("en-IN");

        }


        // =================================================
        // PLUS BUTTON
        // =================================================

        document
            .querySelectorAll(".cart-plus")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        cart[index].quantity =
                            Number(
                                cart[index].quantity || 1
                            ) + 1;


                        saveCart();

                        updateCartCount();

                        displayCart();

                    }
                );

            });


        // =================================================
        // MINUS BUTTON
        // =================================================

        document
            .querySelectorAll(".cart-minus")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        const currentQuantity =
                            Number(
                                cart[index].quantity || 1
                            );


                        if (currentQuantity > 1) {

                            cart[index].quantity =
                                currentQuantity - 1;

                        } else {

                            cart.splice(
                                index,
                                1
                            );

                        }


                        saveCart();

                        updateCartCount();

                        displayCart();

                    }
                );

            });


        // =================================================
        // REMOVE BUTTON
        // =================================================

        document
            .querySelectorAll(".remove-cart-item")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        cart.splice(
                            index,
                            1
                        );


                        saveCart();

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


        displayCart();

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

                if (cart.length === 0) {

                    alert(
                        "Your cart is empty."
                    );

                    return;

                }


                window.location.href =
                    "checkout.html";

            }
        );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    updateCartCount();

    displayCart();

});