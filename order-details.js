// =====================================================
// FASHION ORDER DETAILS SYSTEM
// ORDER DETAILS + CANCEL ORDER + PRODUCT REVIEW
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // LOGIN CHECK
    // =====================================================

    const loggedInUser = JSON.parse(
        localStorage.getItem("fashionLoggedIn")
    );

    if (!loggedInUser) {
        window.location.href = "login.html";
        return;
    }


    // =====================================================
    // GET SELECTED ORDER
    // =====================================================

    let selectedOrder = JSON.parse(
        localStorage.getItem("selectedOrder")
    );

    if (!selectedOrder) {

        alert("Order details not found.");

        window.location.href = "account.html";

        return;
    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const orderNumber =
        document.getElementById("orderNumber");

    const orderDate =
        document.getElementById("orderDate");

    const orderStatus =
        document.getElementById("orderStatus");

    const orderTracking =
        document.getElementById("orderTracking");

    const orderProducts =
        document.getElementById("orderProducts");

    const customerName =
        document.getElementById("customerName");

    const customerPhone =
        document.getElementById("customerPhone");

    const customerAddress =
        document.getElementById("customerAddress");

    const paymentMethod =
        document.getElementById("paymentMethod");

    const orderSubtotal =
        document.getElementById("orderSubtotal");

    const orderShipping =
        document.getElementById("orderShipping");

    const orderTotal =
        document.getElementById("orderTotal");

    const cancelSection =
        document.getElementById("cancelSection");

    const cancelOrderBtn =
        document.getElementById("cancelOrderBtn");

    const reviewSection =
        document.getElementById("reviewSection");

    const reviewProducts =
        document.getElementById("reviewProducts");


    // =====================================================
    // HELPERS
    // =====================================================

    function getProducts(order) {

        return (
            order.products ||
            order.items ||
            []
        );

    }


    function getStatus(order) {

        return (
            order.status ||
            "Confirmed"
        );

    }


    function formatDate(value) {

        if (!value) {
            return "Date unavailable";
        }

        const date =
            new Date(value);

        if (
            isNaN(
                date.getTime()
            )
        ) {
            return "Date unavailable";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    function formatPrice(value) {

        const number =
            Number(value) || 0;

        return (
            "₹" +
            number.toLocaleString("en-IN")
        );

    }


    function getOrderNumber(order) {

        return (
            order.orderNumber ||
            order.orderId ||
            order.id ||
            "N/A"
        );

    }


    // =====================================================
    // GET CURRENT ORDERS
    // =====================================================

    function getAllOrders() {

        return (
            JSON.parse(
                localStorage.getItem(
                    "fashionOrders"
                )
            ) || []
        );

    }


    // =====================================================
    // FIND UPDATED ORDER
    // =====================================================

    function syncSelectedOrder() {

        const orders =
            getAllOrders();

        const selectedId =
            String(
                selectedOrder.orderNumber ||
                selectedOrder.orderId ||
                selectedOrder.id ||
                ""
            );

        const updatedOrder =
            orders.find(
                function (order) {

                    const currentId =
                        String(
                            order.orderNumber ||
                            order.orderId ||
                            order.id ||
                            ""
                        );

                    return (
                        currentId ===
                        selectedId
                    );

                }
            );

        if (updatedOrder) {

            selectedOrder =
                updatedOrder;

            localStorage.setItem(
                "selectedOrder",
                JSON.stringify(
                    selectedOrder
                )
            );

        }

    }


    // =====================================================
    // UPDATE LOCAL STORAGE ORDER
    // =====================================================

    function saveOrderUpdate(updatedOrder) {

        const orders =
            getAllOrders();

        const targetId =
            String(
                updatedOrder.orderNumber ||
                updatedOrder.orderId ||
                updatedOrder.id ||
                ""
            );


        const index =
            orders.findIndex(
                function (order) {

                    const currentId =
                        String(
                            order.orderNumber ||
                            order.orderId ||
                            order.id ||
                            ""
                        );

                    return (
                        currentId ===
                        targetId
                    );

                }
            );


        if (index !== -1) {

            orders[index] =
                updatedOrder;

        } else {

            orders.push(
                updatedOrder
            );

        }


        localStorage.setItem(
            "fashionOrders",
            JSON.stringify(
                orders
            )
        );


        localStorage.setItem(
            "selectedOrder",
            JSON.stringify(
                updatedOrder
            )
        );


        selectedOrder =
            updatedOrder;

    }


    // =====================================================
    // ORDER HEADER
    // =====================================================

    function renderHeader() {

        if (orderNumber) {

            orderNumber.textContent =
                "#" +
                getOrderNumber(
                    selectedOrder
                );

        }


        if (orderDate) {

            orderDate.textContent =
                "Placed on " +
                formatDate(
                    selectedOrder.date ||
                    selectedOrder.createdAt ||
                    selectedOrder.orderDate
                );

        }


        const status =
            getStatus(
                selectedOrder
            );


        if (orderStatus) {

            orderStatus.textContent =
                status.toUpperCase();

            orderStatus.className =
                "order-status-badge " +
                status
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );

        }

    }


    // =====================================================
    // TRACKING
    // =====================================================

    function renderTracking() {

        if (!orderTracking) {
            return;
        }


        const status =
            getStatus(
                selectedOrder
            )
            .toLowerCase();


        const steps = [
            {
                name: "Confirmed",
                description: "Order placed"
            },
            {
                name: "Processing",
                description: "Preparing item"
            },
            {
                name: "Shipped",
                description: "On the way"
            },
            {
                name: "Delivered",
                description: "Delivered"
            }
        ];


        let currentStep = 0;


        if (status === "confirmed") {

            currentStep = 0;

        } else if (
            status === "processing"
        ) {

            currentStep = 1;

        } else if (
            status === "shipped"
        ) {

            currentStep = 2;

        } else if (
            status === "delivered"
        ) {

            currentStep = 3;

        } else if (
            status === "cancelled"
        ) {

            currentStep = -1;

        }


        let html = "";


        steps.forEach(
            function (step, index) {

                let classes =
                    "tracking-step";


                if (
                    currentStep >= 0 &&
                    index <= currentStep
                ) {

                    classes +=
                        " completed";

                }


                if (
                    currentStep === index
                ) {

                    classes +=
                        " active";

                }


                html += `

                    <div class="${classes}">

                        <div class="tracking-circle">

                            ${
                                currentStep >= 0 &&
                                index <= currentStep
                                    ? "✓"
                                    : index + 1
                            }

                        </div>

                        <div class="tracking-content">

                            <strong>
                                ${step.name}
                            </strong>

                            <span>
                                ${step.description}
                            </span>

                        </div>

                    </div>

                `;

            }
        );


        // CANCELLED ORDER

        if (status === "cancelled") {

            html = `

                <div class="tracking-step completed">

                    <div class="tracking-circle">
                        ✓
                    </div>

                    <div class="tracking-content">

                        <strong>
                            Order Placed
                        </strong>

                        <span>
                            Order received
                        </span>

                    </div>

                </div>


                <div class="tracking-step completed">

                    <div class="tracking-circle">
                        ✕
                    </div>

                    <div class="tracking-content">

                        <strong>
                            Cancelled
                        </strong>

                        <span>
                            Order cancelled
                        </span>

                    </div>

                </div>

            `;

        }


        orderTracking.innerHTML =
            html;

    }


    // =====================================================
    // PRODUCTS
    // =====================================================

    function renderProducts() {

        if (!orderProducts) {
            return;
        }


        const products =
            getProducts(
                selectedOrder
            );


        if (
            products.length === 0
        ) {

            orderProducts.innerHTML = `

                <div class="order-product">

                    <div class="order-product-info">

                        <h3>
                            Product information unavailable
                        </h3>

                    </div>

                </div>

            `;

            return;

        }


        orderProducts.innerHTML = "";


        products.forEach(
            function (product) {

                const quantity =
                    Number(
                        product.quantity
                    ) || 1;


                const price =
                    Number(
                        product.price
                    ) || 0;


                const total =
                    price *
                    quantity;


                const productHTML = `

                    <div class="order-product">

                        <div class="order-product-image">

                            <img
                                src="${
                                    product.image ||
                                    "product1.jpg"
                                }"
                                alt="${
                                    product.name ||
                                    "Product"
                                }"
                            >

                        </div>


                        <div class="order-product-info">

                            <h3>
                                ${
                                    product.name ||
                                    "Product"
                                }
                            </h3>


                            ${
                                product.size
                                    ? `
                                        <p>
                                            Size: ${product.size}
                                        </p>
                                    `
                                    : ""
                            }


                            <p>
                                Quantity: ${quantity}
                            </p>


                            <p>
                                Price: ${formatPrice(price)}
                            </p>

                        </div>


                        <div class="order-product-price">

                            ${formatPrice(total)}

                        </div>

                    </div>

                `;


                orderProducts.insertAdjacentHTML(
                    "beforeend",
                    productHTML
                );

            }
        );

    }


    // =====================================================
    // DELIVERY INFORMATION
    // =====================================================

    function renderDelivery() {

        const customer =
            selectedOrder.customer ||
            selectedOrder.user ||
            {};


        const name =
            selectedOrder.customerName ||
            customer.name ||
            selectedOrder.name ||
            loggedInUser.name ||
            "Not available";


        const phone =
            selectedOrder.customerPhone ||
            customer.phone ||
            selectedOrder.phone ||
            loggedInUser.phone ||
            "Not available";


        const address =
            selectedOrder.address ||
            customer.address ||
            loggedInUser.address ||
            "Not available";


        const city =
            selectedOrder.city ||
            customer.city ||
            loggedInUser.city ||
            "";


        const pincode =
            selectedOrder.pincode ||
            customer.pincode ||
            loggedInUser.pincode ||
            "";


        if (customerName) {

            customerName.textContent =
                name;

        }


        if (customerPhone) {

            customerPhone.textContent =
                phone;

        }


        if (customerAddress) {

            let fullAddress =
                address;

            if (city) {

                fullAddress +=
                    ", " + city;

            }

            if (pincode) {

                fullAddress +=
                    " - " + pincode;

            }


            customerAddress.textContent =
                fullAddress;

        }

    }


    // =====================================================
    // PAYMENT & PRICE
    // =====================================================

    function renderPayment() {

        const products =
            getProducts(
                selectedOrder
            );


        let subtotal = 0;


        products.forEach(
            function (product) {

                const price =
                    Number(
                        product.price
                    ) || 0;


                const quantity =
                    Number(
                        product.quantity
                    ) || 1;


                subtotal +=
                    price *
                    quantity;

            }
        );


        let total =
            Number(
                selectedOrder.total
            );


        // Handle "₹1,999" string

        if (
            isNaN(total)
        ) {

            total =
                parseFloat(
                    String(
                        selectedOrder.total ||
                        ""
                    )
                    .replace(
                        /[^0-9.]/g,
                        ""
                    )
                ) || 0;

        }


        if (
            total === 0 &&
            subtotal > 0
        ) {

            total =
                subtotal;

        }


        const shipping =
            total > subtotal
                ? total - subtotal
                : 0;


        if (paymentMethod) {

            if (
                selectedOrder.payment ===
                "cod"
            ) {

                paymentMethod.textContent =
                    "Cash on Delivery";

            } else {

                paymentMethod.textContent =
                    "Online Payment";

            }

        }


        if (orderSubtotal) {

            orderSubtotal.textContent =
                formatPrice(
                    subtotal
                );

        }


        if (orderShipping) {

            if (shipping <= 0) {

                orderShipping.textContent =
                    "FREE";

            } else {

                orderShipping.textContent =
                    formatPrice(
                        shipping
                    );

            }

        }


        if (orderTotal) {

            orderTotal.textContent =
                formatPrice(
                    total
                );

        }

    }


    // =====================================================
    // CANCEL ORDER VISIBILITY
    // =====================================================

    function updateCancelSection() {

        if (
            !cancelSection ||
            !cancelOrderBtn
        ) {
            return;
        }


        const status =
            getStatus(
                selectedOrder
            )
            .toLowerCase();


        // Only these statuses can be cancelled

        const canCancel =
            status === "confirmed" ||
            status === "processing";


        if (canCancel) {

            cancelSection.style.display =
                "flex";

            cancelOrderBtn.disabled =
                false;

            cancelOrderBtn.textContent =
                "CANCEL ORDER";

        } else {

            cancelSection.style.display =
                "none";

        }

    }


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    if (cancelOrderBtn) {

        cancelOrderBtn.addEventListener(
            "click",
            function () {

                const currentStatus =
                    getStatus(
                        selectedOrder
                    )
                    .toLowerCase();


                if (
                    currentStatus !==
                        "confirmed" &&
                    currentStatus !==
                        "processing"
                ) {

                    alert(
                        "This order can no longer be cancelled."
                    );

                    return;

                }


                const confirmed =
                    window.confirm(
                        "Are you sure you want to cancel this order?"
                    );


                if (!confirmed) {
                    return;
                }


                // UPDATE STATUS

                selectedOrder.status =
                    "Cancelled";


                selectedOrder.cancelled =
                    true;


                selectedOrder.cancelledAt =
                    new Date().toISOString();


                selectedOrder.cancelReason =
                    "Cancelled by customer";


                // SAVE

                saveOrderUpdate(
                    selectedOrder
                );


                // REFRESH PAGE UI

                renderHeader();

                renderTracking();

                updateCancelSection();


                // HIDE REVIEW

                if (reviewSection) {

                    reviewSection.classList.remove(
                        "visible"
                    );

                }


                alert(
                    "Your order has been cancelled successfully."
                );

            }
        );

    }


    // =====================================================
    // REVIEWS STORAGE
    // =====================================================

    function getReviews() {

        return (
            JSON.parse(
                localStorage.getItem(
                    "fashionReviews"
                )
            ) || []
        );

    }


    function saveReviews(reviews) {

        localStorage.setItem(
            "fashionReviews",
            JSON.stringify(
                reviews
            )
        );

    }


    // =====================================================
    // GET PRODUCT REVIEW
    // =====================================================

    function getProductReview(
        product,
        index
    ) {

        const reviews =
            getReviews();


        const productId =
            product.id ||
            product.productId ||
            product.name ||
            index;


        return reviews.find(
            function (review) {

                return (
                    String(
                        review.orderId
                    ) ===
                    String(
                        getOrderNumber(
                            selectedOrder
                        )
                    ) &&
                    String(
                        review.productId
                    ) ===
                    String(
                        productId
                    ) &&
                    String(
                        review.userId
                    ) ===
                    String(
                        loggedInUser.id
                    )
                );

            }
        );

    }


    // =====================================================
    // REVIEW SECTION
    // =====================================================

    function renderReviews() {

        if (
            !reviewSection ||
            !reviewProducts
        ) {
            return;
        }


        const status =
            getStatus(
                selectedOrder
            )
            .toLowerCase();


        // Reviews only after delivery

        if (
            status !==
            "delivered"
        ) {

            reviewSection.classList.remove(
                "visible"
            );

            return;

        }


        reviewSection.classList.add(
            "visible"
        );


        const products =
            getProducts(
                selectedOrder
            );


        if (
            products.length === 0
        ) {

            reviewProducts.innerHTML = `

                <p>
                    No products available for review.
                </p>

            `;

            return;

        }


        reviewProducts.innerHTML = "";


        products.forEach(
            function (
                product,
                index
            ) {

                const productId =
                    product.id ||
                    product.productId ||
                    product.name ||
                    index;


                const existingReview =
                    getProductReview(
                        product,
                        index
                    );


                const wrapper =
                    document.createElement(
                        "div"
                    );


                wrapper.className =
                    "review-product";


                wrapper.innerHTML = `

                    <div class="review-product-image">

                        <img
                            src="${
                                product.image ||
                                "product1.jpg"
                            }"
                            alt="${
                                product.name ||
                                "Product"
                            }"
                        >

                    </div>


                    <div class="review-product-content">

                        <h3>
                            ${
                                product.name ||
                                "Product"
                            }
                        </h3>


                        <div
                            class="review-stars"
                            data-product-id="${productId}"
                        >

                            <button
                                type="button"
                                class="review-star"
                                data-rating="1"
                            >
                                ★
                            </button>

                            <button
                                type="button"
                                class="review-star"
                                data-rating="2"
                            >
                                ★
                            </button>

                            <button
                                type="button"
                                class="review-star"
                                data-rating="3"
                            >
                                ★
                            </button>

                            <button
                                type="button"
                                class="review-star"
                                data-rating="4"
                            >
                                ★
                            </button>

                            <button
                                type="button"
                                class="review-star"
                                data-rating="5"
                            >
                                ★
                            </button>

                        </div>


                        <textarea
                            class="review-text"
                            placeholder="Write your review..."
                        >${
                            existingReview
                                ? existingReview.comment || ""
                                : ""
                        }</textarea>


                        <button
                            type="button"
                            class="review-submit"
                            data-product-id="${productId}"
                        >
                            ${
                                existingReview
                                    ? "UPDATE REVIEW"
                                    : "SUBMIT REVIEW"
                            }
                        </button>


                        <div
                            class="review-submitted"
                            style="${
                                existingReview
                                    ? "display:block;"
                                    : "display:none;"
                            }"
                        >
                            ${
                                existingReview
                                    ? "Your review has been submitted."
                                    : ""
                            }
                        </div>

                    </div>

                `;


                // =================================================
                // SET EXISTING RATING
                // =================================================

                if (existingReview) {

                    const stars =
                        wrapper.querySelectorAll(
                            ".review-star"
                        );


                    stars.forEach(
                        function (star) {

                            const rating =
                                Number(
                                    star.dataset.rating
                                );


                            if (
                                rating <=
                                Number(
                                    existingReview.rating
                                )
                            ) {

                                star.classList.add(
                                    "active"
                                );

                            }

                        }
                    );

                }


                // =================================================
                // STAR CLICK
                // =================================================

                const stars =
                    wrapper.querySelectorAll(
                        ".review-star"
                    );


                stars.forEach(
                    function (star) {

                        star.addEventListener(
                            "click",
                            function () {

                                const rating =
                                    Number(
                                        star.dataset.rating
                                    );


                                stars.forEach(
                                    function (
                                        currentStar
                                    ) {

                                        const currentRating =
                                            Number(
                                                currentStar.dataset.rating
                                            );


                                        currentStar.classList.toggle(
                                            "active",
                                            currentRating <=
                                            rating
                                        );

                                    }
                                );


                                wrapper.dataset.rating =
                                    rating;

                            }
                        );

                    }
                );


                // =================================================
                // SUBMIT REVIEW
                // =================================================

                const submitButton =
                    wrapper.querySelector(
                        ".review-submit"
                    );


                submitButton.addEventListener(
                    "click",
                    function () {

                        const rating =
                            Number(
                                wrapper.dataset.rating
                            ) ||
                            Number(
                                existingReview
                                    ? existingReview.rating
                                    : 0
                            );


                        const textarea =
                            wrapper.querySelector(
                                ".review-text"
                            );


                        const comment =
                            textarea.value.trim();


                        if (
                            rating < 1 ||
                            rating > 5
                        ) {

                            alert(
                                "Please select a rating."
                            );

                            return;

                        }


                        if (!comment) {

                            alert(
                                "Please write a review."
                            );

                            textarea.focus();

                            return;

                        }


                        let reviews =
                            getReviews();


                        const existingIndex =
                            reviews.findIndex(
                                function (
                                    review
                                ) {

                                    return (
                                        String(
                                            review.orderId
                                        ) ===
                                        String(
                                            getOrderNumber(
                                                selectedOrder
                                            )
                                        ) &&
                                        String(
                                            review.productId
                                        ) ===
                                        String(
                                            productId
                                        ) &&
                                        String(
                                            review.userId
                                        ) ===
                                        String(
                                            loggedInUser.id
                                        )
                                    );

                                }
                            );


                        const reviewData = {

                            id:
                                existingReview?.id ||
                                "REV-" +
                                Date.now(),

                            orderId:
                                getOrderNumber(
                                    selectedOrder
                                ),

                            productId:
                                productId,

                            productName:
                                product.name ||
                                "Product",

                            userId:
                                loggedInUser.id,

                            userName:
                                loggedInUser.name ||
                                "Customer",

                            rating:
                                rating,

                            comment:
                                comment,

                            date:
                                new Date().toISOString()

                        };


                        if (
                            existingIndex !==
                            -1
                        ) {

                            reviews[
                                existingIndex
                            ] =
                                reviewData;

                        } else {

                            reviews.push(
                                reviewData
                            );

                        }


                        saveReviews(
                            reviews
                        );


                        const success =
                            wrapper.querySelector(
                                ".review-submitted"
                            );


                        if (success) {

                            success.style.display =
                                "block";

                            success.textContent =
                                "Your review has been submitted successfully.";

                        }


                        submitButton.textContent =
                            "UPDATE REVIEW";


                        alert(
                            "Thank you! Your review has been saved."
                        );

                    }
                );


                reviewProducts.appendChild(
                    wrapper
                );

            }
        );

    }


    // =====================================================
    // INITIAL RENDER
    // =====================================================

    syncSelectedOrder();

    renderHeader();

    renderTracking();

    renderProducts();

    renderDelivery();

    renderPayment();

    updateCancelSection();

    renderReviews();

});