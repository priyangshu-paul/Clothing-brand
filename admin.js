// ============================================================
// FASHION ADMIN DASHBOARD
// PROFESSIONAL + STABLE SUPABASE ADMIN.JS
// COMPLETE REPLACEMENT
// ============================================================

"use strict";

document.addEventListener("DOMContentLoaded", async () => {

    // ============================================================
    // CONFIGURATION
    // ============================================================

    const ADMIN_EMAIL = "admin@fashion.com";
    const LOW_STOCK_LIMIT = 5;

    const PRODUCT_TABLE = "products";
    const ORDER_TABLE = "orders";
    const CUSTOMER_TABLE = "customers";
    const REVIEW_TABLE = "reviews";

    let products = [];
    let orders = [];
    let customers = [];
    let reviews = [];

    let selectedProduct = null;
    let selectedOrder = null;
    let selectedCustomer = null;

    let salesPeriod = 7;

    // ============================================================
    // BASIC HELPERS
    // ============================================================

    const $ = id => document.getElementById(id);

    function safeNumber(value) {
        if (value === null || value === undefined || value === "") {
            return 0;
        }

        const number = Number(
            String(value)
                .replace(/[₹,\s]/g, "")
                .replace(/[^\d.-]/g, "")
        );

        return Number.isFinite(number) ? number : 0;
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatPrice(value) {
        return "₹" + safeNumber(value).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    function formatDate(value) {
        if (!value) return "-";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    function getOrderDate(order) {
        return (
            order.created_at ||
            order.createdAt ||
            order.order_date ||
            order.orderDate ||
            order.date ||
            order.updated_at ||
            ""
        );
    }

    function getOrderAmount(order) {
        return safeNumber(
            order.total ??
            order.amount ??
            order.total_amount ??
            order.order_total ??
            order.grand_total ??
            order.price ??
            0
        );
    }

    function getOrderStatus(order) {
        const raw =
            order.status ||
            order.order_status ||
            order.payment_status ||
            "Confirmed";

        const normalized = String(raw)
            .trim()
            .toLowerCase();

        const map = {
            confirmed: "Confirmed",
            pending: "Confirmed",
            processing: "Processing",
            shipped: "Shipped",
            delivered: "Delivered",
            cancelled: "Cancelled",
            canceled: "Cancelled",
            returned: "Returned",
            refunded: "Returned"
        };

        return map[normalized] || raw || "Confirmed";
    }

    function getCustomerName(customer) {
        return (
            customer.name ||
            customer.customer_name ||
            customer.full_name ||
            customer.fullName ||
            "Customer"
        );
    }

    function getCustomerEmail(customer) {
        return (
            customer.email ||
            customer.customer_email ||
            "-"
        );
    }

    function getCustomerPhone(customer) {
        return (
            customer.phone ||
            customer.customer_phone ||
            customer.mobile ||
            "-"
        );
    }

    function getProductName(product) {
        return product.name || product.product_name || "Product";
    }

    function getProductImage(product) {
        return (
            product.image ||
            product.image_url ||
            product.product_image ||
            "images/product1.jpg"
        );
    }

    function getProductStock(product) {
        return safeNumber(
            product.stock ??
            product.quantity ??
            product.inventory ??
            0
        );
    }

    function getProductPrice(product) {
        return safeNumber(
            product.price ??
            product.sale_price ??
            0
        );
    }

    function showToast(message, type = "success") {

        let toast = $("adminToast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "adminToast";

            Object.assign(toast.style, {
                position: "fixed",
                right: "24px",
                bottom: "24px",
                zIndex: "99999",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "#111",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 15px 40px rgba(0,0,0,.25)",
                maxWidth: "360px",
                opacity: "0",
                transform: "translateY(15px)",
                transition: "all .25s ease"
            });

            document.body.appendChild(toast);
        }

        toast.textContent = message;

        if (type === "error") {
            toast.style.background = "#b42318";
        } else if (type === "warning") {
            toast.style.background = "#b54708";
        } else {
            toast.style.background = "#111";
        }

        requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateY(0)";
        });

        clearTimeout(toast._timer);

        toast._timer = setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateY(15px)";
        }, 3000);
    }

    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = value;
        }
    }

    // ============================================================
    // SUPABASE CHECK
    // ============================================================

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        console.error("supabaseClient is not defined.");

        showToast(
            "Supabase is not connected. Check your Supabase configuration.",
            "error"
        );

        return;
    }

    // ============================================================
    // LOADING SCREEN
    // ============================================================

    function hideLoadingScreen() {

        const loaders = [
            $("loadingScreen"),
            $("adminLoading"),
            $("dashboardLoading")
        ];

        loaders.forEach(loader => {
            if (!loader) return;

            loader.classList.add("hidden");
            loader.style.display = "none";
        });
    }

    // ============================================================
    // AUTHENTICATION
    // ============================================================

    async function checkAdminSession() {

        try {

            const {
                data,
                error
            } = await supabaseClient.auth.getSession();

            if (error) {
                throw error;
            }

            const session = data?.session;

            if (!session?.user) {

                window.location.replace(
                    "admin-login.html"
                );

                return false;
            }

            const email =
                session.user.email || "";

            if (
                email.toLowerCase() !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                await supabaseClient.auth.signOut();

                window.location.replace(
                    "admin-login.html"
                );

                return false;
            }

            return true;

        } catch (error) {

            console.error(
                "Admin session error:",
                error
            );

            window.location.replace(
                "admin-login.html"
            );

            return false;
        }
    }

    // ============================================================
    // LOGOUT
    // ============================================================

    function setupLogout() {

        const logoutButtons =
            document.querySelectorAll(
                "#logoutBtn, .logout-btn, [data-action='logout']"
            );

        logoutButtons.forEach(button => {

            if (button.dataset.bound) return;

            button.dataset.bound = "true";

            button.addEventListener(
                "click",
                async event => {

                    event.preventDefault();

                    try {

                        await supabaseClient.auth.signOut();

                    } catch (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                    }

                    window.location.replace(
                        "admin-login.html"
                    );
                }
            );
        });
    }

    // ============================================================
    // SIDEBAR / NAVIGATION
    // ============================================================

    function openSection(sectionName) {

        const sections =
            document.querySelectorAll(
                "[data-section], .admin-section"
            );

        sections.forEach(section => {

            const sectionId =
                section.dataset.section ||
                section.id;

            if (
                sectionId === sectionName ||
                sectionId ===
                `${sectionName}Section`
            ) {

                section.classList.add("active");
                section.style.display = "";

            } else if (
                section.classList.contains("admin-section")
            ) {

                section.classList.remove("active");
                section.style.display = "none";
            }
        });

        document
            .querySelectorAll(
                "[data-section-target]"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.sectionTarget ===
                    sectionName
                );
            });

        document
            .querySelectorAll(
                "[data-section-link]"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.sectionLink ===
                    sectionName
                );
            });

        closeMobileSidebar();
    }

    function setupNavigation() {

        document
            .querySelectorAll(
                "[data-section-target], [data-section-link]"
            )
            .forEach(button => {

                if (button.dataset.navBound) return;

                button.dataset.navBound = "true";

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        const section =
                            button.dataset.sectionTarget ||
                            button.dataset.sectionLink;

                        if (section) {
                            openSection(section);
                        }
                    }
                );
            });
    }

    function closeMobileSidebar() {

        const sidebar =
            $("sidebar") ||
            $("adminSidebar") ||
            document.querySelector(".sidebar");

        const overlay =
            $("sidebarOverlay") ||
            $("mobileOverlay");

        sidebar?.classList.remove("open");
        overlay?.classList.remove("show");
    }

    function setupMobileSidebar() {

        const toggle =
            $("mobileMenuBtn") ||
            $("menuToggle") ||
            $("sidebarToggle");

        const sidebar =
            $("sidebar") ||
            $("adminSidebar") ||
            document.querySelector(".sidebar");

        const overlay =
            $("sidebarOverlay") ||
            $("mobileOverlay");

        if (!toggle || !sidebar) return;

        toggle.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle("open");
                overlay?.classList.toggle(
                    "show"
                );
            }
        );

        overlay?.addEventListener(
            "click",
            closeMobileSidebar
        );
    }

    // ============================================================
    // LOAD PRODUCTS
    // ============================================================

    async function loadProducts() {

        const container =
            $("productsContainer");

        if (container) {
            container.innerHTML =
                `<div class="loading">Loading products...</div>`;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(PRODUCT_TABLE)
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {
                throw error;
            }

            products =
                Array.isArray(data)
                    ? data
                    : [];

            renderProducts();
            renderInventory();
            updateDashboard();

        } catch (error) {

            console.error(
                "Products loading error:",
                error
            );

            products = [];

            if (container) {

                container.innerHTML =
                    `<div class="empty">
                        <strong>Unable to load products</strong>
                        <p>${escapeHTML(error.message || "Supabase products error.")}</p>
                    </div>`;
            }

            showToast(
                "Products could not be loaded.",
                "error"
            );
        }
    }

    // ============================================================
    // PRODUCT FILTER / SORT
    // ============================================================

    function getFilteredProducts() {

        const search =
            $("productSearch")
                ?.value
                ?.trim()
                ?.toLowerCase() || "";

        const category =
            $("productCategoryFilter")
                ?.value || "all";

        const sort =
            $("productSort")
                ?.value || "newest";

        let result =
            products.filter(product => {

                const name =
                    getProductName(product)
                        .toLowerCase();

                const productCategory =
                    String(
                        product.category || ""
                    )
                        .toLowerCase();

                const gender =
                    String(
                        product.gender || ""
                    )
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    name.includes(search) ||
                    productCategory.includes(search) ||
                    gender.includes(search);

                const matchesCategory =
                    category === "all" ||
                    productCategory ===
                    category.toLowerCase();

                return (
                    matchesSearch &&
                    matchesCategory
                );
            });

        result.sort((a, b) => {

            if (sort === "name_asc") {

                return getProductName(a)
                    .localeCompare(
                        getProductName(b)
                    );
            }

            if (sort === "name_desc") {

                return getProductName(b)
                    .localeCompare(
                        getProductName(a)
                    );
            }

            if (sort === "price_low") {

                return getProductPrice(a) -
                    getProductPrice(b);
            }

            if (sort === "price_high") {

                return getProductPrice(b) -
                    getProductPrice(a);
            }

            if (sort === "stock_low") {

                return getProductStock(a) -
                    getProductStock(b);
            }

            if (sort === "stock_high") {

                return getProductStock(b) -
                    getProductStock(a);
            }

            return (
                new Date(
                    b.created_at || 0
                ) -
                new Date(
                    a.created_at || 0
                )
            );
        });

        return result;
    }

    // ============================================================
    // RENDER PRODUCTS
    // ============================================================

    function renderProducts() {

        const container =
            $("productsContainer");

        if (!container) return;

        const filtered =
            getFilteredProducts();

        if (!filtered.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No products found</strong>
                    <p>Add a product or change your search/filter.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            filtered.map(product => {

                const stock =
                    getProductStock(product);

                let stockClass =
                    "healthy";

                let stockText =
                    "In Stock";

                if (stock <= 0) {

                    stockClass = "out";
                    stockText = "Out of Stock";

                } else if (
                    stock <= LOW_STOCK_LIMIT
                ) {

                    stockClass = "low";
                    stockText = "Low Stock";
                }

                const image =
                    getProductImage(product);

                const sizes =
                    Array.isArray(product.sizes)
                        ? product.sizes.join(", ")
                        : String(
                            product.sizes || "-"
                        );

                return `
                    <article
                        class="product-admin-card"
                        data-product-id="${escapeHTML(product.id)}"
                    >

                        <div class="product-admin-image">
                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(getProductName(product))}"
                                loading="lazy"
                                onerror="this.src='images/product1.jpg'"
                            >
                        </div>

                        <div class="product-admin-info">

                            <span class="product-category">
                                ${escapeHTML(product.category || "Fashion")}
                            </span>

                            <h3>
                                ${escapeHTML(getProductName(product))}
                            </h3>

                            <p>
                                ${formatPrice(getProductPrice(product))}
                            </p>

                            <small>
                                ${escapeHTML(product.gender || "Unisex")}
                                · Sizes: ${escapeHTML(sizes)}
                            </small>

                        </div>

                        <div class="product-admin-stock">

                            <strong>
                                ${stock}
                            </strong>

                            <span>
                                units
                            </span>

                            <em class="${stockClass}">
                                ${stockText}
                            </em>

                        </div>

                        <div class="product-admin-actions">

                            <button
                                type="button"
                                class="secondary-btn edit-product"
                                data-id="${escapeHTML(product.id)}"
                            >
                                EDIT
                            </button>

                            <button
                                type="button"
                                class="danger-btn delete-product"
                                data-id="${escapeHTML(product.id)}"
                            >
                                DELETE
                            </button>

                        </div>

                    </article>
                `;

            }).join("");

        bindProductActions();
    }

    function bindProductActions() {

        document
            .querySelectorAll(".edit-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {
                        openEditProduct(
                            button.dataset.id
                        );
                    }
                );
            });

        document
            .querySelectorAll(".delete-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {
                        deleteProduct(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    // ============================================================
    // PRODUCT MODAL
    // ============================================================

    const productModal =
        $("productModal");

    const productModalContent =
        $("productModalContent");

    const closeProductModal =
        $("closeProductModal");

    const closeProductModalBottom =
        $("closeProductModalBottom");

    function getProductFormHTML(product = null) {

        const editing =
            Boolean(product);

        const sizes =
            Array.isArray(product?.sizes)
                ? product.sizes.join(", ")
                : String(
                    product?.sizes || "S, M, L, XL, XXL"
                );

        return `
            <form id="adminProductForm">

                <div class="form-grid">

                    <label>
                        <span>Product Name</span>
                        <input
                            id="adminProductName"
                            name="name"
                            type="text"
                            required
                            value="${escapeHTML(product?.name || "")}"
                            placeholder="Classic Oversized Tee"
                        >
                    </label>

                    <label>
                        <span>Price</span>
                        <input
                            id="adminProductPrice"
                            name="price"
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value="${escapeHTML(product?.price ?? "")}"
                            placeholder="1499"
                        >
                    </label>

                    <label>
                        <span>Category</span>
                        <input
                            id="adminProductCategory"
                            name="category"
                            type="text"
                            value="${escapeHTML(product?.category || "")}"
                            placeholder="T-Shirts"
                        >
                    </label>

                    <label>
                        <span>Gender</span>
                        <select
                            id="adminProductGender"
                            name="gender"
                        >
                            <option value="">Unisex</option>
                            <option
                                value="Men"
                                ${product?.gender === "Men" ? "selected" : ""}
                            >
                                Men
                            </option>
                            <option
                                value="Women"
                                ${product?.gender === "Women" ? "selected" : ""}
                            >
                                Women
                            </option>
                            <option
                                value="Unisex"
                                ${product?.gender === "Unisex" ? "selected" : ""}
                            >
                                Unisex
                            </option>
                        </select>
                    </label>

                    <label>
                        <span>Stock</span>
                        <input
                            id="adminProductStock"
                            name="stock"
                            type="number"
                            min="0"
                            step="1"
                            value="${escapeHTML(product?.stock ?? 0)}"
                        >
                    </label>

                    <label>
                        <span>Sizes</span>
                        <input
                            id="adminProductSizes"
                            name="sizes"
                            type="text"
                            value="${escapeHTML(sizes)}"
                            placeholder="S, M, L, XL"
                        >
                    </label>

                    <label class="full">
                        <span>Image URL</span>
                        <input
                            id="adminProductImage"
                            name="image"
                            type="url"
                            value="${escapeHTML(getProductImage(product || {}))}"
                            placeholder="https://..."
                        >
                    </label>

                    <label class="full">
                        <span>Description</span>
                        <textarea
                            id="adminProductDescription"
                            name="description"
                            rows="5"
                            placeholder="Product description..."
                        >${escapeHTML(product?.description || "")}</textarea>
                    </label>

                    <label class="checkbox-field">

                        <input
                            id="adminProductIsNew"
                            name="is_new"
                            type="checkbox"
                            ${
                                product?.is_new === true ||
                                product?.isNew === true
                                    ? "checked"
                                    : ""
                            }
                        >

                        <span>
                            Mark as New Arrival
                        </span>

                    </label>

                </div>

                <div class="form-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        id="cancelProductForm"
                    >
                        CANCEL
                    </button>

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        ${editing ? "UPDATE PRODUCT" : "ADD PRODUCT"}
                    </button>

                </div>

            </form>
        `;
    }

    function openProductModal(product = null) {

        selectedProduct =
            product || null;

        if (!productModalContent) return;

        productModalContent.innerHTML =
            getProductFormHTML(product);

        productModal?.classList.add("show");

        if (productModal) {
            productModal.style.display = "flex";
        }

        const form =
            $("adminProductForm");

        form?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                await saveProduct();
            }
        );

        $("cancelProductForm")
            ?.addEventListener(
                "click",
                closeProductModalFunction
            );
    }

    function openAddProduct() {
        openProductModal(null);
    }

    function openEditProduct(id) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!product) {

            showToast(
                "Product not found.",
                "error"
            );

            return;
        }

        openProductModal(product);
    }

    async function saveProduct() {

        const name =
            $("adminProductName")
                ?.value
                ?.trim();

        const price =
            safeNumber(
                $("adminProductPrice")?.value
            );

        const category =
            $("adminProductCategory")
                ?.value
                ?.trim() || "Fashion";

        const gender =
            $("adminProductGender")
                ?.value
                ?.trim() || "Unisex";

        const stock =
            safeNumber(
                $("adminProductStock")?.value
            );

        const sizes =
            $("adminProductSizes")
                ?.value
                ?.split(",")
                .map(value => value.trim())
                .filter(Boolean);

        const image =
            $("adminProductImage")
                ?.value
                ?.trim() ||
            "images/product1.jpg";

        const description =
            $("adminProductDescription")
                ?.value
                ?.trim() || "";

        const isNew =
            Boolean(
                $("adminProductIsNew")?.checked
            );

        if (!name) {

            showToast(
                "Product name is required.",
                "error"
            );

            return;
        }

        const payload = {
            name,
            price,
            category,
            gender,
            stock,
            sizes,
            image,
            description,
            is_new: isNew,
            isNew
        };

        try {

            let result;

            if (selectedProduct) {

                result =
                    await supabaseClient
                        .from(PRODUCT_TABLE)
                        .update(payload)
                        .eq(
                            "id",
                            selectedProduct.id
                        );

            } else {

                result =
                    await supabaseClient
                        .from(PRODUCT_TABLE)
                        .insert(payload);
            }

            if (result.error) {
                throw result.error;
            }

            closeProductModalFunction();

            await loadProducts();

            showToast(
                selectedProduct
                    ? "Product updated successfully."
                    : "Product added successfully."
            );

            selectedProduct = null;

        } catch (error) {

            console.error(
                "Product save error:",
                error
            );

            showToast(
                error.message ||
                "Unable to save product.",
                "error"
            );
        }
    }

    async function deleteProduct(id) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!product) return;

        const confirmed =
            window.confirm(
                `Delete "${getProductName(product)}"?\n\nThis action cannot be undone.`
            );

        if (!confirmed) return;

        try {

            const {
                error
            } = await supabaseClient
                .from(PRODUCT_TABLE)
                .delete()
                .eq("id", id);

            if (error) {
                throw error;
            }

            products =
                products.filter(
                    item =>
                        String(item.id) !==
                        String(id)
                );

            renderProducts();
            renderInventory();
            updateDashboard();

            showToast(
                "Product deleted successfully."
            );

        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );

            showToast(
                error.message ||
                "Unable to delete product.",
                "error"
            );
        }
    }

    function closeProductModalFunction() {

        productModal?.classList.remove(
            "show"
        );

        if (productModal) {
            productModal.style.display = "";
        }

        selectedProduct = null;
    }

    closeProductModal?.addEventListener(
        "click",
        closeProductModalFunction
    );

    closeProductModalBottom?.addEventListener(
        "click",
        closeProductModalFunction
    );

    productModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                productModal
            ) {
                closeProductModalFunction();
            }
        }
    );

    // ============================================================
    // ADD PRODUCT BUTTONS
    // ============================================================

    function setupProductButtons() {

        document
            .querySelectorAll(
                "#addProductBtn, #addProduct, .add-product-btn"
            )
            .forEach(button => {

                if (button.dataset.bound) return;

                button.dataset.bound = "true";

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        openAddProduct();
                    }
                );
            });
    }

    // ============================================================
    // LOAD ORDERS
    // ============================================================

    async function loadOrders() {

        const container =
            $("ordersContainer");

        if (container) {
            container.innerHTML =
                `<div class="loading">Loading orders...</div>`;
        }

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(ORDER_TABLE)
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {
                throw error;
            }

            orders =
                Array.isArray(data)
                    ? data
                    : [];

            renderOrders();
            renderPayments();
            updateDashboard();

        } catch (error) {

            console.error(
                "Orders loading error:",
                error
            );

            orders = [];

            if (container) {

                container.innerHTML =
                    `<div class="empty">
                        <strong>Unable to load orders</strong>
                        <p>${escapeHTML(error.message || "")}</p>
                    </div>`;
            }

            showToast(
                "Orders could not be loaded.",
                "error"
            );
        }
    }

    // ============================================================
    // SORT ORDERS
    // ============================================================

    function sortOrders(list) {

        const sort =
            $("orderSort")
                ?.value || "newest";

        const result =
            [...list];

        result.sort((a, b) => {

            if (sort === "oldest") {

                return (
                    new Date(getOrderDate(a) || 0) -
                    new Date(getOrderDate(b) || 0)
                );
            }

            if (sort === "amount_high") {

                return (
                    getOrderAmount(b) -
                    getOrderAmount(a)
                );
            }

            if (sort === "amount_low") {

                return (
                    getOrderAmount(a) -
                    getOrderAmount(b)
                );
            }

            return (
                new Date(getOrderDate(b) || 0) -
                new Date(getOrderDate(a) || 0)
            );
        });

        return result;
    }

    // ============================================================
    // RENDER ORDERS
    // ============================================================

    function renderOrders() {

        const container =
            $("ordersContainer");

        if (!container) return;

        const search =
            $("orderSearch")
                ?.value
                ?.trim()
                ?.toLowerCase() || "";

        const statusFilter =
            $("orderStatusFilter")
                ?.value || "all";

        let filtered =
            orders.filter(order => {

                const customer =
                    (
                        order.customer_name ||
                        order.name ||
                        order.full_name ||
                        ""
                    ).toLowerCase();

                const email =
                    (
                        order.customer_email ||
                        order.email ||
                        ""
                    ).toLowerCase();

                const id =
                    String(
                        order.id || ""
                    ).toLowerCase();

                const status =
                    getOrderStatus(order);

                const searchMatch =
                    !search ||
                    customer.includes(search) ||
                    email.includes(search) ||
                    id.includes(search);

                const statusMatch =
                    statusFilter === "all" ||
                    status.toLowerCase() ===
                    statusFilter.toLowerCase();

                return (
                    searchMatch &&
                    statusMatch
                );
            });

        filtered =
            sortOrders(filtered);

        if (!filtered.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No orders found</strong>
                    <p>Orders will appear here after customers place orders.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            filtered.map(order => {

                const status =
                    getOrderStatus(order);

                return `
                    <article
                        class="order-row"
                        data-order-id="${escapeHTML(order.id)}"
                    >

                        <div>
                            <strong>
                                #${escapeHTML(order.id)}
                            </strong>

                            <span>
                                ${formatDate(getOrderDate(order))}
                            </span>
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(
                                    order.customer_name ||
                                    order.name ||
                                    order.full_name ||
                                    "Customer"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    order.customer_email ||
                                    order.email ||
                                    "-"
                                )}
                            </span>
                        </div>

                        <div>
                            <strong>
                                ${formatPrice(
                                    getOrderAmount(order)
                                )}
                            </strong>
                        </div>

                        <div>
                            <span class="status ${status
                                .toLowerCase()
                                .replace(/\s+/g, "-")}">
                                ${escapeHTML(status)}
                            </span>
                        </div>

                        <div>
                            <button
                                type="button"
                                class="primary-btn view-order"
                                data-id="${escapeHTML(order.id)}"
                            >
                                VIEW
                            </button>
                        </div>

                    </article>
                `;

            }).join("");

        document
            .querySelectorAll(".view-order")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openOrderModal(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    // ============================================================
    // UPDATE ORDER STATUS
    // ============================================================

    async function updateOrderStatus(
        order,
        status
    ) {

        try {

            const {
                error
            } = await supabaseClient
                .from(ORDER_TABLE)
                .update({
                    status
                })
                .eq(
                    "id",
                    order.id
                );

            if (error) {
                throw error;
            }

            order.status = status;

            renderOrders();
            renderPayments();
            updateDashboard();

            showToast(
                "Order status updated."
            );

        } catch (error) {

            console.error(
                "Order status update error:",
                error
            );

            showToast(
                error.message ||
                "Unable to update order.",
                "error"
            );
        }
    }

    // ============================================================
    // ORDER MODAL
    // ============================================================

    const orderModal =
        $("orderModal");

    const orderModalContent =
        $("orderModalContent");

    const closeOrderModal =
        $("closeOrderModal");

    const closeOrderModalBottom =
        $("closeOrderModalBottom");

    function openOrderModal(id) {

        const order =
            orders.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!order) return;

        selectedOrder =
            order;

        const customerName =
            order.customer_name ||
            order.name ||
            order.full_name ||
            "Customer";

        const email =
            order.customer_email ||
            order.email ||
            "-";

        const phone =
            order.customer_phone ||
            order.phone ||
            "-";

        const address =
            order.address ||
            order.shipping_address ||
            order.customer_address ||
            "-";

        let items =
            order.items ||
            order.products ||
            order.order_items ||
            [];

        if (typeof items === "string") {

            try {
                items = JSON.parse(items);
            } catch {
                // Keep string.
            }
        }

        let itemsHTML = "";

        if (Array.isArray(items)) {

            itemsHTML =
                items.map(item => {

                    const name =
                        item.name ||
                        item.product_name ||
                        "Product";

                    const quantity =
                        safeNumber(
                            item.quantity ||
                            item.qty ||
                            1
                        );

                    const price =
                        safeNumber(
                            item.price ||
                            item.unit_price ||
                            0
                        );

                    return `
                        <div class="order-item-row">

                            <span>
                                ${escapeHTML(name)}
                            </span>

                            <span>
                                × ${quantity}
                            </span>

                            <strong>
                                ${formatPrice(
                                    price * quantity
                                )}
                            </strong>

                        </div>
                    `;

                }).join("");

        } else if (items) {

            itemsHTML =
                `<p>${escapeHTML(items)}</p>`;

        } else {

            itemsHTML =
                `<p>No item details available.</p>`;
        }

        const status =
            getOrderStatus(order);

        orderModalContent.innerHTML = `

            <div class="order-detail-grid">

                <div>
                    <strong>Order ID</strong>
                    <span>
                        #${escapeHTML(order.id)}
                    </span>
                </div>

                <div>
                    <strong>Date</strong>
                    <span>
                        ${formatDate(
                            getOrderDate(order)
                        )}
                    </span>
                </div>

                <div>
                    <strong>Customer</strong>
                    <span>
                        ${escapeHTML(customerName)}
                    </span>
                </div>

                <div>
                    <strong>Email</strong>
                    <span>
                        ${escapeHTML(email)}
                    </span>
                </div>

                <div>
                    <strong>Phone</strong>
                    <span>
                        ${escapeHTML(phone)}
                    </span>
                </div>

                <div>
                    <strong>Status</strong>

                    <select
                        id="orderStatusUpdate"
                    >

                        ${[
                            "Confirmed",
                            "Processing",
                            "Shipped",
                            "Delivered",
                            "Cancelled",
                            "Returned"
                        ].map(value => `
                            <option
                                value="${value}"
                                ${value === status ? "selected" : ""}
                            >
                                ${value}
                            </option>
                        `).join("")}

                    </select>
                </div>

            </div>

            <div class="order-address">

                <strong>
                    Shipping Address
                </strong>

                <p>
                    ${escapeHTML(address)}
                </p>

            </div>

            <div class="order-items">

                <h3>
                    Order Items
                </h3>

                ${itemsHTML}

            </div>

            <div class="order-total">

                <span>
                    Total
                </span>

                <strong>
                    ${formatPrice(
                        getOrderAmount(order)
                    )}
                </strong>

            </div>
        `;

        $("orderStatusUpdate")
            ?.addEventListener(
                "change",
                event => {

                    updateOrderStatus(
                        order,
                        event.target.value
                    );
                }
            );

        orderModal?.classList.add("show");

        if (orderModal) {
            orderModal.style.display = "flex";
        }
    }

    function closeOrderModalFunction() {

        orderModal?.classList.remove(
            "show"
        );

        if (orderModal) {
            orderModal.style.display = "";
        }

        selectedOrder = null;
    }

    closeOrderModal?.addEventListener(
        "click",
        closeOrderModalFunction
    );

    closeOrderModalBottom?.addEventListener(
        "click",
        closeOrderModalFunction
    );

    orderModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                orderModal
            ) {
                closeOrderModalFunction();
            }
        }
    );

    // ============================================================
    // PRINT INVOICE
    // ============================================================

    $("printInvoiceBtn")
        ?.addEventListener(
            "click",
            () => {

                if (!selectedOrder) {

                    showToast(
                        "Open an order first.",
                        "warning"
                    );

                    return;
                }

                const order =
                    selectedOrder;

                const customerName =
                    order.customer_name ||
                    order.name ||
                    order.full_name ||
                    "Customer";

                const items =
                    Array.isArray(order.items)
                        ? order.items
                        : [];

                const rows =
                    items.map(item => {

                        const quantity =
                            safeNumber(
                                item.quantity ||
                                item.qty ||
                                1
                            );

                        const price =
                            safeNumber(
                                item.price ||
                                item.unit_price ||
                                0
                            );

                        return `
                            <tr>
                                <td>
                                    ${escapeHTML(
                                        item.name ||
                                        item.product_name ||
                                        "Product"
                                    )}
                                </td>
                                <td>
                                    ${quantity}
                                </td>
                                <td>
                                    ${formatPrice(price)}
                                </td>
                                <td>
                                    ${formatPrice(
                                        price * quantity
                                    )}
                                </td>
                            </tr>
                        `;
                    }).join("");

                const invoiceWindow =
                    window.open(
                        "",
                        "_blank",
                        "width=900,height=800"
                    );

                if (!invoiceWindow) {

                    showToast(
                        "Please allow popups to print invoice.",
                        "error"
                    );

                    return;
                }

                invoiceWindow.document.write(`
                    <!DOCTYPE html>

                    <html>

                    <head>

                        <meta charset="UTF-8">

                        <title>
                            FASHION Invoice #${escapeHTML(order.id)}
                        </title>

                        <style>

                            * {
                                box-sizing: border-box;
                            }

                            body {
                                margin: 0;
                                padding: 40px;
                                font-family: Arial, sans-serif;
                                color: #111;
                            }

                            .invoice {
                                max-width: 850px;
                                margin: auto;
                            }

                            .header {
                                display: flex;
                                justify-content: space-between;
                                gap: 30px;
                                padding-bottom: 25px;
                                border-bottom: 2px solid #111;
                            }

                            h1 {
                                margin: 0 0 5px;
                                font-size: 32px;
                                letter-spacing: 2px;
                            }

                            .muted {
                                color: #666;
                            }

                            .box {
                                margin-top: 25px;
                                padding: 20px;
                                border: 1px solid #ddd;
                                border-radius: 8px;
                            }

                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin-top: 20px;
                            }

                            th,
                            td {
                                padding: 12px;
                                border-bottom: 1px solid #ddd;
                                text-align: left;
                            }

                            th {
                                background: #f5f5f5;
                            }

                            .total {
                                margin-top: 30px;
                                text-align: right;
                                font-size: 24px;
                                font-weight: bold;
                            }

                            .footer {
                                margin-top: 60px;
                                padding-top: 20px;
                                border-top: 1px solid #ddd;
                                text-align: center;
                                color: #777;
                                font-size: 13px;
                            }

                        </style>

                    </head>

                    <body>

                        <div class="invoice">

                            <div class="header">

                                <div>

                                    <h1>
                                        FASHION
                                    </h1>

                                    <div class="muted">
                                        Official Invoice
                                    </div>

                                </div>

                                <div>

                                    <strong>
                                        Order #${escapeHTML(order.id)}
                                    </strong>

                                    <div class="muted">
                                        ${formatDate(
                                            getOrderDate(order)
                                        )}
                                    </div>

                                </div>

                            </div>

                            <div class="box">

                                <strong>
                                    Customer
                                </strong>

                                <p>
                                    ${escapeHTML(customerName)}
                                </p>

                                <p>
                                    ${escapeHTML(
                                        order.customer_email ||
                                        order.email ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    ${escapeHTML(
                                        order.customer_phone ||
                                        order.phone ||
                                        "-"
                                    )}
                                </p>

                                <p>
                                    ${escapeHTML(
                                        order.address ||
                                        order.shipping_address ||
                                        "-"
                                    )}
                                </p>

                            </div>

                            <div class="box">

                                <strong>
                                    Status:
                                </strong>

                                ${escapeHTML(
                                    getOrderStatus(order)
                                )}

                            </div>

                            <table>

                                <thead>

                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    ${rows}

                                </tbody>

                            </table>

                            <div class="total">

                                Total:
                                ${formatPrice(
                                    getOrderAmount(order)
                                )}

                            </div>

                            <div class="footer">

                                Thank you for shopping with FASHION.

                            </div>

                        </div>

                    </body>

                    </html>
                `);

                invoiceWindow.document.close();

                invoiceWindow.focus();

                setTimeout(
                    () => invoiceWindow.print(),
                    300
                );
            }
        );

    // ============================================================
    // CUSTOMERS
    // ============================================================

    async function loadCustomers() {

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(CUSTOMER_TABLE)
                .select("*");

            if (error) {

                customers =
                    buildCustomersFromOrders();

            } else {

                customers =
                    Array.isArray(data)
                        ? data
                        : [];

                if (
                    !customers.length &&
                    orders.length
                ) {

                    customers =
                        buildCustomersFromOrders();
                }
            }

            renderCustomers();
            updateDashboard();

        } catch (error) {

            console.error(
                "Customer loading error:",
                error
            );

            customers =
                buildCustomersFromOrders();

            renderCustomers();
            updateDashboard();
        }
    }

    function buildCustomersFromOrders() {

        const map =
            new Map();

        orders.forEach(order => {

            const email =
                String(
                    order.customer_email ||
                    order.email ||
                    ""
                )
                    .trim()
                    .toLowerCase();

            const phone =
                String(
                    order.customer_phone ||
                    order.phone ||
                    ""
                )
                    .trim();

            const key =
                email ||
                phone ||
                String(order.id);

            if (!map.has(key)) {

                map.set(
                    key,
                    {
                        id: key,

                        name:
                            order.customer_name ||
                            order.name ||
                            order.full_name ||
                            "Customer",

                        email:
                            order.customer_email ||
                            order.email ||
                            "",

                        phone:
                            order.customer_phone ||
                            order.phone ||
                            "",

                        created_at:
                            getOrderDate(order),

                        order_count: 0,

                        total_spent: 0
                    }
                );
            }

            const customer =
                map.get(key);

            customer.order_count += 1;

            customer.total_spent +=
                getOrderAmount(order);
        });

        return Array.from(
            map.values()
        );
    }

    // ============================================================
    // RENDER CUSTOMERS
    // ============================================================

    function renderCustomers() {

        const container =
            $("customersContainer");

        if (!container) return;

        const search =
            $("customerSearch")
                ?.value
                ?.trim()
                ?.toLowerCase() || "";

        const sort =
            $("customerSort")
                ?.value || "newest";

        let filtered =
            customers.filter(customer => {

                const name =
                    getCustomerName(customer)
                        .toLowerCase();

                const email =
                    getCustomerEmail(customer)
                        .toLowerCase();

                const phone =
                    getCustomerPhone(customer)
                        .toLowerCase();

                return (
                    !search ||
                    name.includes(search) ||
                    email.includes(search) ||
                    phone.includes(search)
                );
            });

        filtered.sort((a, b) => {

            if (sort === "name_asc") {

                return getCustomerName(a)
                    .localeCompare(
                        getCustomerName(b)
                    );
            }

            if (sort === "name_desc") {

                return getCustomerName(b)
                    .localeCompare(
                        getCustomerName(a)
                    );
            }

            return (
                new Date(b.created_at || 0) -
                new Date(a.created_at || 0)
            );
        });

        if (!filtered.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No customers found</strong>
                    <p>Customer information will appear here.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            filtered.map(customer => {

                const orderCount =
                    customer.order_count ??
                    orders.filter(
                        order =>
                            String(
                                order.customer_email ||
                                order.email ||
                                ""
                            )
                                .toLowerCase() ===
                            String(
                                customer.email ||
                                ""
                            )
                                .toLowerCase()
                    ).length;

                const totalSpent =
                    customer.total_spent ??
                    orders
                        .filter(
                            order =>
                                String(
                                    order.customer_email ||
                                    order.email ||
                                    ""
                                )
                                    .toLowerCase() ===
                                String(
                                    customer.email ||
                                    ""
                                )
                                    .toLowerCase()
                        )
                        .reduce(
                            (
                                total,
                                order
                            ) =>
                                total +
                                getOrderAmount(order),
                            0
                        );

                return `
                    <article class="customer-card">

                        <div class="customer-avatar">
                            ${escapeHTML(
                                getCustomerName(customer)
                                    .charAt(0)
                                    .toUpperCase()
                            )}
                        </div>

                        <div class="customer-info">

                            <h3>
                                ${escapeHTML(
                                    getCustomerName(customer)
                                )}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    getCustomerEmail(customer)
                                )}
                            </p>

                            <p>
                                ${escapeHTML(
                                    getCustomerPhone(customer)
                                )}
                            </p>

                        </div>

                        <div class="customer-stats">

                            <span>
                                Orders
                            </span>

                            <strong>
                                ${orderCount}
                            </strong>

                        </div>

                        <div class="customer-stats">

                            <span>
                                Spent
                            </span>

                            <strong>
                                ${formatPrice(totalSpent)}
                            </strong>

                        </div>

                        <button
                            type="button"
                            class="primary-btn view-customer"
                            data-id="${escapeHTML(customer.id)}"
                        >
                            VIEW
                        </button>

                    </article>
                `;

            }).join("");

        document
            .querySelectorAll(
                ".view-customer"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openCustomerModal(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    // ============================================================
    // CUSTOMER MODAL
    // ============================================================

    const customerModal =
        $("customerModal");

    const customerModalContent =
        $("customerModalContent");

    const closeCustomerModal =
        $("closeCustomerModal");

    const closeCustomerModalBottom =
        $("closeCustomerModalBottom");

    function openCustomerModal(id) {

        const customer =
            customers.find(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (!customer) return;

        selectedCustomer =
            customer;

        const email =
            getCustomerEmail(customer);

        const customerOrders =
            orders.filter(order => {

                const orderEmail =
                    String(
                        order.customer_email ||
                        order.email ||
                        ""
                    )
                        .trim()
                        .toLowerCase();

                return (
                    email !== "-" &&
                    email !== "" &&
                    orderEmail ===
                    email.toLowerCase()
                );
            });

        const totalSpent =
            customerOrders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

        customerModalContent.innerHTML = `

            <div class="customer-profile">

                <div class="customer-large-avatar">
                    ${escapeHTML(
                        getCustomerName(customer)
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <h3>
                    ${escapeHTML(
                        getCustomerName(customer)
                    )}
                </h3>

                <p>
                    ${escapeHTML(email)}
                </p>

            </div>

            <div class="customer-detail-grid">

                <div>
                    <strong>Email</strong>
                    <span>
                        ${escapeHTML(email)}
                    </span>
                </div>

                <div>
                    <strong>Phone</strong>
                    <span>
                        ${escapeHTML(
                            getCustomerPhone(customer)
                        )}
                    </span>
                </div>

                <div>
                    <strong>Orders</strong>
                    <span>
                        ${customerOrders.length}
                    </span>
                </div>

                <div>
                    <strong>Total Spent</strong>
                    <span>
                        ${formatPrice(totalSpent)}
                    </span>
                </div>

            </div>

            <div>

                <h3>
                    Recent Orders
                </h3>

                ${
                    customerOrders.length
                        ? sortOrders(customerOrders)
                            .slice(0, 10)
                            .map(
                                order => `
                                    <div class="customer-order-row">

                                        <span>
                                            #${escapeHTML(
                                                order.id
                                            )}
                                        </span>

                                        <span>
                                            ${formatPrice(
                                                getOrderAmount(order)
                                            )}
                                        </span>

                                        <span>
                                            ${escapeHTML(
                                                getOrderStatus(order)
                                            )}
                                        </span>

                                    </div>
                                `
                            )
                            .join("")
                        : `
                            <p>
                                No orders found.
                            </p>
                        `
                }

            </div>
        `;

        customerModal?.classList.add(
            "show"
        );

        if (customerModal) {
            customerModal.style.display = "flex";
        }
    }

    function closeCustomerModalFunction() {

        customerModal?.classList.remove(
            "show"
        );

        if (customerModal) {
            customerModal.style.display = "";
        }

        selectedCustomer = null;
    }

    closeCustomerModal?.addEventListener(
        "click",
        closeCustomerModalFunction
    );

    closeCustomerModalBottom?.addEventListener(
        "click",
        closeCustomerModalFunction
    );

    customerModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                customerModal
            ) {
                closeCustomerModalFunction();
            }
        }
    );

    // ============================================================
    // INVENTORY
    // ============================================================

    function renderInventory() {

        const container =
            $("inventoryContainer");

        if (!container) return;

        const filter =
            $("inventoryFilter")
                ?.value || "all";

        const healthy =
            products.filter(
                product =>
                    getProductStock(product) >
                    LOW_STOCK_LIMIT
            );

        const low =
            products.filter(
                product => {

                    const stock =
                        getProductStock(product);

                    return (
                        stock > 0 &&
                        stock <=
                        LOW_STOCK_LIMIT
                    );
                }
            );

        const out =
            products.filter(
                product =>
                    getProductStock(product) <= 0
            );

        setText(
            "inventoryHealthy",
            healthy.length
        );

        setText(
            "inventoryLow",
            low.length
        );

        setText(
            "inventoryOut",
            out.length
        );

        let filtered =
            products.filter(product => {

                const stock =
                    getProductStock(product);

                if (filter === "healthy") {
                    return stock >
                        LOW_STOCK_LIMIT;
                }

                if (filter === "low") {
                    return (
                        stock > 0 &&
                        stock <=
                        LOW_STOCK_LIMIT
                    );
                }

                if (filter === "out") {
                    return stock <= 0;
                }

                return true;
            });

        if (!filtered.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No inventory items</strong>
                    <p>Products will appear here.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            filtered.map(product => {

                const stock =
                    getProductStock(product);

                let status =
                    "Healthy";

                let statusClass =
                    "healthy";

                if (stock <= 0) {

                    status =
                        "Out of Stock";

                    statusClass =
                        "out";

                } else if (
                    stock <=
                    LOW_STOCK_LIMIT
                ) {

                    status =
                        "Low Stock";

                    statusClass =
                        "low";
                }

                return `
                    <div class="inventory-row">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    getProductName(product)
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    product.category ||
                                    "-"
                                )}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${stock}
                            </strong>

                            <span>
                                units
                            </span>

                        </div>

                        <div>

                            <span class="inventory-status ${statusClass}">
                                ${status}
                            </span>

                        </div>

                        <button
                            type="button"
                            class="secondary-btn inventory-edit"
                            data-id="${escapeHTML(product.id)}"
                        >
                            EDIT
                        </button>

                    </div>
                `;

            }).join("");

        document
            .querySelectorAll(
                ".inventory-edit"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditProduct(
                            button.dataset.id
                        );
                    }
                );
            });
    }

    // ============================================================
    // PAYMENTS
    // ============================================================

    function renderPayments() {

        const container =
            $("paymentsContainer");

        if (!container) return;

        const revenue =
            orders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

        const successfulOrders =
            orders.filter(order => {

                const status =
                    getOrderStatus(order);

                return [
                    "Confirmed",
                    "Processing",
                    "Shipped",
                    "Delivered"
                ].includes(status);
            });

        const refunds =
            orders
                .filter(
                    order =>
                        getOrderStatus(order) ===
                        "Returned"
                )
                .reduce(
                    (
                        total,
                        order
                    ) =>
                        total +
                        getOrderAmount(order),
                    0
                );

        setText(
            "paymentRevenue",
            formatPrice(revenue)
        );

        setText(
            "paymentSuccessful",
            successfulOrders.length
        );

        setText(
            "paymentRefunds",
            formatPrice(refunds)
        );

        if (!orders.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No transactions</strong>
                    <p>Payment information will appear after orders are created.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            sortOrders(orders)
                .slice(0, 50)
                .map(order => {

                    return `
                        <div class="payment-row">

                            <div>

                                <strong>
                                    #${escapeHTML(order.id)}
                                </strong>

                                <span>
                                    ${formatDate(
                                        getOrderDate(order)
                                    )}
                                </span>

                            </div>

                            <div>

                                <strong>
                                    ${formatPrice(
                                        getOrderAmount(order)
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    ${escapeHTML(
                                        getOrderStatus(order)
                                    )}
                                </span>

                            </div>

                        </div>
                    `;

                }).join("");
    }

    // ============================================================
    // DASHBOARD
    // ============================================================

    function updateDashboard() {

        const totalRevenue =
            orders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

        setText(
            "productCount",
            products.length
        );

        setText(
            "orderCount",
            orders.length
        );

        setText(
            "customerCount",
            customers.length
        );

        setText(
            "salesCount",
            formatPrice(totalRevenue)
        );

        setText(
            "sidebarProductBadge",
            products.length
        );

        setText(
            "sidebarOrderBadge",
            orders.length
        );

        renderRecentOrders();
        renderTopProducts();
        renderOrderStatusChart();
        renderSalesChart();
    }

    // ============================================================
    // RECENT ORDERS
    // ============================================================

    function renderRecentOrders() {

        const container =
            $("recentOrders");

        if (!container) return;

        const recent =
            sortOrders(orders)
                .slice(0, 5);

        if (!recent.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No orders yet</strong>
                    <p>New orders will appear here.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            recent.map(order => {

                const name =
                    order.customer_name ||
                    order.name ||
                    order.full_name ||
                    "Customer";

                return `
                    <div class="recent-order-row">

                        <div>

                            <strong>
                                #${escapeHTML(order.id)}
                            </strong>

                            <span>
                                ${escapeHTML(name)}
                            </span>

                        </div>

                        <div>

                            <strong>
                                ${formatPrice(
                                    getOrderAmount(order)
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    getOrderStatus(order)
                                )}
                            </span>

                        </div>

                    </div>
                `;

            }).join("");
    }

    // ============================================================
    // TOP PRODUCTS
    // ============================================================

    function renderTopProducts() {

        const container =
            $("topProducts");

        if (!container) return;

        if (!products.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No products</strong>
                    <p>Add products to see them here.</p>
                </div>`;

            return;
        }

        const topProducts =
            products
                .slice()
                .sort(
                    (a, b) =>
                        getProductStock(b) -
                        getProductStock(a)
                )
                .slice(0, 5);

        container.innerHTML =
            topProducts.map(product => {

                return `
                    <div class="top-product-row">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    getProductName(product)
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    product.category ||
                                    "-"
                                )}
                            </span>

                        </div>

                        <strong>
                            ${formatPrice(
                                getProductPrice(product)
                            )}
                        </strong>

                    </div>
                `;

            }).join("");
    }

    // ============================================================
    // ORDER STATUS CHART
    // ============================================================

    function renderOrderStatusChart() {

        const chart =
            $("orderStatusChart");

        const legend =
            $("orderStatusLegend");

        if (!chart) return;

        const statuses = [
            "Confirmed",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
            "Returned"
        ];

        const values =
            statuses.map(
                status =>
                    orders.filter(
                        order =>
                            getOrderStatus(order) ===
                            status
                    ).length
            );

        const total =
            values.reduce(
                (a, b) =>
                    a + b,
                0
            );

        if (!total) {

            chart.innerHTML =
                `<div class="chart-empty">
                    No order data
                </div>`;

            if (legend) {
                legend.innerHTML = "";
            }

            return;
        }

        const radius = 45;

        const circumference =
            2 *
            Math.PI *
            radius;

        let offset = 0;

        const segments =
            values.map(
                (
                    value,
                    index
                ) => {

                    if (!value) {
                        return "";
                    }

                    const length =
                        (
                            value /
                            total
                        ) *
                        circumference;

                    const segment = `
                        <circle
                            cx="60"
                            cy="60"
                            r="${radius}"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="18"
                            stroke-dasharray="${length} ${circumference - length}"
                            stroke-dashoffset="${-offset}"
                        ></circle>
                    `;

                    offset += length;

                    return segment;
                }
            ).join("");

        chart.innerHTML = `

            <div
                class="donut-visual"
                style="
                    position:relative;
                    display:flex;
                    justify-content:center;
                    align-items:center;
                "
            >

                <svg
                    width="150"
                    height="150"
                    viewBox="0 0 120 120"
                    style="transform:rotate(-90deg);"
                >

                    <circle
                        cx="60"
                        cy="60"
                        r="${radius}"
                        fill="none"
                        stroke="currentColor"
                        stroke-opacity=".12"
                        stroke-width="18"
                    ></circle>

                    ${segments}

                </svg>

                <div
                    style="
                        position:absolute;
                        text-align:center;
                    "
                >

                    <strong>
                        ${total}
                    </strong>

                    <small>
                        Orders
                    </small>

                </div>

            </div>
        `;

        if (legend) {

            legend.innerHTML =
                statuses.map(
                    (
                        status,
                        index
                    ) => {

                        return `
                            <div class="legend-item">

                                <span>
                                    ${escapeHTML(status)}
                                </span>

                                <strong>
                                    ${values[index]}
                                </strong>

                            </div>
                        `;
                    }
                ).join("");
        }
    }

    // ============================================================
    // SALES CHART
    // ============================================================

    function renderSalesChart() {

        const container =
            $("salesChart");

        if (!container) return;

        const days =
            Number(salesPeriod) ||
            7;

        const data = [];

        for (
            let i = days - 1;
            i >= 0;
            i--
        ) {

            const date =
                new Date();

            date.setHours(
                0,
                0,
                0,
                0
            );

            date.setDate(
                date.getDate() - i
            );

            const next =
                new Date(date);

            next.setDate(
                next.getDate() + 1
            );

            const revenue =
                orders
                    .filter(order => {

                        const orderDate =
                            new Date(
                                getOrderDate(order)
                            );

                        return (
                            orderDate >= date &&
                            orderDate < next
                        );
                    })
                    .reduce(
                        (
                            total,
                            order
                        ) =>
                            total +
                            getOrderAmount(order),
                        0
                    );

            data.push({
                date,
                revenue
            });
        }

        const max =
            Math.max(
                ...data.map(
                    item =>
                        item.revenue
                ),
                1
            );

        const width = 700;
        const height = 260;
        const padding = 35;

        const graphWidth =
            width -
            padding * 2;

        const graphHeight =
            height -
            padding * 2;

        const points =
            data.map(
                (
                    item,
                    index
                ) => {

                    const x =
                        padding +
                        (
                            index /
                            Math.max(
                                data.length - 1,
                                1
                            )
                        ) *
                        graphWidth;

                    const y =
                        height -
                        padding -
                        (
                            item.revenue /
                            max
                        ) *
                        graphHeight;

                    return {
                        x,
                        y,
                        item
                    };
                }
            );

        const path =
            points.map(
                (
                    point,
                    index
                ) =>
                    (
                        index === 0
                            ? "M"
                            : "L"
                    ) +
                    `${point.x} ${point.y}`
            ).join(" ");

        container.innerHTML = `

            <div
                style="
                    width:100%;
                    overflow-x:auto;
                "
            >

                <svg
                    viewBox="0 0 ${width} ${height}"
                    width="100%"
                    height="260"
                    preserveAspectRatio="none"
                >

                    <line
                        x1="${padding}"
                        y1="${height - padding}"
                        x2="${width - padding}"
                        y2="${height - padding}"
                        stroke="currentColor"
                        opacity=".2"
                    ></line>

                    <line
                        x1="${padding}"
                        y1="${padding}"
                        x2="${padding}"
                        y2="${height - padding}"
                        stroke="currentColor"
                        opacity=".2"
                    ></line>

                    <path
                        d="${path}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="3"
                    ></path>

                    ${points.map(
                        point => `
                            <circle
                                cx="${point.x}"
                                cy="${point.y}"
                                r="4"
                                fill="currentColor"
                            ></circle>
                        `
                    ).join("")}

                </svg>

            </div>

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    overflow:hidden;
                    font-size:12px;
                "
            >

                ${data.map(
                    item => `
                        <span>
                            ${item.date.toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "short"
                                }
                            )}
                        </span>
                    `
                ).join("")}

            </div>
        `;
    }

    // ============================================================
    // ANALYTICS
    // ============================================================

    function renderAnalytics() {

        const revenueChart =
            $("analyticsRevenueChart");

        const categoryChart =
            $("categoryChart");

        const analyticsSummary =
            $("analyticsSummary");

        const revenue =
            orders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    getOrderAmount(order),
                0
            );

        const averageOrder =
            orders.length
                ? revenue /
                  orders.length
                : 0;

        const categoryMap = {};

        products.forEach(product => {

            const category =
                product.category ||
                "Other";

            categoryMap[category] =
                (
                    categoryMap[category] ||
                    0
                ) + 1;
        });

        if (revenueChart) {

            revenueChart.innerHTML =
                `<div class="chart-empty">
                    Total Revenue:
                    <strong>
                        ${formatPrice(revenue)}
                    </strong>
                </div>`;
        }

        if (categoryChart) {

            const entries =
                Object.entries(
                    categoryMap
                );

            if (!entries.length) {

                categoryChart.innerHTML =
                    `<div class="chart-empty">
                        No category data
                    </div>`;

            } else {

                categoryChart.innerHTML =
                    entries.map(
                        (
                            [category, count]
                        ) => {

                            const percentage =
                                products.length
                                    ? (
                                        count /
                                        products.length
                                    ) *
                                    100
                                    : 0;

                            return `
                                <div
                                    style="
                                        margin-bottom:14px;
                                    "
                                >

                                    <div
                                        style="
                                            display:flex;
                                            justify-content:space-between;
                                            margin-bottom:5px;
                                        "
                                    >

                                        <span>
                                            ${escapeHTML(category)}
                                        </span>

                                        <strong>
                                            ${count}
                                        </strong>

                                    </div>

                                    <div
                                        style="
                                            height:8px;
                                            background:rgba(127,127,127,.15);
                                            border-radius:10px;
                                            overflow:hidden;
                                        "
                                    >

                                        <div
                                            style="
                                                width:${percentage}%;
                                                height:100%;
                                                background:currentColor;
                                            "
                                        ></div>

                                    </div>

                                </div>
                            `;
                        }
                    ).join("");
            }
        }

        if (analyticsSummary) {

            analyticsSummary.innerHTML = `

                <div class="analytics-summary-card">

                    <span>
                        Total Revenue
                    </span>

                    <strong>
                        ${formatPrice(revenue)}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Total Orders
                    </span>

                    <strong>
                        ${orders.length}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Average Order
                    </span>

                    <strong>
                        ${formatPrice(averageOrder)}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Products
                    </span>

                    <strong>
                        ${products.length}
                    </strong>

                </div>

                <div class="analytics-summary-card">

                    <span>
                        Customers
                    </span>

                    <strong>
                        ${customers.length}
                    </strong>

                </div>
            `;
        }
    }

    // ============================================================
    // REVIEWS
    // ============================================================

    async function loadReviews() {

        const container =
            $("reviewsContainer");

        if (!container) return;

        try {

            const {
                data,
                error
            } = await supabaseClient
                .from(REVIEW_TABLE)
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

            if (error) {

                reviews = [];

                container.innerHTML =
                    `<div class="empty">
                        <strong>Reviews module ready</strong>
                        <p>Connect the reviews table to enable live reviews.</p>
                    </div>`;

                return;
            }

            reviews =
                Array.isArray(data)
                    ? data
                    : [];

            renderReviews();

        } catch (error) {

            console.error(
                "Reviews error:",
                error
            );
        }
    }

    function renderReviews() {

        const container =
            $("reviewsContainer");

        if (!container) return;

        setText(
            "reviewCount",
            reviews.length
        );

        const ratings =
            reviews
                .map(
                    review =>
                        safeNumber(
                            review.rating
                        )
                )
                .filter(
                    rating =>
                        rating > 0
                );

        const average =
            ratings.length
                ? ratings.reduce(
                    (
                        a,
                        b
                    ) =>
                        a + b,
                    0
                ) /
                  ratings.length
                : 0;

        setText(
            "averageRating",
            average
                ? average.toFixed(1)
                : "0.0"
        );

        const pending =
            reviews.filter(
                review =>
                    String(
                        review.status ||
                        ""
                    )
                        .toLowerCase() ===
                    "pending"
            ).length;

        setText(
            "pendingReviews",
            pending
        );

        if (!reviews.length) {

            container.innerHTML =
                `<div class="empty">
                    <strong>No reviews yet</strong>
                    <p>Customer reviews will appear here.</p>
                </div>`;

            return;
        }

        container.innerHTML =
            reviews.map(review => {

                const rating =
                    Math.max(
                        0,
                        Math.min(
                            5,
                            safeNumber(
                                review.rating
                            )
                        )
                    );

                const stars =
                    "★".repeat(
                        Math.round(rating)
                    ) +
                    "☆".repeat(
                        5 -
                        Math.round(rating)
                    );

                return `
                    <div class="review-row">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    review.name ||
                                    review.customer_name ||
                                    "Customer"
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    review.comment ||
                                    review.review ||
                                    ""
                                )}
                            </p>

                        </div>

                        <div>
                            ${stars}
                        </div>

                    </div>
                `;

            }).join("");
    }

    // ============================================================
    // SETTINGS
    // ============================================================

    function loadSettings() {

        const savedName =
            localStorage.getItem(
                "fashionAdminName"
            );

        const input =
            $("settingsAdminName");

        if (
            savedName &&
            input
        ) {
            input.value =
                savedName;
        }

        const savedNotifications =
            localStorage.getItem(
                "fashionAdminNotifications"
            );

        if (!savedNotifications) return;

        try {

            const settings =
                JSON.parse(
                    savedNotifications
                );

            if (
                typeof settings.newOrders ===
                "boolean"
            ) {

                $("newOrderNotifications")
                    ?.setAttribute(
                        "checked",
                        settings.newOrders
                    );

                if ($("newOrderNotifications")) {
                    $("newOrderNotifications").checked =
                        settings.newOrders;
                }
            }

            if (
                typeof settings.lowStock ===
                "boolean"
            ) {

                if ($("lowStockNotifications")) {
                    $("lowStockNotifications").checked =
                        settings.lowStock;
                }
            }

            if (
                typeof settings.marketing ===
                "boolean"
            ) {

                if ($("marketingNotifications")) {
                    $("marketingNotifications").checked =
                        settings.marketing;
                }
            }

        } catch {
            // Ignore invalid settings.
        }
    }

    function saveSettings() {

        const name =
            $("settingsAdminName")
                ?.value
                ?.trim() ||
            "Administrator";

        localStorage.setItem(
            "fashionAdminName",
            name
        );

        localStorage.setItem(
            "fashionAdminNotifications",
            JSON.stringify({

                newOrders:
                    $("newOrderNotifications")
                        ?.checked ??
                    true,

                lowStock:
                    $("lowStockNotifications")
                        ?.checked ??
                    true,

                marketing:
                    $("marketingNotifications")
                        ?.checked ??
                    false

            })
        );

        showToast(
            "Settings saved successfully."
        );
    }

    // ============================================================
    // SEARCH EVENTS
    // ============================================================

    function setupSearchEvents() {

        $("productSearch")
            ?.addEventListener(
                "input",
                renderProducts
            );

        $("productCategoryFilter")
            ?.addEventListener(
                "change",
                renderProducts
            );

        $("productSort")
            ?.addEventListener(
                "change",
                renderProducts
            );

        $("orderSearch")
            ?.addEventListener(
                "input",
                renderOrders
            );

        $("orderStatusFilter")
            ?.addEventListener(
                "change",
                renderOrders
            );

        $("orderSort")
            ?.addEventListener(
                "change",
                renderOrders
            );

        $("customerSearch")
            ?.addEventListener(
                "input",
                renderCustomers
            );

        $("customerSort")
            ?.addEventListener(
                "change",
                renderCustomers
            );

        $("inventoryFilter")
            ?.addEventListener(
                "change",
                renderInventory
            );

        $("salesPeriod")
            ?.addEventListener(
                "change",
                event => {

                    salesPeriod =
                        Number(
                            event.target.value
                        ) || 7;

                    renderSalesChart();
                }
            );
    }

    // ============================================================
    // REFRESH BUTTONS
    // ============================================================

    function setupRefreshButtons() {

        $("refreshDashboard")
            ?.addEventListener(
                "click",
                async () => {

                    showToast(
                        "Refreshing dashboard..."
                    );

                    await Promise.all([
                        loadProducts(),
                        loadOrders()
                    ]);

                    await loadCustomers();
                    await loadReviews();

                    renderAnalytics();

                    showToast(
                        "Dashboard refreshed."
                    );
                }
            );

        $("refreshOrders")
            ?.addEventListener(
                "click",
                async () => {

                    await loadOrders();

                    showToast(
                        "Orders refreshed."
                    );
                }
            );

        $("refreshCustomers")
            ?.addEventListener(
                "click",
                async () => {

                    await loadCustomers();

                    showToast(
                        "Customers refreshed."
                    );
                }
            );

        $("inventoryRefresh")
            ?.addEventListener(
                "click",
                async () => {

                    await loadProducts();

                    showToast(
                        "Inventory refreshed."
                    );
                }
            );
    }

    // ============================================================
    // GLOBAL SEARCH
    // ============================================================

    function setupGlobalSearch() {

        const button =
            $("headerSearchBtn");

        const modal =
            $("globalSearch");

        const input =
            $("globalSearchInput");

        const close =
            $("closeGlobalSearch");

        button?.addEventListener(
            "click",
            () => {

                modal?.classList.add(
                    "show"
                );

                input?.focus();
            }
        );

        close?.addEventListener(
            "click",
            () => {

                modal?.classList.remove(
                    "show"
                );
            }
        );

        input?.addEventListener(
            "input",
            () => {

                const query =
                    input.value
                        .trim()
                        .toLowerCase();

                if (!query) return;

                const product =
                    products.find(
                        item =>
                            getProductName(item)
                                .toLowerCase()
                                .includes(query)
                    );

                if (product) {

                    openSection(
                        "products"
                    );

                    if ($("productSearch")) {

                        $("productSearch").value =
                            query;

                        renderProducts();
                    }

                    return;
                }

                const order =
                    orders.find(
                        item => {

                            const id =
                                String(
                                    item.id ||
                                    ""
                                )
                                    .toLowerCase();

                            const name =
                                String(
                                    item.customer_name ||
                                    item.name ||
                                    ""
                                )
                                    .toLowerCase();

                            return (
                                id.includes(query) ||
                                name.includes(query)
                            );
                        }
                    );

                if (order) {

                    openSection(
                        "orders"
                    );

                    if ($("orderSearch")) {

                        $("orderSearch").value =
                            query;

                        renderOrders();
                    }
                }
            }
        );
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    function setupNotifications() {

        $("notificationBtn")
            ?.addEventListener(
                "click",
                () => {

                    const lowStock =
                        products.filter(
                            product =>
                                getProductStock(
                                    product
                                ) <=
                                LOW_STOCK_LIMIT
                        ).length;

                    const pendingOrders =
                        orders.filter(
                            order => {

                                const status =
                                    getOrderStatus(
                                        order
                                    );

                                return (
                                    status ===
                                    "Confirmed" ||
                                    status ===
                                    "Processing"
                                );
                            }
                        ).length;

                    showToast(
                        `Low stock: ${lowStock} · Pending orders: ${pendingOrders}`,
                        "warning"
                    );
                }
            );
    }

    // ============================================================
    // MARKETING
    // ============================================================

    function setupMarketing() {

        $("createCouponBtn")
            ?.addEventListener(
                "click",
                () => {

                    showToast(
                        "Coupon management requires a coupons table.",
                        "warning"
                    );
                }
            );

        $("marketingCouponAction")
            ?.addEventListener(
                "click",
                () => {

                    showToast(
                        "Coupon management requires a coupons table.",
                        "warning"
                    );
                }
            );

        $("bannerManagementBtn")
            ?.addEventListener(
                "click",
                () => {

                    showToast(
                        "Banner management is ready to connect with your storefront.",
                        "warning"
                    );
                }
            );

        $("marketingNotificationBtn")
            ?.addEventListener(
                "click",
                () => {

                    openSection(
                        "settings"
                    );
                }
            );
    }

    // ============================================================
    // EXPORT CSV
    // ============================================================

    function downloadCSV(
        filename,
        rows
    ) {

        if (!rows.length) {

            showToast(
                "No data available to export.",
                "warning"
            );

            return;
        }

        const headers =
            Object.keys(
                rows[0]
            );

        const csvRows = [
            headers.join(",")
        ];

        rows.forEach(row => {

            csvRows.push(
                headers.map(
                    header => {

                        const value =
                            String(
                                row[header] ??
                                ""
                            );

                        return `"${value.replace(
                            /"/g,
                            '""'
                        )}"`;
                    }
                ).join(",")
            );
        });

        const blob =
            new Blob(
                [
                    csvRows.join("\n")
                ],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href =
            url;

        link.download =
            filename;

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(
            url
        );
    }

    function setupExport() {

        $("exportReportBtn")
            ?.addEventListener(
                "click",
                () => {

                    const rows =
                        orders.map(
                            order => ({

                                order_id:
                                    order.id,

                                customer:
                                    order.customer_name ||
                                    order.name ||
                                    order.full_name ||
                                    "",

                                email:
                                    order.customer_email ||
                                    order.email ||
                                    "",

                                phone:
                                    order.customer_phone ||
                                    order.phone ||
                                    "",

                                amount:
                                    getOrderAmount(
                                        order
                                    ),

                                status:
                                    getOrderStatus(
                                        order
                                    ),

                                date:
                                    getOrderDate(
                                        order
                                    )
                            })
                        );

                    downloadCSV(
                        "fashion-orders-report.csv",
                        rows
                    );

                    showToast(
                        "CSV report exported."
                    );
                }
            );
    }

    // ============================================================
    // KEYBOARD SHORTCUTS
    // ============================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeProductModalFunction();
                closeOrderModalFunction();
                closeCustomerModalFunction();

                $("globalSearch")
                    ?.classList
                    .remove("show");

                closeMobileSidebar();
            }

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() ===
                "k"
            ) {

                event.preventDefault();

                $("globalSearch")
                    ?.classList
                    .add("show");

                $("globalSearchInput")
                    ?.focus();
            }
        }
    );

    // ============================================================
    // AUTH STATE
    // ============================================================

    supabaseClient.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            if (
                event ===
                "SIGNED_OUT"
            ) {

                window.location.replace(
                    "admin-login.html"
                );

                return;
            }

            if (
                (
                    event ===
                    "SIGNED_IN" ||
                    event ===
                    "TOKEN_REFRESHED"
                ) &&
                session?.user?.email
            ) {

                if (
                    session.user.email
                        .toLowerCase() !==
                    ADMIN_EMAIL.toLowerCase()
                ) {

                    await supabaseClient
                        .auth
                        .signOut();

                    window.location.replace(
                        "admin-login.html"
                    );
                }
            }
        }
    );

    // ============================================================
    // SETTINGS BUTTON
    // ============================================================

    $("saveSettingsBtn")
        ?.addEventListener(
            "click",
            saveSettings
        );

    [
        $("newOrderNotifications"),
        $("lowStockNotifications"),
        $("marketingNotifications")
    ].forEach(
        checkbox => {

            checkbox?.addEventListener(
                "change",
                () => {

                    const settings = {
                        newOrders:
                            $("newOrderNotifications")
                                ?.checked ??
                            true,

                        lowStock:
                            $("lowStockNotifications")
                                ?.checked ??
                            true,

                        marketing:
                            $("marketingNotifications")
                                ?.checked ??
                            false
                    };

                    localStorage.setItem(
                        "fashionAdminNotifications",
                        JSON.stringify(settings)
                    );
                }
            );
        }
    );

    // ============================================================
    // INITIALIZATION
    // ============================================================

    try {

        const authenticated =
            await checkAdminSession();

        if (!authenticated) {
            return;
        }

        setupLogout();
        setupNavigation();
        setupMobileSidebar();
        setupProductButtons();
        setupSearchEvents();
        setupRefreshButtons();
        setupGlobalSearch();
        setupNotifications();
        setupMarketing();
        setupExport();
        loadSettings();

        await Promise.all([
            loadProducts(),
            loadOrders()
        ]);

        await loadCustomers();
        await loadReviews();

        updateDashboard();
        renderInventory();
        renderPayments();
        renderAnalytics();

        hideLoadingScreen();

        console.log(
            "FASHION Admin Dashboard initialized successfully."
        );

    } catch (error) {

        console.error(
            "Dashboard initialization error:",
            error
        );

        hideLoadingScreen();

        showToast(
            error.message ||
            "Dashboard initialization failed.",
            "error"
        );
    }

});