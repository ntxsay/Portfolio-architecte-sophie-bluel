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

/*
 * Evenement se déclanchant lorsque DOM est entièrement chargé et analysé, 
 * sans attendre le chargement complet des ressources externes telles que les images, 
 * les feuilles de style et les scripts externes.
 */
document.addEventListener('DOMContentLoaded', async function () {
    LoadLoginUi();
    
    await LoadAllCategoriesFromApi();
    await LoadAllWorksFromApi();
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



/*******************Fetch*******************************************/

/**
 * Récupère toutes les catégories depuis l'API
 */
async function LoadAllCategoriesFromApi() {
    await fetch('http://localhost:5678/api/categories')
        .then(response => {
            //si le GET n'a pas réussi alors on lève une exception 
            if (!response.ok) {
                throw new Error(response.statusMessage);
            }

            //sinon convertit la réponse au format json et retourne la réponse
            return response.json();
        })
        .then(categories => {

            // On met à jour les catégorie localement et dans la variable globale CategoriesSet
            UpdateCategories(categories);

            // On récupère toutes les catégories pour les afficher dans le dom via la fonction suivante
            LoadAllCategoriesToDom(categories);
        })
        .catch(error => {
            // Affiche dans la console l'erreur
            console.error('Erreur lors de la récupération des catégories:', error);

            //On tente d'afficher localement les catégories
            LoadOfflineCategories();
        });
}

/**
 * Récupère tous les works depuis l'API
 */
async function LoadAllWorksFromApi() {
    await fetch('http://localhost:5678/api/works')
        .then(response => {
            //si le GET n'a pas réussi alors on lève une exception 
            if (!response.ok) {
                throw new Error(response.statusMessage);
            }

            //sinon convertit la réponse au format json et retourne la réponse
            return response.json();
        })
        .then(async (works) =>  {
            // On met à jour les works localement et dans la variable globale WorksSet
            await UpdateWorks(works);

            // On récupère tous les works pour les afficher dans le dom via la fonction suivante
            LoadWorksToGallery(works);
        })
        .catch(error => {
            // Affiche dans la console l'erreur
            console.error('Erreur lors de la récupération des works:', error);

            LoadOfflineWorks();
        });
}

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


