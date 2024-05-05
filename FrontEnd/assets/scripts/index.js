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
    
    //Si le token de connexion est présent dans le localStorage
    if (token !== null && token !== ""){
        
        // Ajoute la classe "logged" sur le lien de déconnexion qui aura pour effet de l'afficher
        if (!logoutLinkElement.classList.contains("logged"))
            logoutLinkElement.classList.add("logged");
        
        //Ajoute la classe "logged" sur le lien de connexion qui aura pour effet de la masquer
        if (!loginLinkElement.classList.contains("logged"))
            loginLinkElement.classList.add("logged");

        //Ajoute la classe "logged" sur le conteneur des filtre qui au ra pour effet de le masquer (lorsque l'utilisateur est connecté)
        const filterContainer = document.querySelector("#portfolio .filter-container");
        if (!filterContainer.classList.contains("logged"))
            filterContainer.classList.add("logged");
        
        
        //Ajoute la classe "isVisible" pour afficher le bouton qui permet d'afficher la modale d'édition des works
        const openModalButton = document.getElementById("works-open-modal-button");
        if (!openModalButton.classList.contains("isVisible"))
            openModalButton.classList.add("isVisible");
        
        //Ajoute la classe "isVisible" pour afficher la bannière indiquant que l'utilisateur s'est connecté et que le site est en mode édition
        const modeEditionContainer = document.getElementById("edition-mode-header");
        if (!modeEditionContainer.classList.contains("isVisible"))
            modeEditionContainer.classList.add("isVisible");
    }
});

/*
 * Evènement se produit lorque l'utilisateur clique sur le lien logout pour se déconnecter
 */
logoutLinkElement.addEventListener('click', function (){
    
    //Supprime le token de l'utilisateur
    window.localStorage.removeItem("token");

    // Retire la classe "logged" sur le lien de déconnexion qui aura pour effet de le masquer
    if (logoutLinkElement.classList.contains("logged"))
        logoutLinkElement.classList.remove("logged");

    //Retire la classe "logged" sur le lien de connexion qui aura pour effet de l'afficher
    if (loginLinkElement.classList.contains("logged"))
        loginLinkElement.classList.remove("logged");

    //Retire la classe "isVisible" pour masquer le bouton qui permet d'afficher la modale d'édition des works
    const openModalButton = document.getElementById("works-open-modal-button");
    if (openModalButton.classList.contains("isVisible"))
        openModalButton.classList.remove("isVisible");

    //Retire la classe "isVisible" pour masquer la bannière indiquant que l'utilisateur s'est connecté et que le site est en mode édition
    const modeEditionContainer = document.getElementById("edition-mode-header");
    if (modeEditionContainer.classList.contains("isVisible"))
        modeEditionContainer.classList.remove("isVisible");

    //Retire la classe "logged" sur le conteneur des filtre qui aura pour effet de l'afficher (lorsque l'utilisateur est déconnecté)
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