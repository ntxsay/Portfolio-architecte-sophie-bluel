/**
 * Récupère toutes les catégories (filtres) depuis l'API
 * @param {boolean} selectFilterAll Indique à la fonction s'il doit sélectionner le bouton tous lors de la récupération des catégories
 */
async function GetFiltersFromApiAsync(selectFilterAll = true) {
    try {
        //Lance la requête afin de récupérer les catégories (filtres) depuis l'api
        const response = await fetch('http://localhost:5678/api/categories');
        
        //Convertit la réponse au format json
        const categories = await response.json();
        
        //S'il n'y a aucune catégorie à charger alors on sort de la fonction
        if (categories.length === 0)
            return;

        // récupère le conteneur des filtres
        const filterList = document.querySelector("#portfolio .filter-container");

        // Crée un bouton pour la catégorie "Tous" et l'ajoute à l'élément "filterList".
        const filterButtonAll = CreateFilterButton("0", "Tous");
        filterButtonAll.onclick = OnFilterClicked;
        filterList.appendChild(filterButtonAll);
        
        // Sélectionne le filtre "tous" si le paramètre le permet
        if (selectFilterAll)
            SelectFilterButton(filterButtonAll);

        const modalSelect = document.getElementById("workCategoryName");

        //Ajoute la catégorie par défaut dans le select du modal
        const selectCategoryOption = document.createElement("option");
        selectCategoryOption.value = "0";
        selectCategoryOption.text = "Sélectionnez une catégorie";
        selectCategoryOption.hidden = true;
        modalSelect.add(selectCategoryOption, null);
        
        //Ajoute un élément html pour chaque catégories
        categories.forEach((category) => {

            // Crée le bouton correspondant au filtre spécifié
            const filterButton= CreateFilterButton(category.id, category.name);
            filterButton.onclick = OnFilterClicked;

            //Ajoute le bouton au conteneur
            filterList.appendChild(filterButton);
            
            //Ajoute les catégories à l'élément option de la modale
            const categoryOption = document.createElement("option");
            categoryOption.value = category.id.toString();
            categoryOption.text = category.name;
            modalSelect.add(categoryOption, null);
        });
    } catch(e) {
        // Affiche un message d'erreur si la récupération des filtres échoue.
        console.error("Impossible de récupérer les filtres :", e);
    }
}

/**
 * Fonction de l'évènement click du bouton de filtre
 * @param {MouseEvent} e
 */
const OnFilterClicked = async (e) => {
    const button = e.target;
    
    SelectFilterButton(button);
    await GetWorksFromApiAsync(parseInt(button.value));
}

/**
 * Crée un bouton de filtre
 * @param {string} categoryId Id de la catégorie au format string
 * @param {string} categoryName Nom de la catégorie
 * @returns {HTMLButtonElement}
 */
function CreateFilterButton(categoryId, categoryName) {
    // Crée un bouton avec la classe "filter-item", le texte et le nom de la catégorie.
    const button = document.createElement("button");
    button.classList.add("filter-item");
    button.value = categoryId;
    button.textContent = categoryName;
    
    // Retourne le bouton créé.
    return button;
}

/**
 * Sélectionne un bouton de filtre
 * @param button
 */
function SelectFilterButton(button) {
    // Enlève la classe "selected" de tous les boutons "filter-item".
    document.querySelectorAll(".filter-item").forEach((b) => b.classList.remove("selected"));
    
    // Ajoute la classe "selected" au bouton cliqué.
    button.classList.add("selected");
}