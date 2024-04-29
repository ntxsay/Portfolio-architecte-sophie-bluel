const editWorkButton = document.getElementById("works-open-modal-button");

/*
 * Se produit lorsque l'utilisateur clique sur le bouton pour modifier les works
 */
editWorkButton.addEventListener('click', async function (eventClick) {
    eventClick.preventDefault();

    //Récupère les works optimisés pour la modale
    await GetWorksFromApiAsync(0, true);

    //affiche la liste des 

    if (modal.classList.contains("closed"))
        modal.classList.remove("closed");

    modal.setAttribute("aria-hidden", "false");
    modal.setAttribute("aria-modal", "true");

    DisplayModalWorkManager();
});

/**
 * Récupère tous les works depuis l'API
 * @param {number} categoryId représente L'id de catégorie. Si l'id de catégorie est inférieur ou égal à 0 alors on récupère tous les works sinon uniquement ceux de la catégorie spécifiée
 * @param isForModal
 */
async function GetWorksFromApiAsync(categoryId = 0, isForModal = false) {
    try {

        //Lance la requête afin de récupérer les works depuis l'api
        const response = await fetch('http://localhost:5678/api/works');

        //Convertit la réponse en Json
        const works = await response.json();

        //Filtre les works en fonction de l'id de catégorie
        const filteredWorks = categoryId <= 0
            ? works
            : works.filter((work) => work.categoryId === Number(categoryId));

        // Récupère le conteneur des works
        const gallery = isForModal
            ? document.querySelector("#modal-works-manager-container .works-list")
            : document.querySelector("#portfolio .gallery");

        // Efface le contenu de la galerie
        gallery.innerHTML = "";

        //S'il n'y a aucun works à charger alors on sort de la fonction
        if (filteredWorks.length === 0)
            return;

        //Ajoute chaque work à la galerie
        filteredWorks.forEach((work) => {
            const figure = CreateWork(work, isForModal);
            gallery.appendChild(figure);
        });
    } catch (e) {
        // Affiche un message d'erreur si la récupération des works échoue.
        console.error(e);
    }
}


/**
 * Crée un work
 * @param {Object} work
 * @param isForModal
 * @returns {HTMLElement}
 */
function CreateWork(work, isForModal = false) {
    //Création de la figure
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    // Création de l'image et l'ajoute à son parent
    const image = document.createElement("img");
    image.alt = work.title;
    image.src = work.imageUrl;
    figure.appendChild(image);

    // Création du caption et l'ajoute à son parent s'il ne s'agit pas d'élément pour le modal
    if (!isForModal) {
        const caption = document.createElement("figcaption");
        caption.textContent = work.title;
        figure.appendChild(caption);
    }

    //Ajoute le bouton de suppression s'il s'agit d'un élément du modal
    if (isForModal) {
        const deleteButton = document.createElement("button");
        deleteButton.title = "Supprimer le work : " + work.title;
        deleteButton.onclick = async () => {
            await DeleteWorkByIdAsync(work.id);
        }
        figure.appendChild(deleteButton);

        //Ajoute l'icone de la corbeille
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash-can");
        deleteButton.appendChild(deleteIcon);
    }

    //Retourne la figure
    return figure;
}


/**
 * Insère un nouveau work dans la base de données
 * @param {string} title représente le titre du work
 * @param {number} categoryId représente l'id de la catégorie sélectionnée
 * @param {File} file représente le contenu du fichier
 * @returns {Promise<{isSucces: boolean, message: string}>}
 * @constructor
 */
async function InsertWorkInDataBaseAsync(title, categoryId, file) {
    const token = window.localStorage.getItem("token");

    // Créer un objet FormData
    const formData = new FormData();

    // Ajouter les champs du formulaire
    formData.append('title', title);
    formData.append('category', categoryId);
    formData.append('image', file, file.name);

    // Attention ne pas utiliser de content-type sous peine  
    // de faire échouer la rêquete voir : https://stackoverflow.com/questions/35192841/how-do-i-post-with-multipart-form-data-using-fetch
    const response = await fetch("http://localhost:5678/api/works", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },

        body: formData
    }).catch((error) => {
        console.error(error);
    });

    if (!response.ok) {
        return {
            isSucces: false,
            message: response.statusText
        };
    }

    //Recharge tous les works
    await GetWorksFromApiAsync(0, false);

    // Enlève la classe "selected" de tous les boutons "filter-item" pour les désélectionner.
    document.querySelectorAll(".filter-item").forEach((b) => b.classList.remove("selected"));

    // Ajoute la classe "selected" au bouton Tous pour le sélectionner.
    const buttonAllCategories = Array.from(document.querySelectorAll(".filter-item")).filter(f => f.value === "0");
    if (buttonAllCategories.length > 0)
        buttonAllCategories[0].classList.add("selected");

    return {
        isSucces: true,
        message: "Le work a été inséré avec succès."
    };
}

/**
 * Supprime un work par son Identifiant
 * @param {number} workId
 */
async function DeleteWorkByIdAsync(workId) {
    // On récupère le token de l'utilisateur
    const token = window.localStorage.getItem("token");

    // Récupère la réponse de la requette DELETE décrite dans les options de la réponse ci-dessus
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
        method: 'DELETE',
        headers: {
            // Indique que le corps de la requête est en JSON
            'Content-Type': 'application/json',
            // On ajoute le token
            'Authorization': `Bearer ${token}`
        }
    }).catch((error) => {
        console.error('Une erreur est survenue lors de la suppression de la ressource :', error);
    });

    if (!response.ok) {
        alert('Une erreur est survenue lors de la suppression de la ressource : ' + response.statusText);
        return;
    }

    // Supprime le Work dans la modale
    const modalFigures = document.querySelectorAll("#modal-works-manager-container .works-list figure");
    if (modalFigures.length > 0) {
        const filteredFigures = Array.from(modalFigures).filter((f) => f.dataset.id === workId.toString());
        if (filteredFigures.length > 0) {
            const gallery = document.querySelector("#modal-works-manager-container .works-list");
            gallery.removeChild(filteredFigures[0]);
        }
    }

    // Supprime le Work dans la modale
    const figures = document.querySelectorAll("#portfolio .gallery figure");
    if (figures.length > 0) {
        const filteredFigures = Array.from(figures).filter((f) => f.dataset.id === workId.toString());
        if (filteredFigures.length > 0) {
            const gallery = document.querySelector("#portfolio .gallery");
            gallery.removeChild(filteredFigures[0]);
        }
    }
}
