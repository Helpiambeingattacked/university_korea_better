// This file manages the modal view functionality, displaying detailed information about a university when a card is clicked.

const modal = document.getElementById('universityModal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModal');

// Function to open the modal and display university details
function openModal(university) {
    modalContent.innerHTML = `
        <h2>${university.name}</h2>
        <img src="assets/images/${university.image}" alt="${university.name} logo" />
        <p><strong>Type:</strong> ${university.type}</p>
        <p><strong>Region:</strong> ${university.region}</p>
        <p>${university.description}</p>
        <a href="${university.website}" target="_blank">Visit Website</a>
    `;
    modal.style.display = 'block';
}

// Function to close the modal
function closeModal() {
    modal.style.display = 'none';
}

// Event listener for closing the modal
closeModalBtn.addEventListener('click', closeModal);

// Event listener for closing the modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// Export functions for use in other modules
export { openModal, closeModal };