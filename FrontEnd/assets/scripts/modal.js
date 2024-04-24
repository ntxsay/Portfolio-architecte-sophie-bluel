const oneKbSize = 1024;
const oneMbSize = 1048576;
const fileTypes = [
    "image/jpeg",
    "image/png",
];


const addPhotoModalBtn = document.getElementById("add-photo-btn");
const validatePhotoModalBtn = document.getElementById("validate-photo-btn");
const modalBackBtn = document.querySelector("#works-Editor-modal .modal-back-button");
const modalCloseBtn = document.querySelector("#works-Editor-modal .modal-close-button");

/**
 * Obtient ou définit l'élément HTML qui représente la modale actuellement ouverte
 */
let CurrentOpenedModal;

/**
 * Retourne une valeur booléenne indiquant si l'élément passé en paramètre est une balise A et contient la classe 'a-modal'
 * @param {Element} target
 * @returns {boolean}
 */
const isTargetModalLinkOpener = function (target) {
    return target.nodeName === "A" && target.classList.contains("a-modal");
}

/**
 * Fonction permettant d'ouvrir la modale
 * @param {MouseEvent} eventClick
 */
const openModal = function (eventClick) {
    eventClick.preventDefault();

    let aElement = eventClick.target;

    if (!isTargetModalLinkOpener(aElement)) {

        /* 
         * initialise une variable numérique qui compte le nombre restant d'élément parent à analyser
         * avant d'annuler la boucle si le lien n'a pas été trouvé
         */
        let counter = 10;

        do {
            aElement = aElement.parentElement;
            if (isTargetModalLinkOpener(aElement))
                break;

            counter--;

            // annule la boucle après avoir vérifié les parents
            if (counter <= 0) {
                console.error("Le lien n'a pas été trouvé.");
                return;
            }

        } while (!isTargetModalLinkOpener(aElement));
    }

    CurrentOpenedModal = document.querySelector(aElement.getAttribute("href"));

    AddWorksToModal(Array.from(WorksSet));

    if (CurrentOpenedModal.classList.contains("closed"))
        CurrentOpenedModal.classList.remove("closed");

    CurrentOpenedModal.setAttribute("aria-hidden", "false");
    CurrentOpenedModal.setAttribute("aria-modal", "true");

    CurrentOpenedModal.addEventListener('click', closeModal);
};

/**
 * Fonction permettant de fermer la modale si elle est ouverte
 * @param eventClick
 */
const closeModal = function (eventClick) {
    eventClick.preventDefault();

    //Si la cible du click n'est pas la zone extérieure noir ou le lien pour fermer ou l'icon alors on sort de la function
    if (!eventClick.target.classList.contains("modal"))
        return;

    CloseCurrentModal();
};

/*
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton de retour pour revenir en arrière
 */
modalBackBtn.addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();

    //Si je suis en train d'ajouter un work alors que j'appuie sur le bouton retour
    if (document.getElementById("works-add-photo-container").classList.contains("selected")) {

        //Affiche la liste des works
        DisplayWorkListContainerOnModal();

        //Masque le bouton de retour
        if (modalBackBtn.classList.contains("can-back-true"))
            modalBackBtn.classList.remove("can-back-true");
    }
});

/**
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton fermer pour fermer la modale
 */
modalCloseBtn.addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();
    CloseCurrentModal();
})

/*
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton pour ajouter
 * un nouveau work
 */
addPhotoModalBtn.addEventListener('click', async function (eventClick) {
    eventClick.stopPropagation();

    //Affiche le bouton d retour sur la modale
    if (!modalBackBtn.classList.contains("can-back-true"))
        modalBackBtn.classList.add("can-back-true");

    //Affiche le formulaire de création de work
    DisplayAddWorkContainerOnModal();

    //Réinitialise et ajoute le formulaire de création de work
    await CreateAddPhotoHeaderUi();
});

/*
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton
 * de validation de work
 */
validatePhotoModalBtn.addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();

    const form = document.querySelector("#works-add-photo-container form");
    //Etant donné que form.submit()  ne lance pas l'évenement  onsubmit alors on le force d'une autre façon
    // Déclencher l'événement submit du formulaire
    let event = new Event("submit", {
        bubbles: true,
        cancelable: true
    });
    form.dispatchEvent(event);
});

