const modal = document.getElementById("works-Editor-modal");
const modalBackBtn = document.querySelector("#works-Editor-modal .modal-back-button");
const modalCloseBtn = document.querySelector("#works-Editor-modal .modal-close-button");

const modalManagerContainer = document.getElementById("modal-works-manager-container");
const modalNewWorkContainer = document.getElementById("modal-new-work-container");

const newWorkButton = document.getElementById("add-photo-btn");

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

chooseCategorySelect.addEventListener('change', IsWorkFormValid);
newWorkTitleInput.addEventListener('change', IsWorkFormValid);

/**
 * Se produit lorsque le formulaire est soumis
 * @param {SubmitEvent} event
 */
newWorkForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!IsWorkFormValid())
        return;

    const selectedFile = uploadImageInput.files[0];
    const titleInputValue = newWorkTitleInput.value;
    const selectCategory = document.querySelector("#workCategoryName");
    const selectedCategory = parseInt(selectCategory.options[selectCategory.selectedIndex].value);
    const fileBlob = await ConvertFileToBlobAsync(selectedFile);

    const result = await InsertWorkInDataBaseAsync(titleInputValue, selectedCategory, fileBlob, selectedFile.name);

    //Si l'insertion est un échec alors on affiche l'erreur sans fermer la modale
    if (!result.isSucces){
        DisplayFormErrorMessage(result.message, false);
        return;
    }

    HideFormErrorMessage();

    //Ferme la modale
    CloseCurrentModal();
});

uploadImageInput.parentElement.addEventListener('click', (e) => e.stopPropagation());
submitNewWorkButton.addEventListener('click', (e) => e.stopPropagation());

/**
 * Fonction exécuté lorsque l'utilisateur a sélectionné un fichier dans le sélecteur de fichier
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 * @param {Event} changeEvent
 * @param {HTMLInputElement} fileInput
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

    //Masque l'erreur
    HideFormErrorMessage();
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

function HidePreview(){
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
 * @param {boolean} disableValidationButtonStyle Si true désactive le bouton (style) 
 */
function DisplayFormErrorMessage(message, disableValidationButtonStyle = true) {
    const spanError = modalNewWorkContainer.querySelector(".error-msg");
    spanError.textContent = message;
    spanError.style.display = "block";
    
    if (!disableValidationButtonStyle)
        return;

    if (!submitNewWorkButton.classList.contains("disabled"))
        submitNewWorkButton.classList.add("disabled");}

/**
 * Masque le message d'erreur
 */
function HideFormErrorMessage(){
    const spanError = modalNewWorkContainer.querySelector(".error-msg");
    spanError.textContent = "";
    spanError.style.display = "none";

    if (submitNewWorkButton.classList.contains("disabled"))
        submitNewWorkButton.classList.remove("disabled");
}

/**
 * Convertit un fichier en blob explicitement
 * @param {File} file
 * @returns {Promise<unknown>}
 */
function ConvertFileToBlobAsync(file) {
    return new Promise((resolve, reject) => {
        
        // Lire le fichier comme un Blob
        const reader = new FileReader();

        reader.onload = (event) => {
            // Le contenu du fichier est dans event.target.result
            const fileBlob = new Blob([event.target.result], { type: file.type });
            resolve(fileBlob);
        };
        
        reader.onerror = (error) => {
            console.error(error)
            reject(error);
        };

        reader.readAsArrayBuffer(file);
    });
}