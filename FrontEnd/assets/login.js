const loginForm = document.querySelector("#log_in  form");

// Ajout de l'évenement lorsque j'appuis sur le bouton se connecter 
loginForm.addEventListener("submit", (event) => {
    // empêche le comportement par défaut du formulaire
    event.preventDefault();

    const connexionStatusErrorSpan = loginForm.querySelector(".connexion-error");
    
    // Même si l'attribut required est présent sur les balise input on revérifie quand même en js
    const emailInput = loginForm.querySelector('#email');
    const emailInputValue = emailInput.value;
    if (emailInputValue === "") {
        {
            connexionStatusErrorSpan.innerText = "L'e-mail n'est pas valide."
            event.preventDefault();
        }
    }
    
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
                throw new Error('Erreur lors de la requête');
            }
            return response.json(); // Renvoie les données de réponse JSON si la requête est réussie
        })
        .then(data => {
            // Gérer la réponse de la requête (par exemple, redirection, affichage de messages, etc.)
            console.log(data); // Afficher les données de réponse JSON
        })
        .catch(error => {
            // Gérer les erreurs de la requête
            console.error('Erreur :', error);
        });
});