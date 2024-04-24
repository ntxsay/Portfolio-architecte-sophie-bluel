const filterAllIdName = "filter_all";
/**
 * Nom de la clé contenant les catégories dans le LocalStorage
 * @type {string}
 */
const categoriesLocalStorageName = "categories";

/**
 * Obtient ou définit un tableau contenant les catégories
 */
const CategoriesSet = new Set();

/**
 * Récupère toutes les catégories depuis l'API
 */
async function LoadAllCategoriesFromApiAsync() {
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


/**
 * Retourne l'id du filtre dans le DOM correspondant à l'id de catégorie
 * @param {number|null} idCategory Représente l'id de catégorie
 * @returns {string|string}
 */
function GetFilterItemId(idCategory) {
    //Si l'id de catégorie n'est pas spécifié
    const isIdCategoryNotSpecified = idCategory === null || isNaN(idCategory);

    //Nom de l'id du filtre à sélectionner
    return isIdCategoryNotSpecified ? filterAllIdName : "filter_" + idCategory
}

/**
 * Retourne une valeur booléenne indiquant si le filtre qui contient la catégorie spécifiée est sélectionnée
 * @param {number|null} idCategory
 * @param {boolean} allowWhenOnFilterAll Permet de considérer que la catégorie spécifié est sélectionné lorsque le filtre est sur "tous"
 * @returns {boolean}
 */
function IsSelectedCategory(idCategory, allowWhenOnFilterAll) {
    const filterItemLinkId = GetFilterItemId(idCategory);
    
    const filterItemLink = document.getElementById(filterItemLinkId);
    if (!filterItemLink)
        return false;
    
    const filterItemContainer = filterItemLink.parentElement;
    return filterItemContainer.classList.contains("selected") || (filterItemLinkId === filterAllIdName && allowWhenOnFilterAll);
}