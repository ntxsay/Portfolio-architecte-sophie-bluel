const loginForm = document.querySelector("#log_in  form");

// Ajout de l'évenement lorsque j'appuis sur le bouton se connecter 
loginForm.addEventListener("submit", async (event) => {
    // empêche le comportement par défaut du formulaire
    event.preventDefault();

    const connexionStatusErrorSpan = loginForm.querySelector(".connexion-error");
    connexionStatusErrorSpan.innerText = "";

    // Même si l'attribut required est présent sur les balise input on revérifie quand même en js
    const emailInputValue = loginForm.querySelector('#email').value;

    const mailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+$/;
    if (emailInputValue === "" || !mailRegex.test(emailInputValue)) {
        connexionStatusErrorSpan.innerText = "L'e-mail n'est pas valide."
        return;
    }

    const passwordInputValue = loginForm.querySelector("#password").value;

    const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        headers: {
            // Indique que le corps de la requête est en JSON
            'Content-Type': 'application/json'
        },

        // Convertit l'objet loginData en Json (au format texte)
        body: JSON.stringify({
            email: emailInputValue,
            password: passwordInputValue,
        })
    }).catch((error) => {
        connexionStatusErrorSpan.innerText = error.message;
    });

    if (!response.ok) {
        connexionStatusErrorSpan.textContent = response.status === 404 
            ? "L'email ou le mot de passe ne correspond pas."
            : response.statusText;
        return;
    }

    const jsonToken = await response.json();
    window.localStorage.setItem("token", jsonToken.token);

    window.location.href = "index.html";
});