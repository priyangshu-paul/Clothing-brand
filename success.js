// =====================================================
// FASHION ORDER SUCCESS SYSTEM
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // GET LAST ORDER
    // =====================================================

    const savedOrder =
        localStorage.getItem("fashionLastOrder");

    let order = null;

    try {
        order = savedOrder
            ? JSON.parse(savedOrder)
            : null;
    } catch (error) {

        console.error(
            "Order loading error:",
            error
        );

        order = null;
    }


    // =====================================================
    // ELEMENTS
    // =====================================================

    const orderNumber =
        document.getElementById("orderNumber");

    const successProducts =
        document.getElementById("successProducts");

    const successPayment =
        document.getElementById("successPayment");

    const successTotal =
        document.getElementById("successTotal");

    const customerInfo =
        document.getElementById("customerInfo");


    // =====================================================
    // NO ORDER FOUND
    // =====================================================

    if (!order) {

        if (orderNumber) {

            orderNumber.textContent =
                "NO ORDER";

        }

        if (successProducts) {

            successProducts.innerHTML = `
                <p>
                    Order information is not available.
                </p>
            `;

        }

        if (successPayment) {

            successPayment.textContent =
                "-";

        }

        if (successTotal) {

            successTotal.textContent =
                "₹0";

        }

        return;
    }


    // =====================================================
    // ORDER ID
    // =====================================================

    if (orderNumber) {

        orderNumber.textContent =
            order.orderId ||
            "FASHION ORDER";

    }


    // =====================================================
    // PAYMENT
    // =====================================================

    if (successPayment) {

        successPayment.textContent =
            order.payment === "online"
                ? "Online Payment"
                : "Cash on Delivery";

    }


    // =====================================================
    // PRODUCTS
    // =====================================================

    if (successProducts) {

        successProducts.innerHTML = "";

        let subtotal = 0;


        if (
            Array.isArray(order.items) &&
            order.items.length > 0
        ) {

            order.items.forEach(function (item) {

                // =========================================
                // PRICE
                // =========================================

                const price =
                    Number(item.price) || 0;


                // =========================================
                // QUANTITY
                // =========================================

                const quantity =
                    Number(item.quantity) || 1;


                // =========================================
                // ITEM TOTAL
                // =========================================

                const itemTotal =
                    price * quantity;


                subtotal += itemTotal;


                // =========================================
                // PRODUCT CONTAINER
                // =========================================

                const product =
                    document.createElement("div");

                product.className =
                    "success-product";


                // =========================================
                // PRODUCT IMAGE
                // =========================================

                const imageBox =
                    document.createElement("div");

                imageBox.className =
                    "success-product-image";


                const image =
                    document.createElement("img");

                image.src =
                    item.image ||
                    "images/product1.jpg";

                image.alt =
                    item.name ||
                    "Product";


                imageBox.appendChild(image);


                // =========================================
                // PRODUCT INFO
                // =========================================

                const productInfo =
                    document.createElement("div");

                productInfo.className =
                    "success-product-info";


                const productName =
                    document.createElement("h3");

                productName.textContent =
                    item.name ||
                    "Product";


                productInfo.appendChild(
                    productName
                );


                // SIZE

                if (item.size) {

                    const size =
                        document.createElement("p");

                    size.textContent =
                        "Size: " +
                        item.size;

                    productInfo.appendChild(
                        size
                    );

                }


                // QUANTITY

                const quantityText =
                    document.createElement("p");

                quantityText.textContent =
                    "Qty: " +
                    quantity;

                productInfo.appendChild(
                    quantityText
                );


                // UNIT PRICE

                const priceText =
                    document.createElement("p");

                priceText.textContent =
                    "₹" +
                    price.toLocaleString(
                        "en-IN"
                    );

                productInfo.appendChild(
                    priceText
                );


                // =========================================
                // ITEM TOTAL
                // =========================================

                const itemPrice =
                    document.createElement("strong");

                itemPrice.className =
                    "success-product-price";

                itemPrice.textContent =
                    "₹" +
                    itemTotal.toLocaleString(
                        "en-IN"
                    );


                // =========================================
                // APPEND
                // =========================================

                product.appendChild(
                    imageBox
                );

                product.appendChild(
                    productInfo
                );

                product.appendChild(
                    itemPrice
                );


                successProducts.appendChild(
                    product
                );

            });


            // =================================================
            // SHIPPING
            // =================================================

            const shipping =
                subtotal >= 1999
                    ? 0
                    : 99;


            // =================================================
            // FINAL TOTAL
            // =================================================

            const finalTotal =
                subtotal + shipping;


            // =================================================
            // DISPLAY TOTAL
            // =================================================

            if (successTotal) {

                successTotal.textContent =
                    "₹" +
                    finalTotal.toLocaleString(
                        "en-IN"
                    );

            }

        } else {

            successProducts.innerHTML = `
                <p>
                    No products found in this order.
                </p>
            `;

            if (successTotal) {

                successTotal.textContent =
                    "₹0";

            }

        }

    }


    // =====================================================
    // CUSTOMER INFORMATION
    // =====================================================

    if (
        customerInfo &&
        order.customer
    ) {

        const customer =
            order.customer;


        customerInfo.innerHTML = `

            <p>
                <strong>
                    ${customer.firstName || ""}
                    ${customer.lastName || ""}
                </strong>
            </p>

            <p>
                ${customer.address || ""}
            </p>

            <p>
                ${customer.city || ""}
                -
                ${customer.pincode || ""}
            </p>

            <p>
                Phone:
                ${customer.phone || ""}
            </p>

            <p>
                Email:
                ${customer.email || ""}
            </p>

        `;

    }

});