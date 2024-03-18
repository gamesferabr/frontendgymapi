document.querySelectorAll('.inputsearch').forEach(input => {
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            // Previne a ação padrão do enter
            e.preventDefault();
            // Simula um clique no botão de adição (+) relacionado ao input
            input.nextElementSibling.click();
        }
    });
});

async function refreshToken() {
    let refreshToken = localStorage.getItem('refresh_token');
    try{
        let response = await fetch(`https://localhost:8000/api/auth/token/refresh`, {
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
        
                window.location.href = '../login.html';
                return false; // Falha na atualização do token
            }
    }

    catch (error) {
        console.error('Erro ao atualizar o token:', error);
        window.location.href = '../login.html';
    }

}

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

//Lógica para liberar o html para ser visualizado pelo usuário
document.addEventListener("DOMContentLoaded", async function() {
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
                localStorage.removeItem('username');

                window.location.href = '../login.html';
            
            } 

        }).catch(error => {

            console.error('Erro ao validar o token:', error);

        });
    }
});


//Lógica de validar o token
async function validateToken(token) {
    try {
        
        let response = await fetch(`http://localhost:8000/api/users/dashboard/${token}`, {
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


// Lógica de procurar a dieta ao usuário
$(document).ready(function() {

    $('.add-food-btn').click(async function() {

        await checkAndRefreshToken();

        const mealType = $(this).data('meal');
        const queryInput = $(`#searchinput-${mealType}`);

        const query = queryInput.val();
        
        if (query) {
            $.ajax({

                url: 'https://api.nal.usda.gov/fdc/v1/foods/search',
                type: 'GET',
                dataType: 'json',
                data: {

                    api_key: 'HDg87qCY7kJPk3ozteKzgRarv7qGnpCAcDPLj8GZ', // Substitua YOUR_API_KEY pela sua
                    query: query,
                },

                success: function(result) {

                    if (result.foods && result.foods.length > 0) {
                        const selectfood = $('.addSelectedFoods');

                        selectfood.css('display', 'flex');

                        const resultsContainer = $(`#food-results-${mealType}`);
                        resultsContainer.empty(); // Limpa resultados anteriores
            
                        result.foods.forEach((food, index) => {
                            const checkBoxHtml = `
                                <div class="form-check">
                                    <input class="form-check-input food-checkbox" type="checkbox" data-fdcid="${food.fdcId}" id="food-${mealType}-${food.fdcId}">
                                    <label class="form-check-label" for="food-${mealType}-${food.fdcId}">
                                        ${food.description}
                                    </label>
                                    <input type="number" class="food-quantity" placeholder="Quantidade (g)" id="quantity-${mealType}-${food.fdcId}">
                                </div>
                            `;
                            resultsContainer.append(checkBoxHtml);
                        });

                        // Mostra o contêiner de resultados quando houver resultados
                        resultsContainer.css('display', 'block');
                    
                    } else {

                        alert("No food found for this query.");
                        
                        // Se nenhum alimento for encontrado, oculta o contêiner de resultados
                        container.empty(); // Limpa resultados anteriores
                        container.css('display', 'none');
                    }
                },

                error: function(error) {
                    alert('Error: ' + error.message);
                }
            });
        }
    });
    

    //Lógica para adicionar a dieta ao banco de dados
    $(document).ready(async function() {
        // Quando um botão é clicado para adicionar a dieta
        $('.addSelectedFoods').on('click', async function() {
            await checkAndRefreshToken();

            $('.food-checkbox:checked').each(function() {
                const fdcId = $(this).data('fdcid');
                                
                const quantityInputId = `quantity-${$(this).attr('id').split('-')[1]}-${fdcId}`;
                const quantity = parseInt($(`#${quantityInputId}`).val()) || 0;
                
                // Mostrar a comida, quantidade, carboidratos, proteínas, gorduras e calorias
                // Substitua o bloco abaixo pela chamada AJAX real para obter informações nutricionais
                // Certifique-se de enviar o token de acesso no cabeçalho da solicitação
                // e tratar a resposta e os erros adequadamente
                $.ajax({
                    //Pegar na quantidade de alimentos selecionados e enviar para o backend
                    url: `https://api.nal.usda.gov/fdc/v1/food/${fdcId}`,
                    type: 'GET',
                    dataType: 'json',
                    data: {
                        api_key: 'HDg87qCY7kJPk3ozteKzgRarv7qGnpCAcDPLj8GZ', // Substitua YOUR_API_KEY pela sua chave de API real
                    },

                    success: async function(result) {
                        
                        // Pegar o valor do tipo de refeição no h3 apenas em que o carousel item está ativo
                        const container = $('.carousel-item.active').find('.meal-container');
                        const mealType = container.find('h3').text().toLowerCase();

                        console.log(mealType);

                       // Assegura que result2 não seja undefined antes de tentar acessar suas propriedades
                        const result2 = result.labelNutrients || {};

                        const nome = result.description;
                        // Agora aplica o operador de encadeamento opcional `?.` e `||` de forma segura
                        const calorias = result2.calories?.value || 0;
                        const proteinas = result2.protein?.value || 0;
                        const gorduras = result2.fat?.value || 0;
                        const carboidratos = result2.carbohydrates?.value || 0;
                        const fibra = result2.fiber?.value || 0;
                        const acucar = result2.sugars?.value || 0;
                        const sodio = result2.sodium?.value || 0;
                        const colesterol = result2.cholesterol?.value || 0;
                        const gordura_saturada = result2.saturatedFat?.value || 0;
                        
                        // Montar um html do tipo lista, para mostrar os alimentos selecionados e enviar esse html para o backend para retornar para o usuário
                        const html = `
                            <div class="food-profile-${mealType}">
                                <h3>${nome}</h3>
                                <p>Quantity: ${quantity}g</p>
                                <p>Calories: ${calorias}g</p>
                                <p>Protein: ${proteinas}g</p>
                                <p>Fat: ${gorduras}g</p>
                                <p>Carb: ${carboidratos}g</p>
                                <p>Fiber: ${fibra}g</p>
                                <p>Sugars: ${acucar}g</p>
                                <p>Sodium: ${sodio}g</p>
                                <p>Cholesterol: ${colesterol}g</p>
                                <p>Saturated Fat: ${gordura_saturada}g</p>
                            </div>
                        `;

                        let dietDataSend = {
                             name: nome,
                             description: html,

                             //Lógica para pegar o dia atual
                             date: new Date().toISOString().slice(0, 10),  
                             mealtype: mealType,     
                        };
                        
                        let accessToken = localStorage.getItem('access_token');
                    
                        console.log(accessToken);

                        let response = await fetch(`http://localhost:8000/api/diets/add/${accessToken}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`
                            },
                            body: JSON.stringify(dietDataSend),
                        });
                        
                        if (response.ok) {
                            // reseta a view
                            $('#btn-reset-view').click();
                            alert('Food added successfully!');
                        }
                    }
                });
            });
        });
    });
});


$(document).ready(function() {
    $('#btn-reset-view').click(async function() {
        await checkAndRefreshToken();

        const container = $('.carousel-item.active').find('.meal-container');

        const selectfood = $('.addSelectedFoods');

        selectfood.css('display', 'none');
        
        // Oculta o perfil de alimentos e qualquer mensagem de erro ou resultado de pesquisa
        container.find('.user-food-profile').hide();
        container.find('.food-results').empty().hide();

        // Limpa o input de pesquisa
        container.find('.inputsearch').val('');

        // Esconde o botão "Ver Perfil" e mostra o botão "Pesquisar Alimentos"
        container.find('.btn-toggle[data-target="profile"]').hide();
        container.find('.btn-toggle[data-target="search"]').show();
    });
});