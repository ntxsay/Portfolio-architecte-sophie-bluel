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
    if (token === null || token === ""){
        logoutLinkElement.style.display = "none";
        loginLinkElement.style.display = "block";
    } else {
        logoutLinkElement.style.display = "block";
        loginLinkElement.style.display = "none";

        const openModalButton = document.getElementById("works-open-modal-button");
        if (!openModalButton.classList.contains("isVisible"))
            openModalButton.classList.add("isVisible");
    }
});

logoutLinkElement.addEventListener('click', function (){
    window.localStorage.removeItem("token");
    logoutLinkElement.style.display = "none";
    loginLinkElement.style.display = "block";
    
    const openModalButton = document.getElementById("works-open-modal-button");
    if (openModalButton.classList.contains("isVisible"))
        openModalButton.classList.remove("isVisible");
})


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