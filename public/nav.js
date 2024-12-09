document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const targetPage = button.dataset.page;

            pages.forEach(page => {
                page.classList.add("hidden");
            });

            document.getElementById(`${targetPage}-page`).classList.remove("hidden");
        });
    });
});
