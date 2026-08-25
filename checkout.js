// =====================================================
// FASHION CHECKOUT SYSTEM
// SUPABASE ORDER SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // SUPABASE CONFIG
    // =====================================================

    const SUPABASE_URL =
        "https://xmankokjmwantzshulkt.supabase.co";

    const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzIiwicmVmIjoieG1hbmtramsd2FudHpzaHVsa3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NzYwMjM4NywiZXhwIjoyMTAzMTczODM3fQ.Fv1fJEinmFffVQ6--XerglDaH7eSbW7ACBeVnTVS_8w";


    // =====================================================
    // CHECK SUPABASE LIBRARY
    // =====================================================

    if (
        typeof window.supabase === "undefined"
    ) {

        console.error(
            "Supabase library not loaded."
        );

        alert(
            "Supabase connection library is missing."
        );

        return;
    }


    // =====================================================
    // CREATE SUPABASE CLIENT
    // =====================================================

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    // =====================================================
    // GET CART
    // =====================================================

    let cart =
        JSON.parse(
            localStorage.getItem("fashionCart")
        ) || [];


    // =====================================================
    // GET LOGGED-IN USER
    // =====================================================

    const loggedInUser =
        JSON.parse(
            localStorage.getItem("fashionLoggedIn")
        );


    // =====================================================
    // ELEMENTS
    // =====================================================

    const checkoutItems =
        document.getElementById(
            "checkoutItems"
        );

    const checkoutSubtotal =
        document.getElementById(
            "checkoutSubtotal"
        );

    const checkoutShipping =
        document.getElementById(
            "checkoutShipping"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );

    const placeOrder =
        document.getElementById(
            "placeOrder"
        );


    // =====================================================
    // CHECK LOGIN
    // =====================================================

    if (!loggedInUser) {

        if (
            typeof showNotification ===
            "function"
        ) {

            showNotification(
                "Please login before checkout.",
                "error"
            );

        } else {

            alert(
                "Please login before checkout."
            );

        }


        if (placeOrder) {

            placeOrder.disabled =
                true;

        }


        setTimeout(
            function () {

                window.location.href =
                    "login.html";

            },
            1200
        );


        return;
    }


    // =====================================================
    // AUTO-FILL USER PROFILE
    // =====================================================

    function fillUserInformation() {

        const email =
            document.getElementById(
                "email"
            );

        const firstName =
            document.getElementById(
                "firstName"
            );

        const lastName =
            document.getElementById(
                "lastName"
            );

        const address =
            document.getElementById(
                "address"
            );

        const city =
            document.getElementById(
                "city"
            );

        const pincode =
            document.getElementById(
                "pincode"
            );

        const phone =
            document.getElementById(
                "phone"
            );


        // EMAIL

        if (email) {

            email.value =
                loggedInUser.email || "";

        }


        // NAME

        if (loggedInUser.name) {

            const nameParts =
                loggedInUser.name
                    .trim()
                    .split(/\s+/);


            if (firstName) {

                firstName.value =
                    nameParts[0] || "";

            }


            if (lastName) {

                lastName.value =
                    nameParts
                        .slice(1)
                        .join(" ");

            }

        }


        // ADDRESS

        if (address) {

            address.value =
                loggedInUser.address || "";

        }


        // CITY

        if (city) {

            city.value =
                loggedInUser.city || "";

        }


        // PINCODE

        if (pincode) {

            pincode.value =
                loggedInUser.pincode || "";

        }


        // PHONE

        if (phone) {

            phone.value =
                loggedInUser.phone || "";

        }

    }


    // =====================================================
    // DISPLAY CHECKOUT
    // =====================================================

    function displayCheckout() {

        if (!checkoutItems) {
            return;
        }


        checkoutItems.innerHTML = "";


        // =================================================
        // EMPTY CART
        // =================================================

        if (cart.length === 0) {

            const emptyBox =
                document.createElement(
                    "div"
                );

            emptyBox.className =
                "checkout-empty";


            const heading =
                document.createElement(
                    "h3"
                );

            heading.textContent =
                "Your cart is empty";


            const text =
                document.createElement(
                    "p"
                );

            text.textContent =
                "Add some products before checkout.";


            const link =
                document.createElement(
                    "a"
                );

            link.href =
                "index.html#shop";

            link.textContent =
                "CONTINUE SHOPPING";


            emptyBox.appendChild(
                heading
            );

            emptyBox.appendChild(
                text
            );

            emptyBox.appendChild(
                link
            );


            checkoutItems.appendChild(
                emptyBox
            );


            if (checkoutSubtotal) {

                checkoutSubtotal.textContent =
                    "₹0";

            }


            if (checkoutShipping) {

                checkoutShipping.textContent =
                    "₹0";

            }


            if (checkoutTotal) {

                checkoutTotal.textContent =
                    "₹0";

            }


            if (placeOrder) {

                placeOrder.disabled =
                    true;

            }


            return;
        }


        if (placeOrder) {

            placeOrder.disabled =
                false;

        }


        let subtotal = 0;


        // =================================================
        // PRODUCTS
        // =================================================

        cart.forEach(
            function (item) {

                const price =
                    Number(
                        item.price
                    ) || 0;


                const quantity =
                    Number(
                        item.quantity
                    ) || 1;


                const itemTotal =
                    price * quantity;


                subtotal +=
                    itemTotal;


                const checkoutItem =
                    document.createElement(
                        "div"
                    );

                checkoutItem.className =
                    "checkout-item";


                // IMAGE

                const imageBox =
                    document.createElement(
                        "div"
                    );

                imageBox.className =
                    "checkout-product-image";


                const image =
                    document.createElement(
                        "img"
                    );

                image.src =
                    item.image ||
                    "images/product1.jpg";

                image.alt =
                    item.name ||
                    "Product";


                const quantityBadge =
                    document.createElement(
                        "span"
                    );

                quantityBadge.className =
                    "checkout-quantity";

                quantityBadge.textContent =
                    quantity;


                imageBox.appendChild(
                    image
                );

                imageBox.appendChild(
                    quantityBadge
                );


                // PRODUCT INFO

                const productInfo =
                    document.createElement(
                        "div"
                    );

                productInfo.className =
                    "checkout-product-info";


                const name =
                    document.createElement(
                        "h3"
                    );

                name.textContent =
                    item.name ||
                    "Product";


                productInfo.appendChild(
                    name
                );


                // SIZE

                if (item.size) {

                    const size =
                        document.createElement(
                            "p"
                        );

                    size.textContent =
                        "Size: " +
                        item.size;


                    productInfo.appendChild(
                        size
                    );

                }


                // PRICE

                const priceText =
                    document.createElement(
                        "span"
                    );

                priceText.textContent =
                    "₹" +
                    price.toLocaleString(
                        "en-IN"
                    );


                productInfo.appendChild(
                    priceText
                );


                // ITEM TOTAL

                const itemTotalElement =
                    document.createElement(
                        "strong"
                    );

                itemTotalElement.className =
                    "checkout-item-total";

                itemTotalElement.textContent =
                    "₹" +
                    itemTotal.toLocaleString(
                        "en-IN"
                    );


                checkoutItem.appendChild(
                    imageBox
                );

                checkoutItem.appendChild(
                    productInfo
                );

                checkoutItem.appendChild(
                    itemTotalElement
                );


                checkoutItems.appendChild(
                    checkoutItem
                );

            }
        );


        // =================================================
        // SHIPPING
        // =================================================

        const shipping =
            subtotal >= 1999
                ? 0
                : 99;


        const total =
            subtotal + shipping;


        // =================================================
        // TOTALS
        // =================================================

        if (checkoutSubtotal) {

            checkoutSubtotal.textContent =
                "₹" +
                subtotal.toLocaleString(
                    "en-IN"
                );

        }


        if (checkoutShipping) {

            checkoutShipping.textContent =
                shipping === 0
                    ? "FREE"
                    : "₹" +
                      shipping.toLocaleString(
                          "en-IN"
                      );

        }


        if (checkoutTotal) {

            checkoutTotal.textContent =
                "₹" +
                total.toLocaleString(
                    "en-IN"
                );

        }

    }


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    function validateForm() {

        const email =
            document.getElementById(
                "email"
            );

        const firstName =
            document.getElementById(
                "firstName"
            );

        const lastName =
            document.getElementById(
                "lastName"
            );

        const address =
            document.getElementById(
                "address"
            );

        const city =
            document.getElementById(
                "city"
            );

        const pincode =
            document.getElementById(
                "pincode"
            );

        const phone =
            document.getElementById(
                "phone"
            );


        if (
            !email ||
            !email.value.trim()
        ) {

            showNotification(
                "Please enter your email address.",
                "error"
            );

            if (email) {
                email.focus();
            }

            return false;

        }


        if (
            !firstName ||
            !firstName.value.trim()
        ) {

            showNotification(
                "Please enter your first name.",
                "error"
            );

            if (firstName) {
                firstName.focus();
            }

            return false;

        }


        if (
            !lastName ||
            !lastName.value.trim()
        ) {

            showNotification(
                "Please enter your last name.",
                "error"
            );

            if (lastName) {
                lastName.focus();
            }

            return false;

        }


        if (
            !address ||
            !address.value.trim()
        ) {

            showNotification(
                "Please enter your shipping address.",
                "error"
            );

            if (address) {
                address.focus();
            }

            return false;

        }


        if (
            !city ||
            !city.value.trim()
        ) {

            showNotification(
                "Please enter your city.",
                "error"
            );

            if (city) {
                city.focus();
            }

            return false;

        }


        if (
            !pincode ||
            !/^[0-9]{6}$/.test(
                pincode.value.trim()
            )
        ) {

            showNotification(
                "Please enter a valid 6-digit PIN code.",
                "error"
            );

            if (pincode) {
                pincode.focus();
            }

            return false;

        }


        if (
            !phone ||
            !/^[0-9]{10}$/.test(
                phone.value.trim()
            )
        ) {

            showNotification(
                "Please enter a valid 10-digit phone number.",
                "error"
            );

            if (phone) {
                phone.focus();
            }

            return false;

        }


        return true;

    }


    // =====================================================
    // PLACE ORDER
    // =====================================================

    if (placeOrder) {

        placeOrder.addEventListener(
            "click",
            async function () {

                // =============================================
                // PREVENT DOUBLE CLICK
                // =============================================

                if (
                    placeOrder.disabled
                ) {
                    return;
                }


                // =============================================
                // EMPTY CART
                // =============================================

                if (
                    cart.length === 0
                ) {

                    showNotification(
                        "Your cart is empty.",
                        "error"
                    );

                    return;

                }


                // =============================================
                // VALIDATION
                // =============================================

                if (
                    !validateForm()
                ) {

                    return;

                }


                // =============================================
                // DISABLE BUTTON
                // =============================================

                placeOrder.disabled =
                    true;

                placeOrder.textContent =
                    "PLACING ORDER...";


                try {

                    // =========================================
                    // PAYMENT
                    // =========================================

                    const selectedPayment =
                        document.querySelector(
                            'input[name="payment"]:checked'
                        );


                    const paymentMethod =
                        selectedPayment
                            ? selectedPayment.value
                            : "cod";


                    // =========================================
                    // CALCULATE TOTAL
                    // =========================================

                    let subtotal = 0;


                    cart.forEach(
                        function (item) {

                            const price =
                                Number(
                                    item.price
                                ) || 0;


                            const quantity =
                                Number(
                                    item.quantity
                                ) || 1;


                            subtotal +=
                                price *
                                quantity;

                        }
                    );


                    const shipping =
                        subtotal >= 1999
                            ? 0
                            : 99;


                    const total =
                        subtotal +
                        shipping;


                    // =========================================
                    // ORDER ID
                    // =========================================

                    const orderId =
                        "FASH" +
                        Date.now();


                    // =========================================
                    // FORM VALUES
                    // =========================================

                    const email =
                        document
                            .getElementById(
                                "email"
                            )
                            .value
                            .trim();


                    const firstName =
                        document
                            .getElementById(
                                "firstName"
                            )
                            .value
                            .trim();


                    const lastName =
                        document
                            .getElementById(
                                "lastName"
                            )
                            .value
                            .trim();


                    const address =
                        document
                            .getElementById(
                                "address"
                            )
                            .value
                            .trim();


                    const city =
                        document
                            .getElementById(
                                "city"
                            )
                            .value
                            .trim();


                    const pincode =
                        document
                            .getElementById(
                                "pincode"
                            )
                            .value
                            .trim();


                    const phone =
                        document
                            .getElementById(
                                "phone"
                            )
                            .value
                            .trim();


                    // =========================================
                    // CUSTOMER DATA
                    // =========================================

                    const customerName =
                        (
                            firstName +
                            " " +
                            lastName
                        ).trim();


                    const shippingAddress =
                        [
                            address,
                            city,
                            pincode
                        ]
                            .filter(Boolean)
                            .join(", ");


                    // =========================================
                    // SUPABASE ORDER DATA
                    // =========================================

                    const orderData = {

                        // customer
                        customer_name:
                            customerName,

                        customer_email:
                            email,

                        customer_phone:
                            phone,

                        shipping_address:
                            shippingAddress,

                        // products
                        items:
                            cart,

                        // price
                        total:
                            total,

                        // status
                        status:
                            "Confirmed"

                    };


                    console.log(
                        "Sending order to Supabase:",
                        orderData
                    );


                    // =========================================
                    // INSERT INTO SUPABASE
                    // =========================================

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("orders")
                            .insert(
                                [orderData]
                            )
                            .select()
                            .single();


                    // =========================================
                    // HANDLE ERROR
                    // =========================================

                    if (error) {

                        console.error(
                            "Supabase order error:",
                            error
                        );

                        throw error;

                    }


                    console.log(
                        "Order saved successfully:",
                        data
                    );


                    // =========================================
                    // CREATE SUCCESS ORDER OBJECT
                    // =========================================

                    const successOrder = {

                        id:
                            data.id,

                        orderId:
                            orderId,

                        orderNumber:
                            orderId,

                        userId:
                            loggedInUser.id,

                        customer: {

                            userId:
                                loggedInUser.id,

                            name:
                                customerName,

                            email:
                                email,

                            firstName:
                                firstName,

                            lastName:
                                lastName,

                            address:
                                address,

                            city:
                                city,

                            pincode:
                                pincode,

                            phone:
                                phone

                        },

                        payment:
                            paymentMethod,

                        items:
                            cart,

                        products:
                            cart,

                        subtotal:
                            subtotal,

                        shipping:
                            shipping,

                        total:
                            total,

                        status:
                            "Confirmed",

                        date:
                            data.created_at ||
                            new Date().toISOString()

                    };


                    // =========================================
                    // SAVE LAST ORDER
                    // ONLY FOR SUCCESS PAGE
                    // =========================================

                    localStorage.setItem(
                        "fashionLastOrder",
                        JSON.stringify(
                            successOrder
                        )
                    );


                    // =========================================
                    // CLEAR CART
                    // =========================================

                    localStorage.setItem(
                        "fashionCart",
                        JSON.stringify([])
                    );


                    cart = [];


                    // =========================================
                    // UPDATE CART UI
                    // =========================================

                    document.dispatchEvent(
                        new CustomEvent(
                            "cartUpdated",
                            {
                                detail: {
                                    cart: []
                                }
                            }
                        )
                    );


                    // =========================================
                    // SUCCESS MESSAGE
                    // =========================================

                    if (
                        typeof showNotification ===
                        "function"
                    ) {

                        showNotification(
                            "Your order has been placed successfully."
                        );

                    } else {

                        alert(
                            "Your order has been placed successfully."
                        );

                    }


                    // =========================================
                    // REDIRECT
                    // =========================================

                    setTimeout(
                        function () {

                            window.location.href =
                                "order-success.html";

                        },
                        1200
                    );

                } catch (error) {

                    console.error(
                        "ORDER PLACEMENT FAILED:",
                        error
                    );


                    // =========================================
                    // RESTORE BUTTON
                    // =========================================

                    placeOrder.disabled =
                        false;

                    placeOrder.textContent =
                        "PLACE ORDER";


                    // =========================================
                    // ERROR MESSAGE
                    // =========================================

                    let message =
                        "Unable to place order. Please try again.";


                    if (
                        error &&
                        error.message
                    ) {

                        console.error(
                            error.message
                        );

                    }


                    if (
                        typeof showNotification ===
                        "function"
                    ) {

                        showNotification(
                            message,
                            "error"
                        );

                    } else {

                        alert(
                            message
                        );

                    }

                }

            }
        );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    fillUserInformation();

    displayCheckout();

});