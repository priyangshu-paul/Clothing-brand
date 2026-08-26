// =====================================================
// FASHION ADMIN DASHBOARD
// SUPABASE VERSION
// =====================================================

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    async function () {


        // =================================================
        // CONFIG
        // =================================================

        const ADMIN_EMAIL =
            "admin@fashion.com";


        // =================================================
        // SUPABASE CHECK
        // =================================================

        if (
            typeof supabaseClient === "undefined"
        ) {

            alert(
                "Supabase is not connected. Check supabase.js."
            );

            return;
        }


        // =================================================
        // STATE
        // =================================================

        let products = [];

        let orders = [];

        let customers = [];

        let editingProductId = null;


        // =================================================
        // ELEMENTS
        // =================================================

        const adminUserInfo =
            document.getElementById(
                "adminUserInfo"
            );

        const adminLogout =
            document.getElementById(
                "adminLogout"
            );

        const productCount =
            document.getElementById(
                "productCount"
            );

        const orderCount =
            document.getElementById(
                "orderCount"
            );

        const customerCount =
            document.getElementById(
                "customerCount"
            );

        const salesCount =
            document.getElementById(
                "salesCount"
            );

        const adminProductList =
            document.getElementById(
                "adminProductList"
            );

        const adminOrders =
            document.getElementById(
                "adminOrders"
            );

        const customersContainer =
            document.getElementById(
                "customersContainer"
            );

        const productSearch =
            document.getElementById(
                "productSearch"
            );

        const productCategoryFilter =
            document.getElementById(
                "productCategoryFilter"
            );

        const orderSearch =
            document.getElementById(
                "orderSearch"
            );

        const orderStatusFilter =
            document.getElementById(
                "orderStatusFilter"
            );

        const productModal =
            document.getElementById(
                "productModal"
            );

        const productModalTitle =
            document.getElementById(
                "productModalTitle"
            );

        const closeProductModal =
            document.getElementById(
                "closeProductModal"
            );

        const cancelProductBtn =
            document.getElementById(
                "cancelProductBtn"
            );

        const addProductBtn =
            document.getElementById(
                "addProductBtn"
            );

        const productForm =
            document.getElementById(
                "productForm"
            );

        const productId =
            document.getElementById(
                "productId"
            );

        const productName =
            document.getElementById(
                "productName"
            );

        const productPrice =
            document.getElementById(
                "productPrice"
            );

        const productImage =
            document.getElementById(
                "productImage"
            );

        const productCategory =
            document.getElementById(
                "productCategory"
            );

        const productDescription =
            document.getElementById(
                "productDescription"
            );

        const productSizes =
            document.getElementById(
                "productSizes"
            );

        const productStock =
            document.getElementById(
                "productStock"
            );

        const productGender =
            document.getElementById(
                "productGender"
            );

        const productIsNew =
            document.getElementById(
                "productIsNew"
            );

        const saveProductBtn =
            document.getElementById(
                "saveProductBtn"
            );

        const toast =
            document.getElementById(
                "toast"
            );


        // =================================================
        // TOAST
        // =================================================

        function showToast(message) {

            if (!toast) {
                return;
            }

            toast.textContent =
                message;

            toast.classList.add(
                "show"
            );

            setTimeout(
                function () {

                    toast.classList.remove(
                        "show"
                    );

                },
                2500
            );
        }


        // =================================================
        // ESCAPE HTML
        // =================================================

        function escapeHTML(value) {

            return String(
                value ?? ""
            )
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
        // PRICE
        // =================================================

        function formatPrice(value) {

            return (
                "₹" +
                (
                    Number(value) || 0
                ).toLocaleString(
                    "en-IN",
                    {
                        maximumFractionDigits: 2
                    }
                )
            );
        }


        // =================================================
        // DATE
        // =================================================

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

            return date.toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
        }


        // =================================================
        // AUTH CHECK
        // =================================================

        async function checkAdminSession() {

            const {
                data,
                error
            } =
                await supabaseClient
                    .auth
                    .getSession();

            if (error) {
                throw error;
            }

            const session =
                data?.session;

            if (!session?.user) {

                window.location.replace(
                    "admin-login.html"
                );

                return false;
            }

            const email =
                String(
                    session.user.email || ""
                )
                    .trim()
                    .toLowerCase();

            if (
                email !==
                ADMIN_EMAIL
            ) {

                await supabaseClient
                    .auth
                    .signOut();

                window.location.replace(
                    "admin-login.html"
                );

                return false;
            }

            if (adminUserInfo) {

                adminUserInfo.textContent =
                    "Logged in as: " +
                    email;

            }

            return true;
        }


        // =================================================
        // LOAD PRODUCTS
        // =================================================

        async function loadProducts() {

            if (adminProductList) {

                adminProductList.innerHTML = `
                    <div class="loading">
                        Loading products...
                    </div>
                `;
            }

            const {
                data,
                error
            } =
                await supabaseClient
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
                    "Products error:",
                    error
                );

                if (adminProductList) {

                    adminProductList.innerHTML = `
                        <div class="empty">
                            <strong>
                                Unable to load products
                            </strong>
                            <p>
                                ${escapeHTML(
                                    error.message
                                )}
                            </p>
                        </div>
                    `;
                }

                return;
            }

            products =
                Array.isArray(data)
                    ? data
                    : [];

            renderProducts();

            updateDashboard();

        }


        // =================================================
        // RENDER PRODUCTS
        // =================================================

        function renderProducts() {

            if (!adminProductList) {
                return;
            }

            const search =
                productSearch
                    ? productSearch.value
                        .trim()
                        .toLowerCase()
                    : "";

            const category =
                productCategoryFilter
                    ? productCategoryFilter.value
                    : "all";


            const filtered =
                products.filter(
                    function (product) {

                        const name =
                            String(
                                product.name || ""
                            ).toLowerCase();

                        const productCategory =
                            String(
                                product.category || ""
                            ).toLowerCase();

                        const gender =
                            String(
                                product.gender || ""
                            ).toLowerCase();

                        const matchesSearch =
                            !search ||
                            name.includes(search) ||
                            productCategory.includes(search) ||
                            gender.includes(search);

                        let matchesCategory =
                            true;

                        if (
                            category !==
                            "all"
                        ) {

                            if (
                                category ===
                                "new"
                            ) {

                                matchesCategory =
                                    product.is_new ===
                                    true;

                            } else {

                                matchesCategory =
                                    productCategory ===
                                    category;

                            }

                        }

                        return (
                            matchesSearch &&
                            matchesCategory
                        );
                    }
                );


            if (!filtered.length) {

                adminProductList.innerHTML = `
                    <div class="empty">
                        <strong>
                            No products found
                        </strong>
                        <p>
                            Add a product or change your search.
                        </p>
                    </div>
                `;

                return;
            }


            adminProductList.innerHTML =
                filtered
                    .map(
                        function (product) {

                            const image =
                                product.image ||
                                "";

                            return `
                                <article class="product-card">

                                    <div class="product-image">

                                        ${
                                            image
                                                ? `
                                                    <img
                                                        src="${escapeHTML(image)}"
                                                        alt="${escapeHTML(
                                                            product.name ||
                                                            "Product"
                                                        )}"
                                                    >
                                                `
                                                : `
                                                    <div
                                                        style="
                                                            height:100%;
                                                            display:flex;
                                                            align-items:center;
                                                            justify-content:center;
                                                            color:#999;
                                                        "
                                                    >
                                                        No Image
                                                    </div>
                                                `
                                        }

                                    </div>

                                    <div class="product-info">

                                        <small>
                                            ${escapeHTML(
                                                product.category ||
                                                "Uncategorized"
                                            )}
                                        </small>

                                        <h3>
                                            ${escapeHTML(
                                                product.name ||
                                                "Unnamed Product"
                                            )}
                                        </h3>

                                        <strong>
                                            ${formatPrice(
                                                product.price
                                            )}
                                        </strong>

                                        <p>
                                            Stock:
                                            ${Number(
                                                product.stock
                                            ) || 0}
                                        </p>

                                        <p>
                                            Gender:
                                            ${escapeHTML(
                                                product.gender ||
                                                "-"
                                            )}
                                        </p>

                                        <p>
                                            Sizes:
                                            ${escapeHTML(
                                                product.sizes ||
                                                "-"
                                            )}
                                        </p>

                                    </div>

                                    <div class="product-actions">

                                        <button
                                            type="button"
                                            class="primary-btn edit-product"
                                            data-id="${product.id}"
                                        >
                                            EDIT
                                        </button>

                                        <button
                                            type="button"
                                            class="danger-btn delete-product"
                                            data-id="${product.id}"
                                        >
                                            DELETE
                                        </button>

                                    </div>

                                </article>
                            `;
                        }
                    )
                    .join("");


            document
                .querySelectorAll(
                    ".edit-product"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                openEditProduct(
                                    this.dataset.id
                                );

                            }
                        );

                    }
                );


            document
                .querySelectorAll(
                    ".delete-product"
                )
                .forEach(
                    function (button) {

                        button.addEventListener(
                            "click",
                            function () {

                                deleteProduct(
                                    this.dataset.id
                                );

                            }
                        );

                    }
                );

        }


        // =================================================
        // OPEN ADD PRODUCT
        // =================================================

        function openAddProduct() {

            editingProductId =
                null;

            productModalTitle.textContent =
                "Add Product";

            productForm.reset();

            productId.value =
                "";

            productModal.classList.add(
                "show"
            );

            productName.focus();
        }


        // =================================================
        // OPEN EDIT PRODUCT
        // =================================================

        function openEditProduct(id) {

            const product =
                products.find(
                    function (item) {

                        return String(
                            item.id
                        ) === String(id);

                    }
                );

            if (!product) {
                return;
            }

            editingProductId =
                product.id;

            productModalTitle.textContent =
                "Edit Product";

            productId.value =
                product.id;

            productName.value =
                product.name || "";

            productPrice.value =
                product.price ?? "";

            productImage.value =
                product.image || "";

            productCategory.value =
                product.category || "";

            productDescription.value =
                product.description || "";

            productSizes.value =
                product.sizes || "";

            productStock.value =
                product.stock ?? 0;

            productGender.value =
                product.gender || "";

            productIsNew.checked =
                product.is_new === true;

            productModal.classList.add(
                "show"
            );

        }


        // =================================================
        // CLOSE PRODUCT MODAL
        // =================================================

        function closeModal() {

            productModal.classList.remove(
                "show"
            );

            editingProductId =
                null;

            productForm.reset();

        }


        // =================================================
        // SAVE PRODUCT
        // =================================================

        async function saveProduct(event) {

            event.preventDefault();

            const name =
                productName.value.trim();

            const price =
                Number(
                    productPrice.value
                );

            const image =
                productImage.value.trim();

            const category =
                productCategory.value.trim();

            const description =
                productDescription.value.trim();

            const sizes =
                productSizes.value.trim();

            const stock =
                Number(
                    productStock.value
                );

            const gender =
                productGender.value;

            const isNew =
                productIsNew.checked;


            if (!name) {

                alert(
                    "Please enter product name."
                );

                return;
            }

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                alert(
                    "Please enter a valid price."
                );

                return;
            }

            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {

                alert(
                    "Please enter a valid stock quantity."
                );

                return;
            }


            const productData = {

                name: name,

                price: price,

                image: image,

                category: category,

                description: description,

                sizes: sizes,

                stock: stock,

                gender: gender,

                is_new: isNew

            };


            saveProductBtn.disabled =
                true;

            saveProductBtn.textContent =
                "SAVING...";


            try {

                let result;


                // =============================================
                // UPDATE
                // =============================================

                if (
                    editingProductId !==
                    null
                ) {

                    result =
                        await supabaseClient
                            .from("products")
                            .update(
                                productData
                            )
                            .eq(
                                "id",
                                editingProductId
                            )
                            .select()
                            .single();

                }

                // =============================================
                // INSERT
                // =============================================

                else {

                    result =
                        await supabaseClient
                            .from("products")
                            .insert([
                                productData
                            ])
                            .select()
                            .single();

                }


                if (result.error) {
                    throw result.error;
                }


                showToast(
                    editingProductId !== null
                        ? "Product updated successfully."
                        : "Product added successfully."
                );


                closeModal();

                await loadProducts();


            } catch (error) {

                console.error(
                    "Save product error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to save product."
                );

            } finally {

                saveProductBtn.disabled =
                    false;

                saveProductBtn.textContent =
                    "SAVE PRODUCT";

            }

        }


        // =================================================
        // DELETE PRODUCT
        // =================================================

        async function deleteProduct(id) {

            const product =
                products.find(
                    function (item) {

                        return String(
                            item.id
                        ) === String(id);

                    }
                );

            if (!product) {
                return;
            }


            const confirmed =
                confirm(
                    `Delete "${product.name}"?`
                );


            if (!confirmed) {
                return;
            }


            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from("products")
                        .delete()
                        .eq(
                            "id",
                            id
                        );


                if (error) {
                    throw error;
                }


                showToast(
                    "Product deleted successfully."
                );


                await loadProducts();


            } catch (error) {

                console.error(
                    "Delete product error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to delete product."
                );

            }

        }


        // =================================================
        // LOAD ORDERS
        // =================================================

        async function loadOrders() {

            if (adminOrders) {

                adminOrders.innerHTML = `
                    <div class="loading">
                        Loading orders...
                    </div>
                `;

            }


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("orders")
                    .select("*")
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                console.error(
                    "Orders error:",
                    error
                );

                if (adminOrders) {

                    adminOrders.innerHTML = `
                        <div class="empty">

                            <strong>
                                Unable to load orders
                            </strong>

                            <p>
                                ${escapeHTML(
                                    error.message
                                )}
                            </p>

                        </div>
                    `;

                }

                return;
            }


            orders =
                Array.isArray(data)
                    ? data
                    : [];


            renderOrders();

            updateDashboard();

        }


        // =================================================
        // ORDER ITEMS
        // =================================================

        function getOrderItems(order) {

            let items =
                order.items;


            if (
                typeof items ===
                "string"
            ) {

                try {

                    items =
                        JSON.parse(
                            items
                        );

                } catch {

                    items = [];

                }

            }


            return Array.isArray(items)
                ? items
                : [];

        }


        // =================================================
        // ORDER STATUS
        // =================================================

        async function updateOrderStatus(
            id,
            status
        ) {

            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from("orders")
                        .update({
                            status: status
                        })
                        .eq(
                            "id",
                            id
                        );


                if (error) {
                    throw error;
                }


                const order =
                    orders.find(
                        function (item) {

                            return String(
                                item.id
                            ) === String(id);

                        }
                    );


                if (order) {
                    order.status =
                        status;
                }


                showToast(
                    "Order status updated."
                );


                renderOrders();


            } catch (error) {

                console.error(
                    "Order status error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to update order status."
                );

                await loadOrders();

            }

        }


        // =================================================
        // RENDER ORDERS
        // =================================================

        function renderOrders() {

            if (!adminOrders) {
                return;
            }


            const search =
                orderSearch
                    ? orderSearch.value
                        .trim()
                        .toLowerCase()
                    : "";


            const statusFilter =
                orderStatusFilter
                    ? orderStatusFilter.value
                    : "all";


            const filtered =
                orders.filter(
                    function (order) {

                        const email =
                            String(
                                order.customer_email ||
                                ""
                            ).toLowerCase();

                        const name =
                            String(
                                order.customer_name ||
                                ""
                            ).toLowerCase();

                        const phone =
                            String(
                                order.customer_phone ||
                                ""
                            ).toLowerCase();

                        const id =
                            String(
                                order.id ||
                                ""
                            ).toLowerCase();

                        const status =
                            order.status ||
                            "Confirmed";


                        const matchesSearch =
                            !search ||
                            email.includes(search) ||
                            name.includes(search) ||
                            phone.includes(search) ||
                            id.includes(search);


                        const matchesStatus =
                            statusFilter ===
                                "all" ||
                            status ===
                                statusFilter;


                        return (
                            matchesSearch &&
                            matchesStatus
                        );

                    }
                );


            if (!filtered.length) {

                adminOrders.innerHTML = `
                    <div class="empty">

                        <strong>
                            No orders found
                        </strong>

                        <p>
                            There are no matching orders.
                        </p>

                    </div>
                `;

                return;
            }


            adminOrders.innerHTML =
                filtered
                    .map(
                        function (order) {

                            const items =
                                getOrderItems(
                                    order
                                );

                            const status =
                                order.status ||
                                "Confirmed";


                            const itemsHTML =
                                items.length

                                    ? items
                                        .map(
                                            function (item) {

                                                const quantity =
                                                    Number(
                                                        item.quantity
                                                    ) || 1;

                                                return `
                                                    <div class="order-item">

                                                        <img
                                                            src="${escapeHTML(
                                                                item.image ||
                                                                ""
                                                            )}"
                                                            alt="${escapeHTML(
                                                                item.name ||
                                                                "Product"
                                                            )}"
                                                        >

                                                        <div>

                                                            <strong>
                                                                ${escapeHTML