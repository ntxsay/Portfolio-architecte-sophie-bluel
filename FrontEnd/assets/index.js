/**
 * Nom de la clé contenant les catégories dans le LocalStorage
 * @type {string}
 */
const categoriesLocalStorageName = "categories";

/**
 * Nom de la clé contenant les works dans le LocalStorage
 * @type {string}
 */
const worksLocalStorageName = "works";

/**
 * Obtient ou définit un tableau contenant les catégories
 */
const CategoriesSet = new Set();

/**
 * Obtient ou définit un tableau de works
 */
const WorksSet = new Set();

const loginLinkElement = document.getElementById("loginLink");
const filterAllLink = document.getElementById("filter_all");

/*
 * Evenement se déclanchant lorsque DOM est entièrement chargé et analysé, 
 * sans attendre le chargement complet des ressources externes telles que les images, 
 * les feuilles de style et les scripts externes.
 */
document.addEventListener('DOMContentLoaded', async function () {
    LoadLoginUi();

    await LoadAllCategoriesFromApi();
    await LoadAllWorksFromApi();

    AddEventClickOnAllModalLink();
});

filterAllLink.addEventListener('click', function (clickEvent) {
    LoadWorksFromCategoryToGallery(null);
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
        closeModal(e);
    }


});


loginLinkElement.addEventListener('click', function () {

    const tokenValue = window.localStorage.getItem("token");
    if (tokenValue === null || tokenValue === "") {
        window.location.href = "login.html";
        SetToAuthenticatedOnDOM();
    } else {
        window.localStorage.removeItem("token");
        window.location.href = "index.html";
        SetToNotAuthenticatedOnDom();
    }
});


/**
 * Charge une partie de l'UI en fonction de l'état de l'authentification
 */
function LoadLoginUi() {
    const tokenValue = window.localStorage.getItem("token");
    const isTokenValid = tokenValue !== null && tokenValue !== "";
    UpdateAuthorizedContentOnDom(isTokenValid);
}

/**
 * Supprime ou remanie des éléments du DOM en fonction de l'état de l'authentification de l'utilisateur
 * @param {boolean} isLogged
 */
function UpdateAuthorizedContentOnDom(isLogged) {
    const removeAuthorizedContent = !isLogged;
    loginLinkElement.innerText = !isLogged
        ? "login"
        : "logout";

    CreateOrRemoveWorksEditorUiLink(removeAuthorizedContent);
}