/**
 * Se produit lorsque le formulaire est soumis
 * @param {SubmitEvent} event
 */
const onWorkPhotoSubmitted = async function (event) {
    event.preventDefault();

    if (!IsWorkFormValid())
        return;

    const selectedFile = document.querySelector("#addPhotoInput").files[0];
    const titleInputValue = document.querySelector("#workProjectName").value;
    const selectCategory = document.querySelector("#workCategoryName");
    const selectedCategory = parseInt(selectCategory.options[selectCategory.selectedIndex].value);
    const fileBlob = await ConvertFileToBlobAsync(selectedFile);

    const spanError = document.querySelector("#works-add-photo-container span.error-msg");
    const result = await InsertWorkInDataBaseAsync(titleInputValue, selectedCategory, fileBlob, selectedFile.name);
    
    //Si l'insertion est un échec alors on affiche l'erreur sans fermer la modale
    if (!result.isSucces){
        spanError.innerText = result.message;
        spanError.style.display = "block";
        return;
    }

    spanError.innerText = "";
    spanError.style.display = "none";
    
    //Ferme la modale
    CloseCurrentModal();
};

/**
 * Fonction exécuté lorsque l'utilisateur a sélectionné un fichier dans le sélecteur de fichier
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 * @param {Event} changeEvent
 * @param {HTMLInputElement} fileInput
 */
const onWorkAddedPhoto = async function (changeEvent, fileInput) {
    const spanError = document.querySelector("#works-add-photo-container span.error-msg");
    const previewImg = document.getElementById("add-photo-preview-img");

    const previewImageContainer = previewImg.parentElement;
    const selectedFiles = fileInput.files;

    previewImg.src = "";
    previewImg.alt = "Prévisualisation de l'image"

    if (selectedFiles.length !== 1) {
        //Masque le conteneur de l'image de prévisualisation
        if (!previewImageContainer.classList.contains("hidden"))
            previewImageContainer.classList.add("hidden");

        //Ecrit et affiche un message d'erreur
        spanError.innerText = selectedFiles.length === 0 ? "Aucun fichier n'a été sélectionné." : "Un seul fichier doit être sélectionné.";
        spanError.style.display = "block";
        console.error(spanError.innerText);

        //Réinitialise le sélecteur de fichier
        fileInput.value = "";
        return;
    }

    //Récupère le premier fichier
    const currentFileSelected = selectedFiles[0];
    if (IsGreaterThan4mo(currentFileSelected.size)) {
        //Ecrit et affiche un message d'erreur
        spanError.innerText = "La taille de l'image doit être inférieur ou égale à 4 Mo.";
        spanError.style.display = "block";
        console.error(spanError.innerText);

        //Réinitialise le sélecteur de fichier
        fileInput.value = "";
        return;
    }

    if (!IsSelectedFileTypeValid(currentFileSelected)) {
        //Ecrit et affiche un message d'erreur
        spanError.innerText = "Le format du fichier n'est pas correct.";
        spanError.style.display = "block";
        console.error(spanError.innerText);

        //Réinitialise le sélecteur de fichier
        fileInput.value = "";
        return;
    }

    //Masque le sélecteur de fichier
    const addPhotoContainer = document.querySelector("#works-add-photo-container .works-input-photo-container");
    if (!addPhotoContainer.classList.contains("hidden"))
        addPhotoContainer.classList.add("hidden");

    //Obtient le blob du fichier explicitement
    const fileBlob = await ConvertFileToBlobAsync(currentFileSelected);
    
    //Ajoute les données du fichier à l'image
    previewImg.src = URL.createObjectURL(fileBlob);
    previewImg.alt = previewImg.title = currentFileSelected.name;

    //Affiche l'image si elle ne l'était pas
    if (previewImageContainer.classList.contains("hidden"))
        previewImageContainer.classList.remove("hidden");

    //Masque l'erreur
    spanError.innerText = "";
    spanError.style.display = "none";
};

/**
 * Fonction permettant d'attacher un évènement click aux éléments HTML A pour ouvrir la modale associée
 */
function AddEventClickOnAllModalLink() {
    document.querySelectorAll(".a-modal").forEach(element => {
        element.addEventListener('click', openModal);
    });
}

/**
 * Ferme la modale actuelle
 */
