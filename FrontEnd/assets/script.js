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

/*
 * Evenement se déclanchant lorsque DOM est entièrement chargé et analysé, 
 * sans attendre le chargement complet des ressources externes telles que les images, 
 * les feuilles de style et les scripts externes.
 */
document.addEventListener('DOMContentLoaded', async function () {
    await LoadAllCategoriesFromApi();
    await LoadAllWorksFromApi();
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
        .then(works => {
            // On met à jour les works localement et dans la variable globale WorksSet
            UpdateWorks(works);

            // On récupère tous les works pour les afficher dans le dom via la fonction suivante
            LoadWorksToGallery(works);
        })
        .catch(error => {
            // Affiche dans la console l'erreur
            console.error('Erreur lors de la récupération des works:', error);

            LoadOfflineWorks();
        });
}

/*******************Catégories*******************************************/

/**
 * Charge les catégories stcokées localement
 */
function LoadOfflineCategories() {

    //Retourne une variable de type string contenant les catégories au format JSON si elle existe
    const localStorageCategories = window.localStorage.getItem(categoriesLocalStorageName);

    //Sinon on écrit un message d'erreur et on sort de la function
    if (localStorageCategories === null || localStorageCategories === "{}") {
        console.error("impossible de charger les catégories en hors-ligne.");
        window.localStorage.removeItem(categoriesLocalStorageName);
        return;
    }

    //Convertit la chaine en objet json
    const localCategories = JSON.parse(localStorageCategories);

    // On récupère toutes les catégories pour les afficher dans le dom via la fonction suivante
    LoadAllCategoriesToDom(localCategories);
}


/**
 * Ajoute les Catégories à la liste des filtres dans le DOM
 * @param {Array} categories Tableau de Catégories chargé depuis l'API
 */
function LoadAllCategoriesToDom(categories) {

    // Déclare une constante du UL contenant les filtres
    const categoryList = document.querySelector("#portfolio .filter-container ul");

    //Efface les filtres à l'exception du filtre "Tous"
    ClearFilterCategoriesFromDom(categoryList);

    //S'il n'y a aucune catégorie à charger alors on sort de la fonction
    if (categories.length === 0)
        return;

    //Ajoute un élément html pour chaque catégories
    categories.forEach((category) => {

        //Création du noeud LI, le parent
        const liHtmlElement = document.createElement("li");
        liHtmlElement.classList.add("filter-item");

        //définit l'id du filtre
        const aLinkId = "filter_" + category.id.toString();

        // Création du noeud A enfant du noeud LI
        const aLinkHtmlElement = document.createElement("a");
        aLinkHtmlElement.innerText = category.name;
        aLinkHtmlElement.id = aLinkId;
        aLinkHtmlElement.href = "#portfolio";

        //Ajoute l'évenement clic pour afficher les données selon cette catégorie
        aLinkHtmlElement.onclick = () => {
            LoadWorksFromCategoryToGallery(category.id);
        };

        //Ajoute le noeud A  au noeud  LI
        liHtmlElement.appendChild(aLinkHtmlElement);

        //Ajoute le noeud LI au noeud UL
        categoryList.appendChild(liHtmlElement);
    });
}

/**
 * Efface la liste des filtres du DOM
 * @param {Element} ulCategoryList Représente le noeud UL contenant les filtres
 */
function ClearFilterCategoriesFromDom(ulCategoryList) {

    // Crée un tableau d'enfant du UL ne contenant que les LI, 
    // afin d'éviter de modifier directement le UL pendant l'énumeration de ses enfants 
    const childNodeArray = Array.from(ulCategoryList.childNodes).filter(node => node.nodeName === 'LI');

    // Efface les filtres du DOM
    childNodeArray.forEach((childNode) => {
        // si le li n'a pas d'enfant (donc pas de noeud A) alors on supprime le LI
        if (!childNode.hasChildNodes()) {
            ulCategoryList.removeChild(childNode);
            return;
        }

        //Selectionne le premier enfant de type A
        const childrenNode = childNode.querySelector("a");

        //Si l'id du noeud ne correspond à celui du filtre tous alors on le supprime
        if (childrenNode.id !== "filter_all") {
            ulCategoryList.removeChild(childNode);
        }
    });
}

/**
 * Met à jour la liste des catégories dans le stockage local
 * @param {Array} categories
 */
function UpdateCategories(categories) {
    //On efface le contenu précédent du tableau de catégories
    CategoriesSet.clear();

    // S'il n'y a pas de catégories à charger (depuis l'API)
    // Alors on efface les catégories dans le stockage local
    if (categories.length === 0) {
        window.localStorage.removeItem(categoriesLocalStorageName)
        return;
    }

    //On ajoute les nouveau works dans le tableau
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        CategoriesSet.add(category);
    }

    //On enregistre le tableau dans le stockage local au format string json
    window.localStorage.setItem(categoriesLocalStorageName, JSON.stringify(Array.from(CategoriesSet)));
}

