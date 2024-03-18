document.addEventListener("DOMContentLoaded", function() {
    const editProfileButton = document.getElementById('editProfileButton');
    const profileInfo = document.querySelector('.profile-info');
    const editProfileForm = document.querySelector('.edit-profile-form');
    
    // Add event listener to form submission
    document.getElementById('addWorkoutForm').addEventListener('submit', addWorkout);
    editProfileButton.addEventListener('click', function() {
        profileInfo.style.display = 'none';
        editProfileForm.style.display = 'block';
        // Pre-fill form with user data
        // prefillFormData();
    });

    // Load existing workouts
    loadWorkouts();
});

function loadWorkouts() {
    // Substitute with the correct API endpoint for listing workouts
    fetch('/api/workouts/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // Include authorization header as needed
        }
    })
    .then(response => response.json())
    .then(workouts => {
        const container = document.querySelector('.workouts-container');
        workouts.forEach(workout => {
            const workoutElement = document.createElement('div');
            workoutElement.innerHTML = `<h3>${workout.name}</h3><p>${workout.description || ''}</p><small>Date: ${new Date(workout.date).toLocaleDateString()}</small>`;
            container.appendChild(workoutElement);
        });
    })
    .catch(error => console.error('Error:', error));
}

function addWorkout(event) {
    event.preventDefault();
    // Get form data
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    // Substitute with the correct API endpoint for adding a workout
    fetch('/api/workouts/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Include authorization header as needed
        },
        body: JSON.stringify({ name, description, date })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Reload workouts to show the newly added workout
        loadWorkouts();
    })
    .catch(error => console.error('Error:', error));
}