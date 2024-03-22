async function refreshToken() {
    let refreshToken = localStorage.getItem('refresh_token');
    try{
        let response = await fetch(`https://gym-api-930w.onrender.com/api/auth/token/refresh`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            let data = await response.json();
            localStorage.setItem('access_token', data.access);
            console.log('Token refreshed successfully.');} 
            
            else {
                console.error('Erro ao atualizar o token.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
        
                window.location.href = 'login.html';
                return false; // Falha na atualização do token
            }
    }

    catch (error) {
        console.error('Erro ao atualizar o token:', error);
        window.location.href = 'login.html';
    }

}

async function checkAndRefreshToken() {
    let accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        // window.location.href = 'login.html';
        return;
    }

    // Decodifica o token para verificar a expiração
    let decodedToken = jwt_decode(accessToken);
    let currentTime = Date.now() / 1000; // Converte para segundos

    if (decodedToken.exp < currentTime) {
        // Token expirado, tenta renovar
        await refreshToken();
    }
}

document.addEventListener('DOMContentLoaded', async function () {

    await checkAndRefreshToken();
    
    // Recupera os valores do localStorage
    const username = localStorage.getItem('username');
    const lastName = localStorage.getItem('last_name');
    const email = localStorage.getItem('email');

    console.log(username); // Deve mostrar o valor armazenado para 'username'
    console.log(lastName); // Deve mostrar o valor armazenado para 'last_name'
    console.log(email); // Deve mostrar o valor armazenado para 'email'

    // Encontra os elementos no DOM onde os dados devem ser exibidos
    const userEmailElement = document.getElementById('userEmail');
    const userFirstNameElement = document.getElementById('userFirstName');
    const userLastNameElement = document.getElementById('userLastName');

    // Define o texto desses elementos com os valores recuperados
    userEmailElement.textContent = email;
    userFirstNameElement.textContent = username;
    userLastNameElement.textContent = lastName;
});