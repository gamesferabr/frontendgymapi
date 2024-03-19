document.getElementById('signupForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevenir o comportamento padrão de envio do formulário

    let { ok, data, status } = await signup();

    let errorMessageDiv = document.getElementById('errorMessage');

    if (ok) {
        window.location.href = 'login.html'; // Redirecionar para login se sucesso
    } else {
        // Se houver erro, mostrar a mensagem de erro
        errorMessageDiv.style.display = 'block';

        // A lógica aqui assume que o erro sempre vem no formato { detail: ... }
        // Isso pode precisar de ajustes dependendo da consistência da resposta da sua API
        if (data && Array.isArray(data.detail)) {
            errorMessageDiv.innerHTML = data.detail.join('<br>');
        } else if (data && data.detail) {
            errorMessageDiv.innerHTML = data.detail;
        } else {
            // Mensagem genérica para outros casos, ajuste conforme necessário
            errorMessageDiv.innerHTML = 'An unexpected error occurred.';
        }
    }
});


async function signup() {
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let firstName = document.getElementById('first_name').value;
    let lastName = document.getElementById('last_name').value;

    let userData = {
        email: email,
        password: password,
        first_name: firstName,
        last_name: lastName,
    };

    let response = await fetch('https://gym-api-930w.onrender.com/api/users/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });

    // Aqui, independente do status, tentamos extrair o JSON
    let data = await response.json().catch(() => null); // Isso evita erro caso o corpo não seja JSON

    return { ok: response.ok, status: response.status, data: data };
}