function CloseCurrentModal() {
    if (CurrentOpenedModal === null)
        return;

    //Ajoute la classe qui permet de fermer la modale
    if (!CurrentOpenedModal.classList.contains("closed"))
        CurrentOpenedModal.classList.add("closed");

    CurrentOpenedModal.setAttribute("aria-hidden", "true");
    CurrentOpenedModal.setAttribute("aria-modal", "false");

    //Efface l'évenement click du gestionnaire d'évenement
    CurrentOpenedModal.removeEventListener('click', closeModal);

    //Efface le formulaire et affiche la liste
    RemoveNewWorkForm();
}

/**
 * Retourne une valeur booléenne indiquant si si le formulaire est valide
 * @returns {boolean}
 */
function IsWorkFormValid() {
    const spanError = document.querySelector("#works-add-photo-container span.error-msg");

    const fileInput = document.querySelector("#addPhotoInput");
    const selectedFiles = fileInput.files;
    if (selectedFiles.length !== 1) {
        spanError.innerText = selectedFiles.length === 0 ? "Aucun fichier n'a été sélectionné." : "Un seul fichier doit être sélectionné.";
        spanError.style.display = "block";
        console.error(spanError.innerText);
        return false;
    }

    //Récupère le premier fichier
    const currentFileSelected = selectedFiles[0];
    if (IsGreaterThan4mo(currentFileSelected.size)) {
        spanError.innerText = "La taille de l'image doit être inférieur ou égale à 4 Mo.";
        spanError.style.display = "block";
        return false;
    }

    if (!IsSelectedFileTypeValid(currentFileSelected)) {
        spanError.innerText = "Le format du fichier n'est pas correct.";
        spanError.style.display = "block";
        return false;
    }

    const titleInputValue = document.querySelector("#workProjectName").value;
    // Expression régulière pour vérifier si le texte est depuis le début de la ligne contient 0 fois ou plus des espaces blancs jusqu'à la fin de la ligne
    const regex = /^\s*$/;

    // Test du texte avec l'expression régulière
    if (titleInputValue === null || regex.test(titleInputValue)) {
        spanError.innerText = "Le titre du work ne peut pas être null, vide ou ne contenir que des espaces blancs.";
        spanError.style.display = "block";
        console.error(spanError.innerText);
        if (!validatePhotoModalBtn.classList.contains("disabled"))
            validatePhotoModalBtn.classList.add("disabled");
        return false;
    }

    const selectCategory = document.querySelector("#workCategoryName");
    if (selectCategory.selectedIndex <= 0) {
        spanError.innerText = "Vous devez sélectionner une catégorie.";
        spanError.style.display = "block";
        console.error(spanError.innerText);
        if (!validatePhotoModalBtn.classList.contains("disabled"))
            validatePhotoModalBtn.classList.add("disabled");
        return false;
    }

    if (validatePhotoModalBtn.classList.contains("disabled"))
        validatePhotoModalBtn.classList.remove("disabled");

    spanError.innerText = "";
    spanError.style.display = "none";

    return true;
}

/**
 * Affiche le conteneur de la liste des works et masque le conteneur de création de work
 */
function DisplayWorkListContainerOnModal() {
    //Masque le conteneur du formulaire de création de work
    const addPhotoContainer = document.getElementById("works-add-photo-container");
    if (addPhotoContainer.classList.contains("selected"))
        addPhotoContainer.classList.remove("selected");

    //Affiche le conteneur de la liste des works
    const workListContainer = document.getElementById("works-manager-list-container");
    if (!workListContainer.classList.contains("selected"))
        workListContainer.classList.add("selected");

    //Masque le bouton pour valider et créer le work
    if (validatePhotoModalBtn.classList.contains("selected"))
        validatePhotoModalBtn.classList.remove("selected");

    //Affiche le bouton pour créer un work
    if (!addPhotoModalBtn.classList.contains("selected"))
        addPhotoModalBtn.classList.add("selected");
}

/**
 * Affiche le conteneur de création de work et masque le conteneur de la liste des works
 */
