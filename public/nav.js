document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page");

    // Add event listener for each navigation button
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const targetPage = button.dataset.page;

            // Hide all pages
            pages.forEach(page => {
                page.classList.add("hidden");
            });

            // Show the target page
            document.getElementById(`${targetPage}-page`).classList.remove("hidden");
        });
    });
});
