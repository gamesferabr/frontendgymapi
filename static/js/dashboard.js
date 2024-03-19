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

document.addEventListener("DOMContentLoaded", async function () {
    // Verifica e possivelmente atualiza o token antes de prosseguir
    await checkAndRefreshToken();

    let username = localStorage.getItem('username');

    if (username) {
        document.getElementById('username').textContent = ', '+username; // Certifique-se de ter um elemento com id="username" no seu HTML
    }

    let accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
        window.location.href = 'login.html';

    } else {
        // Opcional: Valida o token com o servidor
        validateToken(accessToken).then(isValid => {
            if (!isValid) {
                
                localStorage.removeItem('access_token');
                localStorage.removeItem('username');

                window.location.href = 'login.html';
            }

        }).catch(error => {

            console.error('Erro ao validar o token:', error);

        });
    }
});

async function validateToken(token) {
    try {
        
        let response = await fetch(`https://gym-api-930w.onrender.com/api/users/dashboard/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Falha na validação do token');
        }

        return true;

    } catch (error) {
        console.error('Erro ao validar o token:', error);
        return false;
    }
}

document.getElementById("logoutForm").addEventListener('submit', async function(event){
    event.preventDefault();
    
    // Verifica e possivelmente atualiza o token antes de prosseguir
    await checkAndRefreshToken();

    let token = localStorage.getItem('access_token');
        
    let response = await fetch(`https://gym-api-930w.onrender.com/api/users/logout/${token}`, {
        method: 'POST',
        
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })

    if (response.ok){

        console.log(response);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');

        localStorage.removeItem('username');

        //Redireciona para a página de login após o logout bem-sucedido
        window.location.href = 'login.html';
    }
});