function DisplayAddWorkContainerOnModal() {

    // Masque le conteneur de la liste des works
    const workListContainer = document.getElementById("works-manager-list-container");
    if (workListContainer.classList.contains("selected"))
        workListContainer.classList.remove("selected");

    //Affiche le conteneur contenant le formulaire de création de work
    const addPhotoContainer = document.getElementById("works-add-photo-container");
    if (!addPhotoContainer.classList.contains("selected"))
        addPhotoContainer.classList.add("selected");

    //Masque le bouton pour ajouter des works
    if (addPhotoModalBtn.classList.contains("selected"))
        addPhotoModalBtn.classList.remove("selected");

    //Affiche le bouton de validation du work
    if (!validatePhotoModalBtn.classList.contains("selected"))
        validatePhotoModalBtn.classList.add("selected");
    
    //Désactive (style) le bouton par défaut
    if (!validatePhotoModalBtn.classList.contains("disabled"))
        validatePhotoModalBtn.classList.add("disabled");
}

/**
 * Efface le contenu du conteneur qui permet d'ajouter un work et le rempli avec l'élément form puis e retourne
 * @returns {HTMLFormElement|null}
 */
async function CreateAndGetNewWorkForm() {
    const addPhotoContainer = document.getElementById("works-add-photo-container");
    if (!addPhotoContainer) {
        console.error("L'élément parent n'existe pas.");
        return null;
    }

    while (addPhotoContainer.hasChildNodes()) {
        const child = addPhotoContainer.childNodes[0];
        addPhotoContainer.removeChild(child);
    }

    //Création du formulaire de création de work
    const form = document.createElement("form");
    form.onsubmit = await onWorkPhotoSubmitted;
    addPhotoContainer.appendChild(form);

    return form;
}

/**
 * Efface le contenu du conteneur qui permet d'ajouter un work et affiche par défaut la liste des works
 */
function RemoveNewWorkForm() {
    const addPhotoContainer = document.getElementById("works-add-photo-container");
    if (!addPhotoContainer) {
        console.error("L'élément parent n'existe pas.");
        return;
    }

    while (addPhotoContainer.hasChildNodes()) {
        const child = addPhotoContainer.childNodes[0];
        addPhotoContainer.removeChild(child);
    }

    DisplayWorkListContainerOnModal();
}

/**
 * Crée l'Ui d'ajout de nouveau work qui comprends uniquement le formulaire et l'en-tête (sélecteur de fichier et image de prévisualisation)
 */
async function CreateAddPhotoHeaderUi() {
    //Création du formulaire de création de work
    const form = await CreateAndGetNewWorkForm();

    /*Création de l'en-tête du formulaire qui contient l'icone d'une image, le sélecteur de fichiers, les remarque de mise en ligne
    et la prévisualisation de l'image*/
    const headerContainer = document.createElement("div");
    headerContainer.classList.add("works-add-photo-header-container");
    form.appendChild(headerContainer);

    //Création du conteneur de l'icone d'une image, du sélecteur de fichier et des remarques de mise en ligne
    const imageInputContainer = document.createElement("div");
    imageInputContainer.classList.add("works-input-photo-container");
    headerContainer.appendChild(imageInputContainer);

    //Création du conteneur de l'image
    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon-container");
    imageInputContainer.appendChild(iconContainer);

    //Création de l'icone
    const icon = document.createElement("i");
    icon.classList.add("fa-regular", "fa-image");
    iconContainer.appendChild(icon);

    // Création du label
    const label = document.createElement("label");
    label.setAttribute("for", "addPhotoInput");
    label.onclick = (eventClick) => {
        eventClick.stopPropagation();
    };
    imageInputContainer.appendChild(label);

    //Création du texte du label
    const labelText = document.createElement("span");
    labelText.innerText = "+ Ajouter photo";
    label.appendChild(labelText);

    //Création du sélecteur de fichier
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.id = "addPhotoInput";
    fileInput.name = "addPhotoInput";
    fileInput.accept = ".jpeg, .png";
    fileInput.required = true;
    fileInput.onchange = async (e) => {
        await onWorkAddedPhoto(e, fileInput);
    };
    label.appendChild(fileInput);

    //Création du texte concernant les remarques de mise en ligne du fichier
    const uploadRemark = document.createElement("span");
    uploadRemark.classList.add("add-photo-info");
    uploadRemark.innerText = "jpg, png : 4mo max";
    imageInputContainer.appendChild(uploadRemark);

    //Création du conteneur de la pévisualisation de l'image
    const previewImageContainer = document.createElement("div");
    previewImageContainer.classList.add("works-preview-photo-container", "hidden");
    headerContainer.appendChild(previewImageContainer);

    //Création du conteneur de l'image de prévisualisation
    const previewImg = document.createElement("img");
    previewImg.id = "add-photo-preview-img";
    previewImg.alt = "Prévisualisation de l'image";
    previewImageContainer.appendChild(previewImg);

    CreateNewWorkInfos(form);
}

