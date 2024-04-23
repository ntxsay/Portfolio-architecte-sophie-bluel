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
        WorksSet.add(works[i]);
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
 * Ajoute tous les works à la galerie dans le DOM
 * @param {Array} works
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
 * Ajoute tous les works à la galerie du modal dans le DOM
 * @param {Array} works
 */
function LoadWorksToWorksModal(works) {

    // Déclare une constante du div ayant la classe "gallery" depuis son parent.
    const gallery = document.querySelector("#works-manager-list-container");

    // Efface le contenu de la galerie
    gallery.innerHTML = "";

    //S'il n'y a aucun works à charger alors on sort de la fonction
    if (works.length === 0)
        return;

    //Ajoute un élément html pour chaque work
    works.forEach((work) => {
        //Création du noeud figure, le parent
        const figureHtmlElement = document.createElement("figure");
        figureHtmlElement.classList.add("work-item");
        
        // Création du noeud Img premier enfant
        const imageHtmlElement = document.createElement("img");
        imageHtmlElement.alt = work.title;
        imageHtmlElement.src = work.imageUrl;

        //Ajoute l'image à la figure
        figureHtmlElement.appendChild(imageHtmlElement);
        
        //Ajoute le lien 
        const aDeleteLink = document.createElement("a");
        aDeleteLink.href = "#";
        aDeleteLink.onclick = async () => {
            await DeleteWorkByIdAsync(work.id);
        }
        figureHtmlElement.appendChild(aDeleteLink);
        
        //Ajoute l'icone de la corbeille
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash-can");
        aDeleteLink.appendChild(deleteIcon);
        

        //Ajoute la balise à gallery
        gallery.appendChild(figureHtmlElement);
    });
}

/**
 * Insère un nouveau work dans la base de données
 * @param {string} title
 * @param {number} categoryId
 * @param file
 * @param filename
 * @returns {Promise<void>}
 */
async function InsertWorkAsync(title, categoryId, file, filename) {
    const token = window.localStorage.getItem("token");
    if (token === null || token === "")
    {
        console.error("Impossible de restituer le token de l'utilisateur, connectez-vous !");
        window.location.href = "login.html";
        return;
    }

    // Créer un objet FormData
    const formData = new FormData();

    // Ajouter les champs du formulaire
    formData.append('title', title);
    formData.append('category', categoryId);
    formData.append('image', file, filename);

// Générer une limite pour multipart/form-data
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);

// Créer l'en-tête Content-Type avec la limite
    const contentTypeHeader = 'multipart/form-data; boundary=' + boundary;
    
    // Configuration de la requête
    const requestOptions = {
        method: 'POST',
        headers: {
            // Indique que le corps de la requête est en JSON
            'Content-Type': contentTypeHeader,
            // On ajoute le token
            'Authorization': `Bearer ${token}`
        },

        // Convertit l'objet newWorkData en Json (au format texte)
        body: formData
    };

    try {
        const submitResponse = await fetch("http://localhost:5678/api/works", requestOptions);
        if (!submitResponse.ok){
            console.error(submitResponse.statusText);
            return;
        }
        
        console.log(submitResponse);
        
    } catch (error) {
        console.error(error);
        return;
    }
}

/**
 * Supprime un work par son Identifiant
 * @param {number} workId
 */
async function DeleteWorkByIdAsync(workId){
    let workToDelete = null;
    for (let work of WorksSet) {
        if (work.id === workId)
        {
            workToDelete = work;
            break;
        }
    }

    if (workToDelete === null)
    {
        console.error("Le work à supprimer n'existe pas.");
        return;
    }
    
    const token = window.localStorage.getItem("token");
    if (token === null || token === "")
    {
        console.error("Impossible de restituer le token de l'utilisateur, connectez-vous !");
        window.location.href = "login.html";
        return;
    }

    // Création des options de la requête
    const requestOptions = {
        method: 'DELETE',
        headers: {
            // Indique que le corps de la requête est en JSON
            'Content-Type': 'application/json',
            // On ajoute le token
            'Authorization': `Bearer ${token}` 
        }
    };

    try {
        // Récupère la réponse de la requette DELETE décrite dans les options de la réponse ci-dessus
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, requestOptions);
        
        // S'il y a un problème avec la requête alors l
        if (!response.ok) {
            ManageBadRequestStatusCodeOnDeleteWork(response.status);
            console.error('Une erreur est survenue lors de la suppression de la ressource : ', response.statusText);
            return;
        }
    } catch (error) {
        console.error('Une erreur est survenue lors de la suppression de la ressource :', error);
        return;
    }

    // Suppression réussie
    console.log('La ressource a été supprimée avec succès');

    WorksSet.delete(workToDelete);
    console.log(WorksSet.has(workToDelete));

    const updatedWorks = Array.from(WorksSet);

    LoadWorksToGallery(updatedWorks);
    LoadWorksToWorksModal(updatedWorks);
}

/**
 * Gère l'action du DOM en cas d'erreur de la requête via le code du status
 * @param {number} statusCode
 */
function ManageBadRequestStatusCodeOnDeleteWork(statusCode){
    switch (statusCode) {
        // SI l'utilisateur n'est pas autoriser à accéder à cette ressource alors on force l'utilisateur à se connecter
        case 401 : {
            window.localStorage.removeItem("token");
            window.location.href = "login.html";
            break;
        }
    }
}


/**
 * Ajoute ou suprime le lien pour afficher la modale d'édition des Works
 * @param {boolean} removeAuthorizedContent Indique si le contenu autorisé tel que le lien qui permet de modifier les works doit être supprimés du DOM
 */
function CreateOrRemoveWorksEditorUiLink(removeAuthorizedContent){
    const titleContainerElement = document.querySelector("#portfolio .title-container");
    let worksEditorLinkElement = document.querySelector("#portfolio a.works-editor-link");
    
    // Si lien de modification doit être supprimé
    if (removeAuthorizedContent) {
        // Si worksEditorLinkElement n'existe pas et que de toute façon allait être supprimé alors on sort de la fonction
        if (!worksEditorLinkElement)
            return;

        // supprime le lien de modification des works du DOM
        titleContainerElement.removeChild(worksEditorLinkElement);
        
        return;
    }
    
    // création de l'élément a
    worksEditorLinkElement = document.createElement("a");
    
    //Ancre représentant le modal à ouvrir
    worksEditorLinkElement.href = "#works-Editor-modal";
    worksEditorLinkElement.id = "works-editor-link";
    
    //Ajoute la classe qui indique que ce lien pointe vers un modal
    worksEditorLinkElement.classList.add("a-modal");

    // Création de l'élément i;
    const iconElement = document.createElement("i");
    iconElement.classList.add("fa-solid", "fa-pen-to-square");

    //Ajoute l'icone dans son parent
    worksEditorLinkElement.appendChild(iconElement);

    //Création du SPan contenant le texte
    const textSpanElement = document.createElement("span");
    textSpanElement.innerText = "modifier";

    //ajoute le texte dans son parent
    worksEditorLinkElement.appendChild(textSpanElement);
    
    //Ajout du lien dans le parent
    titleContainerElement.appendChild(worksEditorLinkElement);
}