/*******************Works*******************************************/

/**
 * Met à jour la liste des catégories dans le stockage local
 * @param {Array} works
 */
function UpdateWorks(works) {

    //On efface le contenu précédent du tableau de works
    WorksSet.clear();

    // S'il n'y a pas de work à charger (depuis l'API)
    // Alors on efface les works dans le stockage local
    if (works.length === 0) {
        window.localStorage.removeItem(worksLocalStorageName)
        return;
    }

    //On ajoute les nouveau works dans le tableau
    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        WorksSet.add(work);
    }

    //On enregistre le tableau dans le stockage local au format string json
    window.localStorage.setItem(worksLocalStorageName, JSON.stringify(Array.from(WorksSet)));
}

/**
 * Charge les works stockées localement
 */
function LoadOfflineWorks() {

    //Retourne une variable de type string contenant les works au format JSON si elle existe
    const localStorageWorks = window.localStorage.getItem(worksLocalStorageName);

    //Sinon on écrit un message d'erreur et on sort de la function
    if (localStorageWorks === null || localStorageWorks === "{}") {
        console.error("impossible de charger les works en hors-ligne.");
        return;
    }

    //Convertit la chaine en objet json
    const localWorks = JSON.parse(localStorageWorks);

    // On récupère toutes les catégories pour les afficher dans le dom via la fonction suivante
    LoadWorksToGallery(localWorks);
}


/**
 * Ajoute tous les works à la galerie dans le DOM
 * @param works
 */
function LoadWorksToGallery(works) {

    // Déclare une constante du div ayant la classe "gallery" depuis son parent.
    const gallery = document.querySelector("#portfolio .gallery");

    // Efface le contenu de la galerie
    gallery.innerHTML = "";

    //S'il n'y a aucun works à charger alors on sort de la fonction
    if (works.length === 0)
        return;

    //Ajoute un élément html pour chaque work
    works.forEach((work) => {
        //Création du noeud figure, le parent
        const figureHtmlElement = document.createElement("figure");

        // Création du noeud Img premier enfant
        const imageHtmlElement = document.createElement("img");
        imageHtmlElement.alt = work.title;
        imageHtmlElement.src = work.imageUrl;

        //Ajoute l'image à la figure
        figureHtmlElement.appendChild(imageHtmlElement);

        // Création du noeud figCaption deuxième enfant
        const captionHtmlElement = document.createElement("figcaption");
        captionHtmlElement.innerText = work.title;

        //Ajoute le caption à la figure
        figureHtmlElement.appendChild(captionHtmlElement);

        //Ajoute la balise à gallery
        gallery.appendChild(figureHtmlElement);
    });
}

/**
 * Affiche dans le DOM tous works dont l'id de catégorie correspond à l'id de catégorie en paramètre
 * @param {number} idCategory
 */
function LoadWorksFromCategoryToGallery(idCategory) {

    //Nom de l'id du filtre à sélectionner
    const filterItemIdToSelect = idCategory <= 0 ? "filter_all" : "filter_" + idCategory;

    //Récupère tous les filtre
    const allFilterItems = document.querySelectorAll("#portfolio li.filter-item");

    //Lance une boucle pour désélectionner tous les item dont l'id ne correspond pas à celui déclaré ci-dessus 
    for (let i = 0; i < allFilterItems.length; i++) {
        const filterItem = allFilterItems[i];
        if (filterItem.firstElementChild.id !== filterItemIdToSelect && filterItem.classList.contains("selected")) {
            filterItem.classList.remove("selected");
        }
    }

    //Retourne le filtre à sélectionner
    const filterToSelect = document.getElementById(filterItemIdToSelect).parentElement;

    //S'il n'a pas la classe "selected" alors on l'ajoute
    if (!filterToSelect.classList.contains("selected"))
        filterToSelect.classList.add("selected");

    //Retourne les works qui ont l'id de catégorie spécifié
    const worksInCategory = idCategory <= 0 ? WorksSet : Array.from(WorksSet).filter(work => work.categoryId === idCategory);

    //Charge les works dans la galerie
    LoadWorksToGallery(worksInCategory);
}