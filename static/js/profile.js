document.addEventListener('DOMContentLoaded', function () {
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