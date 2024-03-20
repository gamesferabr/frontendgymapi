// Pegar o texto do id do h4 e colocar na variável currentmeal
// Seleciona o primeiro h4 da página
const firstH4Element = document.querySelector('h4');

// Extrai o texto do h4
const firstH4Text = firstH4Element.textContent || firstH4Element.innerText;

// Divide o texto pelo espaço e pega a primeira palavra
const currentmeal = firstH4Text.split(' ')[0].toLowerCase();


// Função para atualizar o token
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
           } 
            
            else {
                console.error('Erro ao atualizar o token.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
        
                window.location.href = '../login.html';
                return false; // Falha na atualização do token
            }
    }

    catch (error) {
        console.error('Erro ao atualizar o token:', error);
        window.location.href = '../login.html';
    }

}


// Função para verificar e possivelmente atualizar o token
async function checkAndRefreshToken() {
    let accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '../login.html';
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


// Função para buscar as informações da dieta para a nova data selecionada
document.addEventListener("DOMContentLoaded", async function () {
    await checkAndRefreshToken();
    // Configura a data atual como valor padrão do seletor de data
    document.getElementById('date-selector').value = new Date().toISOString().slice(0, 10);

    // Busca as informações da dieta para a data atual
    let data = await fetchDietData();

    // Evento para buscar as informações da dieta para a nova data selecionada
    document.getElementById('date-selector').addEventListener('change', fetchDietData);

    document.getElementById('back').addEventListener('click', function () {
        window.location.href = 'diet.html#breakfastcontainer';
    });

    let accessToken = localStorage.getItem('access_token');
    
    let response = await fetch(`https://gym-api-930w.onrender.com/api/diets/${data}/${currentmeal}/${accessToken}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    if (response.status === 200) {

        let data = await response.json();
        
        updateFoodList(data);

    } else {

        console.error('Error:', response.status);

    }

});


// Função para chamar e tratar a validação de token
document.addEventListener("DOMContentLoaded", async function () {
    
    // Verifica e possivelmente atualiza o token antes de prosseguir
    await checkAndRefreshToken();

    let accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
        window.location.href = '../login.html';

    } else {
        // Opcional: Valida o token com o servidor
        validateToken(accessToken).then(isValid => {
            if (!isValid) {
                
                localStorage.removeItem('access_token');
                
                window.location.href = '../login.html';
            }

        }).catch(error => {

            console.error('Erro ao validar o token:', error);

        });
    }
});


// Função para validar o token
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

// Função para obter a data selecionada
async function fetchDietData() {
    let date = document.getElementById('date-selector').value; // Pega a data selecionada

    return date;
}


// Função para atualizar a lista de alimentos
async function updateFoodList(data) {    
    await checkAndRefreshToken();
    let foodListElement = document.getElementById('foodlist');
    foodListElement.innerHTML = ''; // Limpa a lista antes de adicionar novos itens

    if (data && data.length > 0) {
        data.forEach(food => {
            let foodElement = document.createElement('li');
            foodElement.className = `list-group-item-${food.id}`;
            foodElement.innerHTML = `
                ${food.description}
                <button class="btn btn-danger delete-food-btn" data-food-id="${food.id}">Delete</button>
            `;

            document.getElementById('foodlist').appendChild(foodElement);

            foodElement.querySelector('.delete-food-btn').addEventListener('click', function() {
                deleteFood(this.getAttribute('data-food-id'));
            });
        });
    } else {
        // Mostra uma mensagem e opções quando não houver dados
        foodListElement.innerHTML = `
            <li class="list-group-item list-group-item-warning">No diet found for this date. You can 
                <a href="diets.html">add a new diet</a> or 
                select another date.</li>
        `;
    }
}


// Função para deletar o alimento
async function deleteFood(foodId) {
    console.log(`Deleting food with ID: ${foodId}`);
    let accessToken = localStorage.getItem('access_token');
    
    let response = await fetch(`https://gym-api-930w.onrender.com/api/diets/delete/${foodId}/${accessToken}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });

    if (response.ok) {
        // Remove o item da lista na interface do usuário
        document.querySelector(`.list-group-item-${foodId}`).remove();
        alert('Food deleted successfully.');

        // Se a list-group-item estiver vazia, faz o update da lista
        if (document.getElementById('foodlist').innerHTML === '') {
            updateFoodList();
        }

    } else {
        console.error('Erro ao deletar o alimento:', response.status);
        alert('Error deleting food. Please try again later.');
    }
}


// Evento para buscar as informações da dieta para a nova data selecionada
document.getElementById("btn-date").addEventListener('click', async function(event){
    event.preventDefault();

    // Se a data selecionada for diferente da data atual, busca as informações da dieta para a nova data
    let date = document.getElementById('date-selector').value;
    
    if (date !== new Date().toISOString().slice(0, 10)) {
        // Busca as informações da dieta para a data atual
        let accessToken = localStorage.getItem('access_token');
        
        let response = await fetch(`https://gym-api-930w.onrender.com/api/diets/${date}/${currentmeal}/${accessToken}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });

        if (response.status === 200) {
            
            let data = await response.json();

            updateFoodList(data);

        }
        else {
            alert('No data found for this date. Please select another date.');
        }
    }

    else{

        // Continua com o mesmo template e não busca as informações da dieta para a nova data
        alert('Data is already selected. Please select another date.');
        
    }
});