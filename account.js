// =====================================================
// FASHION ACCOUNT SYSTEM
// SUPABASE PROFILE + ORDERS
// =====================================================

"use strict";

document.addEventListener("DOMContentLoaded", async function () {

    // =====================================================
    // SUPABASE CHECK
    // =====================================================

    if (typeof supabaseClient === "undefined") {
        console.error("supabaseClient is not defined.");
        alert("Supabase is not connected.");
        return;
    }

    // =====================================================
    // GET SESSION
    // =====================================================

    const {
        data: sessionData,
        error: sessionError
    } = await supabaseClient.auth.getSession();

    if (sessionError) {
        console.error("Session error:", sessionError);
        alert("Unable to verify your account.");
        return;
    }

    const session = sessionData?.session;
    const authUser = session?.user;

    // =====================================================
    // LOGIN CHECK
    // =====================================================

    if (!authUser) {
        window.location.href = "login.html";
        return;
    }

    // =====================================================
    // ELEMENTS
    // =====================================================

    const accountName =
        document.getElementById("accountName");

    const accountAvatar =
        document.getElementById("accountAvatar");

    const orderHistory =
        document.getElementById("orderHistory");

    const orderMenuCount =
        document.getElementById("orderMenuCount");

    const ordersCountText =
        document.getElementById("ordersCountText");

    const orderSearch =
        document.getElementById("orderSearch");

    const orderFilter =
        document.getElementById("orderFilter");

    const accountLogout =
        document.getElementById("accountLogout");

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const cancelProfileBtn =
        document.getElementById("cancelProfileBtn");

    const profileView =
        document.getElementById("profileView");

    const profileForm =
        document.getElementById("profileForm");

    const profileName =
        document.getElementById("profileName");

    const profilePhone =
        document.getElementById("profilePhone");

    const profileAddress =
        document.getElementById("profileAddress");

    const profileCity =
        document.getElementById("profileCity");

    const profilePincode =
        document.getElementById("profilePincode");

    const userName =
        document.getElementById("userName");

    const userEmail =
        document.getElementById("userEmail");

    const userPhone =
        document.getElementById("userPhone");

    const userAddress =
        document.getElementById("userAddress");

    const userCity =
        document.getElementById("userCity");

    const userPincode =
        document.getElementById("userPincode");

    // =====================================================
    // LOAD PROFILE FROM SUPABASE
    // =====================================================

    let profile = null;

    const {
        data: profileData,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

    if (profileError) {
        console.error(
            "Profile loading error:",
            profileError
        );
    } else {
        profile = profileData;
    }

    // =====================================================
    // CREATE PROFILE IF MISSING
    // =====================================================

    if (!profile) {

        const metadata =
            authUser.user_metadata || {};

        const newProfile = {
            id: authUser.id,

            name:
                metadata.name ||
                metadata.full_name ||
                authUser.email?.split("@")[0] ||
                "User",

            email:
                authUser.email || "",

            phone:
                metadata.phone || "",

            address:
                metadata.address || "",

            city:
                metadata.city || "",

            pincode:
                metadata.pincode || ""
        };

        const {
            data: createdProfile,
            error: createError
        } =
            await supabaseClient
                .from("profiles")
                .insert([newProfile])
                .select()
                .single();

        if (createError) {

            console.error(
                "Profile creation error:",
                createError
            );

        } else {

            profile =
                createdProfile;

        }
    }

    // =====================================================
    // FALLBACK PROFILE
    // =====================================================

    profile = profile || {

        id: authUser.id,

        name:
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            "User",

        email:
            authUser.email || "",

        phone: "",
        address: "",
        city: "",
        pincode: ""
    };

    // =====================================================
    // DISPLAY USER
    // =====================================================

    function displayUser() {

        const name =
            profile.name ||
            "User";

        if (accountName) {
            accountName.textContent =
                name;
        }

        if (accountAvatar) {
            accountAvatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }

        if (userName) {
            userName.textContent =
                profile.name || "-";
        }

        if (userEmail) {
            userEmail.textContent =
                profile.email ||
                authUser.email ||
                "-";
        }

        if (userPhone) {
            userPhone.textContent =
                profile.phone ||
                "Not added";
        }

        if (userAddress) {
            userAddress.textContent =
                profile.address ||
                "Not added";
        }

        if (userCity) {
            userCity.textContent =
                profile.city ||
                "Not added";
        }

        if (userPincode) {
            userPincode.textContent =
                profile.pincode ||
                "Not added";
        }
    }

    // =====================================================
    // LOAD PROFILE FORM
    // =====================================================

    function loadProfileForm() {

        if (profileName) {
            profileName.value =
                profile.name || "";
        }

        if (profilePhone) {
            profilePhone.value =
                profile.phone || "";
        }

        if (profileAddress) {
            profileAddress.value =
                profile.address || "";
        }

        if (profileCity) {
            profileCity.value =
                profile.city || "";
        }

        if (profilePincode) {
            profilePincode.value =
                profile.pincode || "";
        }
    }

    // =====================================================
    // EDIT PROFILE
    // =====================================================

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            function () {

                loadProfileForm();

                if (profileView) {
                    profileView.style.display =
                        "none";
                }

                if (profileForm) {
                    profileForm.style.display =
                        "block";
                }

                editProfileBtn.style.display =
                    "none";
            }
        );
    }

    // =====================================================
    // CANCEL PROFILE
    // =====================================================

    if (cancelProfileBtn) {

        cancelProfileBtn.addEventListener(
            "click",
            function () {

                if (profileForm) {
                    profileForm.style.display =
                        "none";
                }

                if (profileView) {
                    profileView.style.display =
                        "";
                }

                if (editProfileBtn) {
                    editProfileBtn.style.display =
                        "";
                }
            }
        );
    }

    // =====================================================
    // SAVE PROFILE TO SUPABASE
    // =====================================================

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const name =
                    profileName?.value.trim() || "";

                const phone =
                    profilePhone?.value.trim() || "";

                const address =
                    profileAddress?.value.trim() || "";

                const city =
                    profileCity?.value.trim() || "";

                const pincode =
                    profilePincode?.value.trim() || "";

                if (!name) {

                    alert(
                        "Please enter your full name."
                    );

                    profileName?.focus();

                    return;
                }

                if (
                    phone &&
                    !/^[0-9]{10}$/.test(phone)
                ) {

                    alert(
                        "Please enter a valid 10-digit phone number."
                    );

                    profilePhone?.focus();

                    return;
                }

                if (
                    pincode &&
                    !/^[0-9]{6}$/.test(pincode)
                ) {

                    alert(
                        "Please enter a valid 6-digit PIN code."
                    );

                    profilePincode?.focus();

                    return;
                }

                const saveButton =
                    profileForm.querySelector(
                        'button[type="submit"]'
                    );

                if (saveButton) {
                    saveButton.disabled = true;
                    saveButton.textContent =
                        "SAVING...";
                }

                try {

                    const updatedProfile = {

                        id:
                            authUser.id,

                        name:
                            name,

                        email:
                            authUser.email ||
                            profile.email ||
                            "",

                        phone:
                            phone,

                        address:
                            address,

                        city:
                            city,

                        pincode:
                            pincode
                    };

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .from("profiles")
                            .upsert(
                                updatedProfile,
                                {
                                    onConflict: "id"
                                }
                            )
                            .select()
                            .single();

                    if (error) {
                        throw error;
                    }

                    profile =
                        data;

                    displayUser();

                    if (profileForm) {
                        profileForm.style.display =
                            "none";
                    }

                    if (profileView) {
                        profileView.style.display =
                            "";
                    }

                    if (editProfileBtn) {
                        editProfileBtn.style.display =
                            "";
                    }

                    alert(
                        "Profile updated successfully."
                    );

                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );

                    alert(
                        error.message ||
                        "Unable to update profile."
                    );

                } finally {

                    if (saveButton) {

                        saveButton.disabled =
                            false;

                        saveButton.textContent =
                            "SAVE CHANGES";
                    }
                }
            }
        );
    }

    // =====================================================
    // ORDERS
    // =====================================================

    let userOrders = [];

    async function loadOrders() {

        if (!orderHistory) {
            return;
        }

        orderHistory.innerHTML = `
            <div class="admin-empty">
                Loading your orders...
            </div>
        `;

        try {

            /*
             * IMPORTANT:
             * orders table does NOT contain user_id.
             *
             * Therefore we identify the customer's orders
             * using customer_email.
             */

            const email =
                authUser.email ||
                profile.email ||
                "";

            if (!email) {

                userOrders = [];

                renderOrders();

                return;
            }

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("orders")
                    .select("*")
                    .eq(
                        "customer_email",
                        email
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );

            if (error) {
                throw error;
            }

            userOrders =
                Array.isArray(data)
                    ? data
                    : [];

            renderOrders();

        } catch (error) {

            console.error(
                "Orders loading error:",
                error
            );

            orderHistory.innerHTML = `
                <div class="admin-empty">
                    <h3>Unable to load orders</h3>
                    <p>
                        Please refresh the page and try again.
                    </p>
                </div>
            `;
        }
    }

    // =====================================================
    // FORMAT PRICE
    // =====================================================

    function formatPrice(value) {

        const number =
            Number(value) || 0;

        return (
            "₹" +
            number.toLocaleString(
                "en-IN"
            )
        );
    }

    // =====================================================
    // FORMAT DATE
    // =====================================================

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

    // =====================================================
    // GET ORDER ITEMS
    // =====================================================

    function getOrderItems(order) {

        let items =
            order.items;

        if (typeof items === "string") {

            try {
                items =
                    JSON.parse(items);
            } catch {
                items = [];
            }
        }

        return Array.isArray(items)
            ? items
            : [];
    }

    // =====================================================
    // ESCAPE HTML
    // =====================================================

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

    // =====================================================
    // STATUS CLASS
    // =====================================================

    function statusClass(status) {

        return String(
            status || "Confirmed"
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );
    }

    // =====================================================
    // CREATE ORDER CARD
    // =====================================================

    function createOrderCard(order) {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "order-card";

        const items =
            getOrderItems(order);

        const status =
            order.status ||
            "Confirmed";

        const orderId =
            order.id ||
            "N/A";

        let itemsHTML =
            "";

        if (items.length) {

            itemsHTML =
                items
                    .map(
                        function (item) {

                            const quantity =
                                Math.max(
                                    1,
                                    Number(
                                        item.quantity
                                    ) || 1
                                );

                            const price =
                                Number(
                                    item.price
                                ) || 0;

                            const image =
                                item.image ||
                                "product1.jpg";

                            return `
                                <div class="order-product">

                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(
                                            item.name ||
                                            "Product"
                                        )}"
                                    >

                                    <div class="order-product-info">

                                        <strong>
                                            ${escapeHTML(
                                                item.name ||
                                                "Product"
                                            )}
                                        </strong>

                                        <span>
                                            Qty: ${quantity}
                                        </span>

                                        ${
                                            item.size
                                                ? `
                                                    <span>
                                                        Size:
                                                        ${escapeHTML(
                                                            item.size
                                                        )}
                                                    </span>
                                                `
                                                : ""
                                        }

                                        <span>
                                            ${formatPrice(
                                                price
                                            )}
                                        </span>

                                    </div>

                                </div>
                            `;
                        }
                    )
                    .join("");

        } else {

            itemsHTML = `
                <p>
                    No product details available.
                </p>
            `;
        }

        card.innerHTML = `

            <div class="order-card-header">

                <div>

                    <span class="order-label">
                        ORDER
                    </span>

                    <h3>
                        #${escapeHTML(orderId)}
                    </h3>

                    <p>
                        ${formatDate(
                            order.created_at
                        )}
                    </p>

                </div>

                <span
                    class="order-status ${statusClass(status)}"
                >
                    ${escapeHTML(status)}
                </span>

            </div>

            <div class="order-products">

                ${itemsHTML}

            </div>

            <div class="order-card-footer">

                <div>

                    <span>
                        TOTAL
                    </span>

                    <strong>
                        ${formatPrice(
                            order.total
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        SHIP TO
                    </span>

                    <strong>
                        ${escapeHTML(
                            order.shipping_address ||
                            "-"
                        )}
                    </strong>

                </div>

            </div>

        `;

        return card;
    }

    // =====================================================
    // RENDER ORDERS
    // =====================================================

    function renderOrders() {

        if (!orderHistory) {
            return;
        }

        const search =
            orderSearch
                ? orderSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const filter =
            orderFilter
                ? orderFilter.value
                : "all";

        const filtered =
            userOrders.filter(
                function (order) {

                    const status =
                        order.status ||
                        "Confirmed";

                    const items =
                        getOrderItems(order);

                    const orderId =
                        String(
                            order.id || ""
                        ).toLowerCase();

                    const productsText =
                        items
                            .map(
                                item =>
                                    String(
                                        item.name ||
                                        ""
                                    ).toLowerCase()
                            )
                            .join(" ");

                    const matchesSearch =
                        !search ||
                        orderId.includes(search) ||
                        productsText.includes(search);

                    const matchesFilter =
                        filter === "all" ||
                        status === filter;

                    return (
                        matchesSearch &&
                        matchesFilter
                    );
                }
            );

        // =================================================
        // COUNTS
        // =================================================

        if (orderMenuCount) {
            orderMenuCount.textContent =
                userOrders.length;
        }

        if (ordersCountText) {

            ordersCountText.textContent =
                userOrders.length === 1
                    ? "1 Order"
                    : `${userOrders.length} Orders`;
        }

        // =================================================
        // EMPTY
        // =================================================

        if (!filtered.length) {

            orderHistory.innerHTML = `

                <div class="admin-empty">

                    <h3>
                        ${
                            userOrders.length
                                ? "No matching orders"
                                : "No orders yet"
                        }
                    </h3>

                    <p>
                        ${
                            userOrders.length
                                ? "Try another search or filter."
                                : "Your orders will appear here."
                        }
                    </p>

                </div>

            `;

            return;
        }

        // =================================================
        // DISPLAY
        // =================================================

        orderHistory.innerHTML = "";

        filtered.forEach(
            function (order) {

                orderHistory.appendChild(
                    createOrderCard(order)
                );

            }
        );
    }

    // =====================================================
    // SEARCH
    // =====================================================

    if (orderSearch) {

        orderSearch.addEventListener(
            "input",
            renderOrders
        );
    }

    // =====================================================
    // FILTER
    // =====================================================

    if (orderFilter) {

        orderFilter.addEventListener(
            "change",
            renderOrders
        );
    }

    // =====================================================
    // ACCOUNT MENU
    // =====================================================

    const menuItems =
        document.querySelectorAll(
            ".account-menu-item"
        );

    const ordersSection =
        document.getElementById(
            "ordersSection"
        );

    const profileSection =
        document.getElementById(
            "profileSection"
        );

    menuItems.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    menuItems.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                    this.classList.add(
                        "active"
                    );

                    const section =
                        this.dataset.section;

                    if (
                        section === "profile"
                    ) {

                        if (ordersSection) {
                            ordersSection.classList.remove(
                                "active"
                            );
                        }

                        if (profileSection) {
                            profileSection.classList.add(
                                "active"
                            );
                        }

                    } else {

                        if (profileSection) {
                            profileSection.classList.remove(
                                "active"
                            );
                        }

                        if (ordersSection) {
                            ordersSection.classList.add(
                                "active"
                            );
                        }
                    }
                }
            );
        }
    );

    // =====================================================
    // LOGOUT
    // =====================================================

    if (accountLogout) {

        accountLogout.addEventListener(
            "click",
            async function () {

                accountLogout.disabled =
                    true;

                accountLogout.textContent =
                    "LOGGING OUT...";

                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signOut();

                    if (error) {
                        throw error;
                    }

                } catch (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                } finally {

                    localStorage.removeItem(
                        "fashionLoggedIn"
                    );

                    localStorage.removeItem(
                        "fashionUser"
                    );

                    window.location.href =
                        "login.html";
                }
            }
        );
    }

    // =====================================================
    // INITIALIZE
    // =====================================================

    displayUser();

    loadProfileForm();

    await loadOrders();

});