const loginForm = document.querySelector("#log_in  form");

const loginLinkElement = document.getElementById("loginLink");

/*
 * Evenement se déclanchant lorsque 
 */
loginLinkElement.addEventListener('click', function() {

    const tokenValue = window.localStorage.getItem("token");
    if (tokenValue === null || tokenValue === "") {
        window.location.href = "login.html";
    } else {
           window.localStorage.removeItem("token");
           window.location.href = "index.html";
    }
});

// Ajout de l'évenement lorsque j'appuis sur le bouton se connecter 
loginForm.addEventListener("submit", async (event) => {
    // empêche le comportement par défaut du formulaire
    event.preventDefault();

    const connexionStatusErrorSpan = loginForm.querySelector(".connexion-error");
    connexionStatusErrorSpan.innerText = "";
    
    // Même si l'attribut required est présent sur les balise input on revérifie quand même en js
    const emailInputValue = loginForm.querySelector('#email').value;
    if (emailInputValue === "") {
        {
            connexionStatusErrorSpan.innerText = "L'e-mail n'est pas valide."
            event.preventDefault();
        }
    }
    
    //ajouter une vérification de l'email avec les expressions régulières
    //..
    
    const passwordInputValue = loginForm.querySelector("#password").value;

    // création de l'objet à poster contenant les informations de connexion
    const loginData = {
        email: emailInputValue,
        password: passwordInputValue,
    };

    // Configuration de la requête
    const requestOptions = {
        method: 'POST',
        headers: {
            // Indique que le corps de la requête est en JSON
            'Content-Type': 'application/json'
        },
        
        // Convertit l'objet loginData en Json (au format texte)
        body: JSON.stringify(loginData)
    };

    try {
        const response = await fetch('http://localhost:5678/api/users/login', requestOptions);

        if (!response.ok) {
            switch (response.status) {
                case 401 : {
                    console.error("Vous n'êtes pas autorisé a accéder à cette ressource.");
                    return;
                }
                case 404 : {
                    console.error("Erreur dans l’identifiant ou le mot de passe.");
                    return;
                }
                default : {
                    console.error(response.statusMessage);
                    return;
                }
            }
        }
        
        const jsonToken = await response.json();
        GetLoginToken(jsonToken);
    } catch (e) {
        if (e.message.includes("Failed to fetch")) {
            connexionStatusErrorSpan.innerText = "Impossible de contacter le serveur.";
            return;
        }
        connexionStatusErrorSpan.innerText = e.message;
        console.error(e) ;  
    }
});

/**
 * Récupère et stocke le token de l'utilisateur connecté puis le redirige vers la page d'accueil
 * @param jsonResponse
 */
function GetLoginToken(jsonResponse){
    
    const token = jsonResponse.token;
    console.log(token);
    
    //dans l'attente d'une meilleure alternative le token est stocké dans le stockage locale
    window.localStorage.setItem("token", token);
    
    window.location.href = "index.html";
}