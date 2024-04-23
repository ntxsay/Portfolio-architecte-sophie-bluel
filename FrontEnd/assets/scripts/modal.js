const oneKbSize = 1024;
const oneMbSize = 1048576;
const fileTypes = [
    "image/jpeg",
    "image/png",
];


const addPhotoModalBtn = document.getElementById("add-photo-btn");
const validatePhotoModalBtn = document.getElementById("validate-photo-btn");

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

    LoadWorksToWorksModal(Array.from(WorksSet));

    if (CurrentOpenedModal.classList.contains("closed"))
        CurrentOpenedModal.classList.remove("closed");

    CurrentOpenedModal.setAttribute("aria-hidden", "false");
    CurrentOpenedModal.setAttribute("aria-modal", "true");

    CurrentOpenedModal.addEventListener('click', closeModal);
};

const closeModal = function (eventClick) {
    eventClick.preventDefault();

    if (CurrentOpenedModal === null)
        return;

//Si la cible du click n'est pas la zone extérieure noir ou le lien pour fermer ou l'icon alors on sort de la function
    if (!eventClick.target.classList.contains("modal") && !eventClick.target.classList.contains("modal-close-link") &&
        !eventClick.target.classList.contains("modal-close-icon"))
        return;

    if (!CurrentOpenedModal.classList.contains("closed"))
        CurrentOpenedModal.classList.add("closed");

    CurrentOpenedModal.setAttribute("aria-hidden", "true");
    CurrentOpenedModal.setAttribute("aria-modal", "false");

    CurrentOpenedModal.removeEventListener('click', closeModal);
};

/**
 * Retourne une valeur booléenne indiquant si le type du fichier en paramètre comprend un des types dans la constante fileTypes
 * @param file
 * @returns {boolean}
 */
function isSelectedFileTypeValid(file) {
    return fileTypes.includes(file.type);
}

/**
 * Retourne une valeur booléenne indiquant si la taille du fichier est supérieur à 4 mo
 * @param {number} number
 * @returns {boolean}
 */
function isGreaterThan4mo(number) {
    // 1048576 représente 1mb
    if (number < oneMbSize)
        return false;
    
    const moSize = getStringFileSize(number)[0];
    return  moSize > 4;
}


/**
 * Retourne une chaine de caractère représentant la taille du fichier
 * @param number
 * @returns {(number|string)[]}
 */
function getStringFileSize(number) {
    const value = getFileSize(number);
    if (number < oneKbSize) {
        return [value, `${number} octets`];
    } else if (number >= oneKbSize && number < oneMbSize) {
        return [value, `${value} Ko`];
    } else {
        return [value, `${value} Mo` ];
    }
}

/**
 * Calcule la taille de l'image
 * @param {number} number
 * @returns {number}
 */
function getFileSize(number) {
    if (number < oneKbSize) {
        return number;
    } else if (number >= oneKbSize && number < oneMbSize) {
        return parseInt((number / oneKbSize).toFixed(1));
    } else {
        return parseInt((number / oneMbSize).toFixed(1));
    }
}


/**
 * Fonction permettant d'attacher un évènement click aux éléments HTML A pour ouvrir la modale associée
 */
function AddEventClickOnAllModalLink() {
    document.querySelectorAll(".a-modal").forEach(element => {
        element.addEventListener('click', openModal);
    });
}

/*
 * Evenement se produisant lorsque l'utilisateur clique sur le bouton pour ajouter
 * un nouveau work
 */
addPhotoModalBtn.addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();

    document.getElementById("works-manager-list-container").classList.remove("selected");

    const addPhotoContainer = document.getElementById("works-add-photo-container");
    if (!addPhotoContainer.classList.contains("selected"))
        addPhotoContainer.classList.add("selected");

    addPhotoModalBtn.classList.remove("selected");

    if (!validatePhotoModalBtn.classList.contains("selected"))
        validatePhotoModalBtn.classList.add("selected");

    //Ajoute le formulaire de création de work
    CreateAddPhotoHeaderUi();
});

validatePhotoModalBtn.addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();
});

/**
 * Fonction exécuté lorsque l'utilisateur a sélectionné un fichier dans le sélecteur de fichier
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 * @param {Event} changeEvent
 * @param {HTMLInputElement} fileInput
 */
const onWorkAddedPhoto = function (changeEvent, fileInput) {
    const previewImg = document.getElementById("add-photo-preview-img");
    const selectedFiles = fileInput.files;
    if (selectedFiles.length !== 1) {
        previewImg.src = "";
        previewImg.alt = "Prévisualisation de l'image"
        console.warn(selectedFiles.length === 0 ? "Aucun fichier n'a été sélectionné." : "Un seul fichier doit être sélectionné.");
        if (!previewImg.classList.contains("hidden"))
            previewImg.classList.add("hidden");
        alert("Vous devez sélectionner un seul fichier.");
        return;
    }

    //Récupère le premier fichier
    const currentFileSelected = selectedFiles[0];
    if (isGreaterThan4mo(currentFileSelected.size)){
        alert("La taille de l'image doit être inférieur ou égale à 4 Mo.");
        return;
    }
    
    //Masque le sélecteur de fichier
    const addPhotoContainer = document.querySelector("#works-add-photo-container .works-input-photo-container");
    if (!addPhotoContainer.classList.contains("hidden"))
        addPhotoContainer.classList.add("hidden");

    //Ajoute les données du fichier à l'image
    previewImg.src = URL.createObjectURL(currentFileSelected);
    previewImg.alt = previewImg.title = currentFileSelected.name;
    
    //Affiche l'image sielle ne l'était pas
    const previewImageContainer = previewImg.parentElement;
    if (previewImageContainer.classList.contains("hidden"))
        previewImageContainer.classList.remove("hidden");
};

function CreateAndGetNewWorkForm() {
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
    addPhotoContainer.appendChild(form);

    return form;
}

/**
 * Crée l'Ui d'ajout de nouveau work qui comprends uniquement le formulaire et l'en-tête (sélecteur de fichier et image de prévisualisation)
 */
function CreateAddPhotoHeaderUi() {
    //Création du formulaire de création de work
    const form = CreateAndGetNewWorkForm();

    //Création de l'en-tête du formulaire qui contient l'icone d'une image, le sélecteur de fichiers, les remarque de mise en ligne
    // et la prévisualisation de l'image
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
    fileInput.onchange = (e) => {
        onWorkAddedPhoto(e, fileInput);
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
    projectInfosContainer.appendChild(selectCategory);

    CategoriesSet.forEach((category) => {
        const categoryOption = document.createElement("option");
        categoryOption.value = category.id.toString();
        categoryOption.text = category.name;
        selectCategory.add(categoryOption, null);
    });
}