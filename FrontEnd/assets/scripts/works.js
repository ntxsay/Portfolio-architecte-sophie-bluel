/**
 * Met à jour la liste les works dans le stockage local
 * @param {Array} works
 */
async function UpdateWorks(works) {

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

        const imageBase64 = await ConvertImageToBase64(work.imageUrl);
        const localStorageImgBase64 = GetWorkBase64ImageLocalStorageName(work.id);
        
        window.localStorage.setItem(localStorageImgBase64, imageBase64.toString());
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

        // Retourne le nom du localStorage contenant l'image en base64
        const localStorageImgBase64 = GetWorkBase64ImageLocalStorageName(work.id);


        //Retourne une variable de type string contenant la base64 du work si elle existe
        const localStorageImageBase64Work = window.localStorage.getItem(localStorageImgBase64);

        //Sinon on écrit un message d'erreur et on sort de la function
        if (localStorageImageBase64Work === null || localStorageImageBase64Work === "{}") {
            imageHtmlElement.src = work.imageUrl;
        } else {
            imageHtmlElement.src = localStorageImageBase64Work;
        }
        
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

/**
 *
 * @param {string} imageUrl
 */
async function ConvertImageToBase64(imageUrl){
    // Lance une requête Get sur l'Url de l'image
    return new Promise(async(resolve, reject) => {
        await fetch(imageUrl)
            // Retourne le blob de l'image
            .then((res) => res.blob())
            .then((blob) => {
                // instancie une variable constante FileReader pour lire le contenu de l'image
                const reader = new FileReader();
                
                // évenement se déclenchant lorsque la lecture a réussi
                reader.onload = () => {
                    console.log(reader.result);
                    resolve(reader.result.toString());
                };

                //évenement se déclenchant lorsque la lecture a échoué
                reader.onerror = (error) => {
                    console.error(error);
                    reject(error);
                };
                
                // Lit le contenu du blob de l'image
                reader.readAsDataURL(blob);
            });
    });
    
}

/**
 * Retourne le nom du local storage associé à l'id du work pour obtenir l'image au format base64
 * @param {number} id
 * @returns {string}
 */
function GetWorkBase64ImageLocalStorageName(id){
    return `${worksLocalStorageName}_Base64_${id}`;
}