/**
 * Crée l'Ui la zone de texte et le sélecteur de categorie dans le formulaire
 * @param {Element} form Représente le formulaire de création de work
 */
function CreateNewWorkInfos(form) {
    if (!form) {
        console.error("Le formulaire n'est pas disponible.")
        return;
    }

    //Création du conteneur des zones de texte
    const projectInfosContainer = document.createElement("div");
    projectInfosContainer.classList.add("works-project-infos");
    form.appendChild(projectInfosContainer);

    //Création du label du titre
    const titleLabel = document.createElement("label");
    titleLabel.innerText = "Titre";
    titleLabel.setAttribute("for", "workProjectName");
    projectInfosContainer.appendChild(titleLabel);

    //Création de l'input du titre
    const inputTextTitle = document.createElement("input");
    inputTextTitle.type = "text";
    inputTextTitle.id = "workProjectName";
    inputTextTitle.name = "workProjectName";
    inputTextTitle.required = true;
    inputTextTitle.onchange = () => {
        IsWorkFormValid();
    }
    projectInfosContainer.appendChild(inputTextTitle);

    //Création du label des catégories
    const categoryLabel = document.createElement("label");
    categoryLabel.innerText = "Catégorie";
    categoryLabel.setAttribute("for", "workCategoryName");
    projectInfosContainer.appendChild(categoryLabel);

    //Création de la combobox (select)
    const selectCategory = document.createElement("select");
    selectCategory.id = "workCategoryName";
    selectCategory.name = "workCategoryName";
    selectCategory.required = true;
    projectInfosContainer.appendChild(selectCategory);

    //Création de l'option par défaut
    const selectCategoryOption = document.createElement("option");
    selectCategoryOption.value = "";
    selectCategoryOption.text = "Sélectionnez une catégorie";
    selectCategoryOption.hidden = true;
    selectCategory.add(selectCategoryOption, null);
    
    CategoriesSet.forEach((category) => {
        const categoryOption = document.createElement("option");
        categoryOption.value = category.id.toString();
        categoryOption.text = category.name;
        selectCategory.add(categoryOption, null);
    });

    //Création du span contenant les erreurs
    const spanError = document.createElement("span");
    spanError.classList.add("error-msg");
    spanError.style.display = "none";
    projectInfosContainer.appendChild(spanError);
}

/***************************************** HELPERS *****************************************/

/**
 * Retourne une valeur booléenne indiquant si le type du fichier en paramètre comprend un des types dans la constante fileTypes
 * @param file
 * @returns {boolean}
 */
function IsSelectedFileTypeValid(file) {
    return fileTypes.includes(file.type);
}

/**
 * Retourne une valeur booléenne indiquant si la taille du fichier est supérieur à 4 mo
 * @param {number} fileSize
 * @returns {boolean}
 */
function IsGreaterThan4mo(fileSize) {
    // si le fichier fait moins de 1mb
    if (fileSize < oneMbSize)
        return false;

    //Récupère uniquement la taille du fichier
    const fileSizeResult = GetFileSize(fileSize);
    return fileSizeResult.size > 4;
}


/**
 * Retourne une chaine de caractère représentant la taille du fichier
 * @param {number} fileSize
 * @returns {{size: number, label: string, suffix: string}}
 */
function GetFileSize(fileSize) {
    if (fileSize < oneKbSize) {
        return {
            size: fileSize,
            suffix: 'B',
            label: `${fileSize} octets`
        };
    } else if (fileSize >= oneKbSize && fileSize < oneMbSize) {
        const value = (fileSize / oneKbSize).toFixed(1);
        return {
            size: parseInt(value),
            suffix: 'KB',
            label: `${value} Ko`
        };
    } else {
        const value = (fileSize / oneMbSize).toFixed(1);
        return {
            size: parseInt(value),
            suffix: 'MB',
            label: `${value} Mo`
        };
    }
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