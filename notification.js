function showNotification(message, type = "success") {

    // Remove existing notification
    const oldNotification =
        document.querySelector(".custom-notification");

    if (oldNotification) {
        oldNotification.remove();
    }

    const notification =
        document.createElement("div");

    notification.className =
        "custom-notification";

    notification.innerHTML = `
        <div class="notification-icon">
            ✓
        </div>

        <div class="notification-content">
            <strong>
                ${type === "error" ? "Something went wrong" : "Added to Cart"}
            </strong>

            <span>
                ${message}
            </span>
        </div>

        <button
            type="button"
            class="notification-close"
            aria-label="Close notification"
        >
            ×
        </button>
    `;

    document.body.appendChild(notification);

    // Close button
    const closeButton =
        notification.querySelector(".notification-close");

    closeButton.addEventListener("click", function () {
        notification.classList.add("notification-hide");

        setTimeout(function () {
            notification.remove();
        }, 250);
    });

    // Show animation
    requestAnimationFrame(function () {
        notification.classList.add("notification-show");
    });

    // Auto remove
    setTimeout(function () {

        if (notification.parentElement) {

            notification.classList.add(
                "notification-hide"
            );

            setTimeout(function () {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 250);

        }

    }, 3500);
}