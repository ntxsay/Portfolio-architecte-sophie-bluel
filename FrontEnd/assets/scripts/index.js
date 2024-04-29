const logoutLinkElement = document.getElementById("logoutLink");
const loginLinkElement = document.getElementById("loginLink");

/*
 * Evenement se déclanchant lorsque DOM est entièrement chargé et analysé, 
 * sans attendre le chargement complet des ressources externes telles que les images, 
 * les feuilles de style et les scripts externes.
 */
document.addEventListener('DOMContentLoaded', async function () {
    await GetFiltersFromApiAsync();
    await GetWorksFromApiAsync();

    const token = window.localStorage.getItem("token");
    if (token !== null && token !== ""){
        if (!logoutLinkElement.classList.contains("logged"))
            logoutLinkElement.classList.add("logged");
        if (!loginLinkElement.classList.contains("logged"))
            loginLinkElement.classList.add("logged");

        const filterContainer = document.querySelector("#portfolio .filter-container");
        if (!filterContainer.classList.contains("logged"))
            filterContainer.classList.add("logged");
        
        const openModalButton = document.getElementById("works-open-modal-button");
        if (!openModalButton.classList.contains("isVisible"))
            openModalButton.classList.add("isVisible");
        const modeEditionContainer = document.getElementById("edition-mode-header");
        if (!modeEditionContainer.classList.contains("isVisible"))
            modeEditionContainer.classList.add("isVisible");
    }
});

logoutLinkElement.addEventListener('click', function (){
    window.localStorage.removeItem("token");
    
    if (logoutLinkElement.classList.contains("logged"))
        logoutLinkElement.classList.remove("logged");
    if (loginLinkElement.classList.contains("logged"))
        loginLinkElement.classList.remove("logged");
    
    const openModalButton = document.getElementById("works-open-modal-button");
    if (openModalButton.classList.contains("isVisible"))
        openModalButton.classList.remove("isVisible");

    const modeEditionContainer = document.getElementById("edition-mode-header");
    if (modeEditionContainer.classList.contains("isVisible"))
        modeEditionContainer.classList.remove("isVisible");

    const filterContainer = document.querySelector("#portfolio .filter-container");
    if (filterContainer.classList.contains("logged"))
        filterContainer.classList.remove("logged");

});


/*
 * Evènement capturant les touches du clavier que l'utilisateur appuie.
 *
 * Plutôt que de capturer les événements de clavier à l'intérieur d'un élément spécifique avec 'document',
 * j'utilise 'window' pour capturer des événements de clavier de manière globale, qui ne dépend pas d'un d'un élément
 */
window.addEventListener('keydown', function (e) {

    //Ferme le modal lorsque l'utilisateur appuie sur la touche Echap de son clavier
    if (e.key === "Escape" || e.key === "Esc") {
        CloseCurrentModal(e);
    }
});