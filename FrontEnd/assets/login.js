const loginForm = document.querySelector("#log_in  form");

const loginLinkElement = document.getElementById("loginLink");
loginLinkElement.addEventListener('click', function() {

    const tokenValue = window.localStorage.getItem("token");
    if (tokenValue === null || tokenValue === "") {
        window.location.href = "login.html";
        SetToAuthenticatedOnDOM();
    } else {
           window.localStorage.removeItem("token");
           window.location.href = "index.html";
           SetToNotAuthenticatedOnDom();
    }
});

// Ajout de l'évenement lorsque j'appuis sur le bouton se connecter 
loginForm.addEventListener("submit", (event) => {
    // empêche le comportement par défaut du formulaire
    event.preventDefault();

    const connexionStatusErrorSpan = loginForm.querySelector(".connexion-error");
    connexionStatusErrorSpan.innerText = "";
    
    // Même si l'attribut required est présent sur les balise input on revérifie quand même en js
    const emailInput = loginForm.querySelector('#email');
    const emailInputValue = emailInput.value;
    if (emailInputValue === "") {
        {
            connexionStatusErrorSpan.innerText = "L'e-mail n'est pas valide."
            event.preventDefault();
        }
    }
    //ajouter une vérification de l'email avec les expressions régulières
    
    const passwordInput = loginForm.querySelector("#password");
    const passwordInputValue = passwordInput.value;

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

    // Envoi de la requête
    fetch('http://localhost:5678/api/users/login', requestOptions)
        .then(response => {
            if (!response.ok) {
                switch (response.status) {
                    case 401 : {
                        throw new Error("Vous n'êtes pas autorisé a accéder à cette ressource.");
                    }
                    case 404 : {
                        throw new Error("Erreur dans l’identifiant ou le mot de passe.");
                    }
                    default : {
                        throw new Error(response.statusMessage);
                    }
                }
            }
            
            //Convertit la réponse en objet json
            return response.json(); 
        })
        .then(data => {
            GetLoginToken(data);
        })
        .catch(error => {
            console.error('Erreur :', error);
            if (error.message.includes("Failed to fetch")) {
                connexionStatusErrorSpan.innerText = "Impossible de contacter le serveur.";
                return;
            }
            connexionStatusErrorSpan.innerText = error.message;
        });
});

function GetLoginToken(loginResponse){
    
    const token = loginResponse.token;
    console.log(token);
    
    //dans l'attente d'une meilleure alternative le token est stocké dans le stockage locale
    window.localStorage.setItem("token", token);
    
    window.location.href = "index.html";

    SetToAuthenticatedOnDOM();
    
}

function SetToAuthenticatedOnDOM(){
    loginLinkElement.innerText = "logout";
}

function SetToNotAuthenticatedOnDom() {
    
}