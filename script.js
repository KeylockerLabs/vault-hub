const searchInput = document.getElementById('search-input');
const documentGrid = document.getElementById('document-grid');
const docCount = document.getElementById('doc-count');
const noResults = document.getElementById('no-results');
const cards = documentGrid.querySelectorAll('.doc-card');
const totalDocs = cards.length;

// Updates the count dynamically on page load based on the total number of cards!
docCount.textContent = 'Showing ' + totalDocs + ' of ' + totalDocs + ' documents';


searchInput.addEventListener('input', function () {
    const query = this.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(function (card) {
        // Get all text inside this card and the person data attribute
        const textContent = card.textContent.toLowerCase();
        const person = card.getAttribute('data-person');

        // Check if the query matches the card's content or person name
        const matchesSearch = query === '' || textContent.includes(query) || person.includes(query);

        if (matchesSearch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Update the document count display
    docCount.textContent = 'Showing ' + visibleCount + ' of ' + totalDocs + ' documents';

    // Show a no-results message when nothing matches
    if (visibleCount === 0 && query !== '') {
        noResults.classList.add('visible');
    } else {
        noResults.classList.remove('visible');
    }
});

async function loadBlobUrls() {
    try {
        const response = await fetch('blob-map.json');
        const urlMap = await response.json();

        // Target all buttons that point to a PDF file name
        const viewButtons = document.querySelectorAll('.view-btn[data-file]');

        viewButtons.forEach(button => {
            const fileName = button.getAttribute('data-file');
            if (urlMap[fileName]) {
                button.href = urlMap[fileName]; // Overwrite with secure Vercel Blob URL!
            }
        });
        console.log('Successfully mapped PDFs to Vercel Blob URLs!');
    } catch (error) {
        console.error('Failed to map blob URLs:', error);
    }
}

// Start mapping on page load
loadBlobUrls();