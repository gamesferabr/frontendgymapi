document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o comportamento padrão de envio do formulário
    try {
        let { ok, data, status } = await login();

        let errorMessageDiv = document.getElementById('errorMessage');

        if(ok){
            // Armazenar o first_name e tokens no localStorage
            // localStorage.setItem('access_token', data.access); // Certifique-se de que esta é a chave correta
            localStorage.setItem('username', data.username); // Armazenando o first_name como 'username'
            localStorage.setItem('last_name', data.lastname);
            localStorage.setItem('email', data.email);
            localStorage.setItem('access_token', data.data.access);
            localStorage.setItem('refresh_token', data.data.refresh);
            
            window.location.href = 'dashboard.html';
        }
        else {
            // Se houver erro, mostrar a mensagem de erro
            errorMessageDiv.style.display = 'block';

            if(status == 401 || status == 422){
                errorMessageDiv.innerHTML = 'Invalid credentials. Please try again.';
            }

            else if(status == 500){
                errorMessageDiv.innerHTML = 'Internal server error. Please try again later.';
            }

            else{
                errorMessageDiv.innerHTML = 'Unknown error. Please try again later.';
            }
        }
    } catch (error) {
        let errorMessageDiv = document.getElementById('errorMessage');

        console.error('Erro ao fazer login:', error);
        errorMessageDiv.style.display = 'block';
        errorMessageDiv.innerHTML = 'Unknown error. Please try again later.';
    }
});


async function login(){
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    var userData = {
        email: email,
        password: password
    };

    let response = await fetch('https://localhost:8000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

    let data = await response.json(); // Converte a resposta para JSON

    return { ok: response.ok, status: response.status, data: data };
}