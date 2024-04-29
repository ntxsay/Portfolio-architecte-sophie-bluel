//Modale
const modal = document.getElementById("works-Editor-modal");
const modalBackBtn = document.querySelector("#works-Editor-modal .modal-back-button");
const modalCloseBtn = document.querySelector("#works-Editor-modal .modal-close-button");

//Conteneurs de la modales
const modalManagerContainer = document.getElementById("modal-works-manager-container");
const modalNewWorkContainer = document.getElementById("modal-new-work-container");

//Elements de la liste des works
const newWorkButton = document.getElementById("add-photo-btn");

//Elements 
const newWorkForm = modalNewWorkContainer.querySelector("form");
const uploadImageInput = document.getElementById("addPhotoInput");
const newWorkTitleInput = document.getElementById("workProjectName");
const chooseCategorySelect = document.getElementById("workCategoryName");
const submitNewWorkButton = document.getElementById("validate-photo-btn");


/**
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton fermer pour fermer la modale
 */
modalCloseBtn.addEventListener('click', CloseCurrentModal);

/*
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton de retour pour revenir en arrière
 */
modalBackBtn.addEventListener('click', DisplayModalWorkManager);


/*
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton pour ajouter
 * un nouveau work
 */
newWorkButton.addEventListener('click', DisplayNewWorkForm);

/*
 * Evénement se déclenchant lorsque que l'utilisateur clique sur les bordures noires poussant la modale à se fermer
 */
modal.addEventListener('click', function (eventClick) {
    eventClick.preventDefault();

    //Si la cible du click n'est pas la zone extérieure noir ou le lien pour fermer ou l'icon alors on sort de la function
    if (!eventClick.target.classList.contains("modal"))
        return;

    CloseCurrentModal();
});

/**
 * Se produit lorsque que l'élément sélectionné dans le slecteur de catégorie change.
 * Elle a pour but de vérifier si le formulaire est valide et d'afficher une erreur le cas échéant
 */
chooseCategorySelect.addEventListener('change', IsWorkFormValid);

/**
 * Se produit lorsque que le titre du nouveau work change (après perte du focus)
 * Elle a pour but de vérifier si le formulaire est valide et d'afficher une erreur le cas échéant
 */
newWorkTitleInput.addEventListener('change', IsWorkFormValid);

/**
 * Se produit lorsque l'utilateur clique sur le sélecteur de fichier
 * Stoppe la propagation du clic du parent pour permettre au sélecteur de fichier d'afficher sa boite de dialogue
 */
uploadImageInput.parentElement.addEventListener('click', (e) => e.stopPropagation());

/**
 * Se produit lorsque l'utilateur clique sur le sélecteur de fichier
 * Stoppe la propagation du clic du parent pour permettre à ce bouton de lancer la soumission du formulaire
 */
submitNewWorkButton.addEventListener('click', (e) => e.stopPropagation());

/**
 * Se produit lorsque le formulaire est soumis
 */
newWorkForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!IsWorkFormValid())
        return;

    const selectedFile = uploadImageInput.files[0];
    const titleInputValue = newWorkTitleInput.value;
    const selectedCategory = parseInt(chooseCategorySelect.options[chooseCategorySelect.selectedIndex].value);

    const result = await InsertWorkInDataBaseAsync(titleInputValue, selectedCategory, selectedFile);

    //Si l'insertion est un échec alors on affiche l'erreur sans fermer la modale
    if (!result.isSucces) {
        DisplayFormErrorMessage(result.message, false);
        return;
    }

    HideFormErrorMessage();

    //Ferme la modale
    CloseCurrentModal();
});


/**
 * Fonction exécuté lorsque l'utilisateur a sélectionné un fichier dans le sélecteur de fichier
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 */
uploadImageInput.addEventListener('change', async function () {
    const previewImg = document.getElementById("add-photo-preview-img");

    const previewImageContainer = previewImg.parentElement;
    const selectedFiles = uploadImageInput.files;

    previewImg.src = "";
    previewImg.alt = "Prévisualisation de l'image"

    if (selectedFiles.length !== 1) {
        HidePreview();

        //Ecrit et affiche un message d'erreur
        DisplayFormErrorMessage(selectedFiles.length === 0
            ? "Aucun fichier n'a été sélectionné."
            : "Un seul fichier doit être sélectionné.");
        return;
    }

    //Masque le sélecteur de fichier
    const addPhotoContainer = modalNewWorkContainer.querySelector(".works-input-photo-container");
    if (!addPhotoContainer.classList.contains("hidden"))
        addPhotoContainer.classList.add("hidden");

    //Récupère le premier fichier
    const currentFileSelected = selectedFiles[0];

    //Ajoute les données du fichier à l'image
    previewImg.src = URL.createObjectURL(currentFileSelected);
    previewImg.alt = previewImg.title = currentFileSelected.name;

    //Affiche l'image si elle ne l'était pas
    if (previewImageContainer.classList.contains("hidden"))
        previewImageContainer.classList.remove("hidden");

    IsWorkFormValid();
});

