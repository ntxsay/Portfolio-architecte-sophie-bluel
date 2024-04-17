const categoriesLocalStorageName = "categories";
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

/**
 * Obtient ou définit la modale actuellement ouvert
 */
let currentOpenedModal;

const openModal = function (eventClick) {
    eventClick.preventDefault();

    LoadWorksToWorksModal(Array.from(WorksSet));
    
    const aElement =  (eventClick.target.nodeName !== "A")
        ? eventClick.target.parentElement
        : eventClick.target;
    
    const target = document.querySelector(aElement.getAttribute("href"));
    if (target.classList.contains("closed"))
        target.classList.remove("closed");
    
    target.setAttribute("aria-hidden", "false");
    target.setAttribute("aria-modal", "true");
    
    //Définit la modale actuellement ouverte
    currentOpenedModal = target;
    currentOpenedModal.addEventListener('click', closeModal);
};

const closeModal = function (eventClick) {
    eventClick.preventDefault();

if (currentOpenedModal === null)
    return;

//Si la cible du click n'est pas la zone extérieure noir ou le lien pour fermer ou l'icon alors on sort de la function
if (!eventClick.target.classList.contains("modal") && !eventClick.target.classList.contains("modal-close-link") && 
    !eventClick.target.classList.contains("modal-close-icon"))
    return;

    if (!currentOpenedModal.classList.contains("closed"))
        currentOpenedModal.classList.add("closed");

    currentOpenedModal.setAttribute("aria-hidden", "true");
    currentOpenedModal.setAttribute("aria-modal", "false");
    
    //Efface la modale actuellement ouverte
    currentOpenedModal = null;
};

/*
 * Evenement se déclanchant lorsque DOM est entièrement chargé et analysé, 
 * sans attendre le chargement complet des ressources externes telles que les images, 
 * les feuilles de style et les scripts externes.
 */
document.addEventListener('DOMContentLoaded', async function () {
    LoadLoginUi();

    await LoadAllCategoriesFromApi();
    await LoadAllWorksFromApi();

    document.querySelectorAll(".a-modal").forEach(element => {
        element.addEventListener('click', openModal);
    });
});


loginLinkElement.addEventListener('click', function() {

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



function LoadLoginUi(){
    const tokenValue = window.localStorage.getItem("token");
    if (tokenValue === null || tokenValue === "") {
        loginLinkElement.innerText = "login";
        CreateOrRemoveWorksEditorUi(true);
    } else {
        loginLinkElement.innerText = "logout";
        CreateOrRemoveWorksEditorUi(false);
    }
}


