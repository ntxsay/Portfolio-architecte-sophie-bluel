const fileTypes = [
    "image/jpeg",
    "image/png",
];


const addPhotoModalBtn = document.getElementById("add-photo-btn");
const validatePhotoModalBtn = document.getElementById("validate-photo-btn");
const addPhotoInput = document.getElementById("addPhotoInput");

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
 * Retourne une chaine de caractère représentant la taille du fichier
 * @param number
 * @returns {string}
 */
function getStringFileSize(number) {
    if (number < 1024) {
        return `${number} octets`;
    } else if (number >= 1024 && number < 1048576) {
        return `${getFileSize(number)} Ko`;
    } else {
        return `${getFileSize(number)} Mo`;
    }
}

/**
 * Calcule la taille de l'image
 * @param {number} number
 * @returns {number}
 */
function getFileSize(number) {
    if (number < 1024) {
        return number;
    } else if (number >= 1024 && number < 1048576) {
        return parseInt((number / 1024).toFixed(1));
    } else {
        return parseInt((number / 1048576).toFixed(1));
    }
}

/**
 * Fonction permettant d'attacher un évènement click aux éléments HTML A pour ouvrir la modale associée
 */
function AddEventClickOnAllModalLink(){
    document.querySelectorAll(".a-modal").forEach(element => {
        element.addEventListener('click', openModal);
    });
}

/* 
 * Libère l'évenement 'click' du sélecteur de fichier.
 * 
 * Etant donné que la modale en elle-même possède un évènement click et afin d'éviter que l'évènement de celui-ci ne soit déclenché 
 * en cliquant sur un autre élément cliquable à l'intérieur de la modale on lance la fonction "stopPropagation();" 
 * pour éviter que cela ne se produise
 */
document.getElementById("addPhotoInput").addEventListener('click', function (eventclick) {
    eventclick.stopPropagation();
});

addPhotoModalBtn.addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();
    
    document.getElementById("works-manager-list-container").classList.remove("selected");
    
    const addPhotoContainer = document.getElementById("works-add-photo-container");
    if (!addPhotoContainer.classList.contains("selected"))
        addPhotoContainer.classList.add("selected");

    addPhotoModalBtn.classList.remove("selected");
    
    if (!validatePhotoModalBtn.classList.contains("selected"))
        validatePhotoModalBtn.classList.add("selected");
});

validatePhotoModalBtn.addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();
});

document.querySelector("#works-add-photo-container label").addEventListener('click', function (eventClick) {
    eventClick.stopPropagation();
});

/* 
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
 *
 */
addPhotoInput.addEventListener('change', function (changeEvent) {
    
    const previewImg = document.getElementById("add-photo-preview-img");
    const selectedFiles = addPhotoInput.files;
    if (selectedFiles.length === 0)
    {
        previewImg.src = null;
        previewImg.alt = "Prévisualisation de l'image"
        console.warn("Aucun fichier n'a été sélectionné.");
        return;
    }

    const currentFileSelected = selectedFiles[0];
    previewImg.src = URL.createObjectURL(currentFileSelected);
    previewImg.alt = previewImg.title = currentFileSelected.name;
});