/**
 * Ferme la modale actuelle
 */
function CloseCurrentModal() {

    //Ajoute la classe qui permet de fermer la modale
    if (!modal.classList.contains("closed"))
        modal.classList.add("closed");

    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("aria-modal", "false");

    HidePreview();

    //réinitialise le formulaire
    newWorkForm.reset();
}

/**
 * Retourne une valeur booléenne indiquant si si le formulaire est valide
 * @returns {boolean}
 */
function IsWorkFormValid() {

    const selectedFiles = uploadImageInput.files;
    if (selectedFiles.length !== 1) {
        DisplayFormErrorMessage(selectedFiles.length === 0
            ? "Aucun fichier n'a été sélectionné."
            : "Un seul fichier doit être sélectionné.");
        return false;
    }

    const titleInputValue = newWorkTitleInput.value;
    // Expression régulière pour vérifier si le texte est depuis le début de la ligne contient 0 fois ou plus des espaces blancs jusqu'à la fin de la ligne
    const regex = /^\s*$/;

    // Test du texte avec l'expression régulière
    if (titleInputValue === null || regex.test(titleInputValue)) {
        DisplayFormErrorMessage("Le titre du work ne peut pas être null, vide ou ne contenir que des espaces blancs.");
        return false;
    }

    //Si l'option par défaut est sélectionné
    if (chooseCategorySelect.selectedIndex <= 0) {
        DisplayFormErrorMessage("Vous devez sélectionner une catégorie.");
        return false;
    }

    HideFormErrorMessage();

    return true;
}

/**
 * Affiche le conteneur de la liste des works et masque le conteneur de création de work
 */
function DisplayModalWorkManager() {
    //Masque le bouton de retour
    if (modalBackBtn.classList.contains("can-back-true"))
        modalBackBtn.classList.remove("can-back-true");

    //Masque le conteneur du formulaire de création de work
    if (modalNewWorkContainer.classList.contains("selected"))
        modalNewWorkContainer.classList.remove("selected");

    //Affiche le conteneur de la liste des works
    if (!modalManagerContainer.classList.contains("selected"))
        modalManagerContainer.classList.add("selected");

    //Réinitialise la form
    newWorkForm.reset();
    HideFormErrorMessage(true);
    HidePreview();
}

/**
 * Affiche le conteneur de création de work et masque le conteneur de la liste des works
 */
function DisplayNewWorkForm() {
    //Affiche le bouton d retour sur la modale
    if (!modalBackBtn.classList.contains("can-back-true"))
        modalBackBtn.classList.add("can-back-true");

    //Masque la liste de works
    if (modalManagerContainer.classList.contains("selected"))
        modalManagerContainer.classList.remove("selected");

    //Affiche le formulaire de création de work
    if (!modalNewWorkContainer.classList.contains("selected"))
        modalNewWorkContainer.classList.add("selected");

    if (!newWorkButton.classList.contains("disabled"))
        newWorkButton.classList.add("disabled");
}

/**
 * Masque l'image de prévisualisation
 */
function HidePreview() {
    const previewImg = document.getElementById("add-photo-preview-img");
    const previewImageContainer = previewImg.parentElement;

    //Masque le sélecteur de fichier
    const addPhotoContainer = modalNewWorkContainer.querySelector(".works-input-photo-container");
    if (addPhotoContainer.classList.contains("hidden"))
        addPhotoContainer.classList.remove("hidden");

    //Ajoute les données du fichier à l'image
    previewImg.src = "";
    previewImg.alt = "Prévisualisation de l'image"

    //Affiche l'image si elle ne l'était pas
    if (!previewImageContainer.classList.contains("hidden"))
        previewImageContainer.classList.add("hidden");
}

/**
 * Affiche un message d'erreur
 * @param {string} message
 * @param {boolean} disableSubmitButton Si true désactive le bouton (style)
 */
function DisplayFormErrorMessage(message, disableSubmitButton = true) {
    const spanError = modalNewWorkContainer.querySelector(".error-msg");
    spanError.textContent = message;

    if (!spanError.classList.contains("isVisible"))
        spanError.classList.add("isVisible");

    if (!disableSubmitButton)
        return;

    submitNewWorkButton.disabled = true;
    if (!submitNewWorkButton.classList.contains("disabled"))
        submitNewWorkButton.classList.add("disabled");
}

/**
 * Masque le message d'erreur
 * @param {boolean} disableSubmitButton
 */
function HideFormErrorMessage(disableSubmitButton = false) {
    const spanError = modalNewWorkContainer.querySelector(".error-msg");
    spanError.textContent = "";
    if (spanError.classList.contains("isVisible"))
        spanError.classList.remove("isVisible");

    if (disableSubmitButton) {
        submitNewWorkButton.disabled = true;

        if (!submitNewWorkButton.classList.contains("disabled"))
            submitNewWorkButton.classList.add("disabled");
    } else {
        submitNewWorkButton.disabled = false;

        if (submitNewWorkButton.classList.contains("disabled"))
            submitNewWorkButton.classList.remove("disabled");
    }
}