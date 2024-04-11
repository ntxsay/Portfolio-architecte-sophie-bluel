/*
 * Evenement se déclanchant lorsque DOM est entièrement chargé et analysé, 
 * sans attendre le chargement complet des ressources externes telles que les images, 
 * les feuilles de style et les scripts externes.
 */
document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:5678/api/works')
        .then(response => {
            //si le GET n'a pas réussi alors on lève une exception 
            if (!response.ok) {
                throw new Error(response.statusMessage);
            }
            
            //sinon convertit la réponse au format json et retourne la réponse
            return response.json();
        })
        .then(works => {
            // On récupère tous les works pour les afficher dans le dom dans la fonction suivante
            new LoadAllWorksToDom(works);
        })
        .catch(error => {
            // Affiche dans la console l'erreur
            console.error('Erreur lors de la récupération des données:', error);
        });
});

/**
 * Ajoute les Works au DOM
 * @param works Tableau de Works chargé depuis l'API
 * @constructor
 */
function LoadAllWorksToDom(works){
    // Déclare une constante du div ayant la classe "gallery" depuis son parent.
    const gallery = document.querySelector("#portfolio .gallery");
    
    // Efface le contenu de la galerie
    gallery.innerHTML = "";
    if (works.length === 0)
        return;
    
    //Ajoute un élément html pour chaque work
    works.forEach((work) => {
       //Initialise une variable constante de type texte contenant le noeud figure et son contenu provenant de l'API
        const figureHtmlElement = document.createElement("figure");
        
        // Création du noeud Img premier enfant
        const imageHtmlElement = document.createElement("img");
        imageHtmlElement.alt = work.title;
        imageHtmlElement.src = work.imageUrl;
        
        //Ajoute l'image à la figure
        figureHtmlElement.appendChild(imageHtmlElement);
        
        // Création duu noeud figCaption deuxième enfant
        const captionHtmlElement = document.createElement("figcaption");
        captionHtmlElement.innerText = work.title;
        
        //Ajoute le caption à la figure
        figureHtmlElement.appendChild(captionHtmlElement);
        
        //Autre Alternative
            /*`
            <figure>
                <img src="${work.imageUrl}" alt="${work.title}" />
                <figcaption>${work.title}</figcaption>
            </figure>
            `;*/
        
        //Ajoute la balise à gallery
        gallery.appendChild(figureHtmlElement);
    })
}