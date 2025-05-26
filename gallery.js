// Configuration
const config = {
    imagesToShow: 18, // Number of random images to display initially
    categories: [
        'team-vibes',
        'creative-campaigns',
        'play-hard',
        'behind-scenes',
        'intern-highlights',
        'founder',
        'offices',
        '1st-aniversary',
        '2nd-aniversary'
    ],
    imagePaths: {
        'team-vibes': Array.from({length: 42}, (_, i) => `team-vibes/h (${i + 1}).jpg`),
        'creative-campaigns': Array.from({length: 25}, (_, i) => `creative-campaigns/c (${i + 1}).jpg`),
        'play-hard': Array.from({length: 5}, (_, i) => `play-hard/g (${i + 1}).jpg`),
        'behind-scenes': Array.from({length: 37}, (_, i) => `behind-scenes/b (${i + 1}).jpg`),
        'intern-highlights': Array.from({length: 7}, (_, i) => `intern-highlights/e (${i + 1}).jpg`),
        'founder': Array.from({length: 7}, (_, i) => `founder/d (${i + 1}).jpg`),
        'offices': Array.from({length: 3}, (_, i) => `offices/f (${i + 1}).jpg`),
        '1st-aniversary': ['1st-aniversary/1.jpg'],
        '2nd-aniversary': Array.from({length: 9}, (_, i) => `2nd-aniversary/a (${i + 1}).jpg`)
    }
};

// DOM Elements
const galleryContainer = document.querySelector('.gallery-container');
const filterButtons = document.querySelectorAll('.filter-menu li');
const imagePopup = document.querySelector('.image-popup');
const popupImage = imagePopup.querySelector('img');
const closeButton = imagePopup.querySelector('.close-btn');
const reactionButtons = document.querySelectorAll('.reaction-btn');

// State management
let currentCategory = 'all';
let currentImages = [];
let userReactions = loadReactionsFromLocalStorage();

// Helper Functions
function getRandomImages(count) {
    let allImages = [];
    
    // Create array of all images with their categories
    config.categories.forEach(category => {
        config.imagePaths[category].forEach(path => {
            allImages.push({
                path: path,
                category: category
            });
        });
    });
    
    // Shuffle the array
    allImages = shuffleArray(allImages);
    
    // Return requested number of images
    return allImages.slice(0, count);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function getCategoryImages(category) {
    if (category === 'all') {
        return getRandomImages(config.imagesToShow);
    } else {
        const categoryImages = config.imagePaths[category].map(path => ({
            path: path,
            category: category
        }));
        return shuffleArray(categoryImages).slice(0, config.imagesToShow);
    }
}

function formatCategoryName(category) {
    return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function saveReactionsToLocalStorage() {
    localStorage.setItem('galleryReactions', JSON.stringify(userReactions));
}

function loadReactionsFromLocalStorage() {
    const saved = localStorage.getItem('galleryReactions');
    return saved ? JSON.parse(saved) : {};
}

// UI Functions
function renderGallery() {
    // Clear gallery
    galleryContainer.innerHTML = '';
    
    // Get images based on current category
    currentImages = getCategoryImages(currentCategory);
    
    // Render images
    currentImages.forEach((image, index) => {
        const delay = index * 50; // Stagger animation
        const imageElement = createGalleryItem(image, delay);
        galleryContainer.appendChild(imageElement);
    });
}

function createGalleryItem(image, delay) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${delay}ms`;
    item.dataset.path = image.path;
    item.dataset.category = image.category;
    
    const img = document.createElement('img');
    img.src = image.path;
    img.alt = `Image from ${formatCategoryName(image.category)}`;
    img.loading = 'lazy';
    
    const categoryTag = document.createElement('div');
    categoryTag.className = 'category-tag';
    categoryTag.textContent = formatCategoryName(image.category);
    
    const info = document.createElement('div');
    info.className = 'item-info';
    
    const reactions = document.createElement('div');
    reactions.className = 'reactions';
    
    // Add reaction indicators if this image has reactions
    if (userReactions[image.path]) {
        Object.entries(userReactions[image.path]).forEach(([reaction, isActive]) => {
            if (isActive) {
                const reactionIcon = document.createElement('div');
                reactionIcon.className = 'reaction-icon';
                
                let icon = '';
                switch (reaction) {
                    case 'love': icon = '<i class="fas fa-heart"></i>'; break;
                    case 'clap': icon = '<i class="fas fa-hands-clapping"></i>'; break;
                    case 'wow': icon = '<i class="fas fa-face-surprise"></i>'; break;
                    case 'laugh': icon = '<i class="fas fa-face-laugh"></i>'; break;
                }
                
                reactionIcon.innerHTML = icon;
                reactions.appendChild(reactionIcon);
            }
        });
    }
    
    info.appendChild(reactions);
    item.appendChild(img);
    item.appendChild(categoryTag);
    item.appendChild(info);
    
    // Add click event
    item.addEventListener('click', () => openImagePopup(image));
    
    return item;
}

function openImagePopup(image) {
    // Set image source
    popupImage.src = image.path;
    popupImage.alt = `Image from ${formatCategoryName(image.category)}`;
    
    // Update reaction buttons
    updateReactionButtons(image.path);
    
    // Show popup
    imagePopup.classList.add('active');
    
    // Store current image path for reaction handling
    imagePopup.dataset.currentPath = image.path;
}

function closeImagePopup() {
    imagePopup.classList.remove('active');
}

function updateReactionButtons(imagePath) {
    // Reset all buttons
    reactionButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // If user has reacted to this image, set active state
    if (userReactions[imagePath]) {
        reactionButtons.forEach(btn => {
            const reaction = btn.dataset.reaction;
            if (userReactions[imagePath][reaction]) {
                btn.classList.add('active');
            }
        });
    }
}

function toggleReaction(reaction, imagePath) {
    // Initialize if needed
    if (!userReactions[imagePath]) {
        userReactions[imagePath] = {};
    }
    
    // Toggle reaction
    userReactions[imagePath][reaction] = !userReactions[imagePath][reaction];
    
    // Update UI
    updateReactionButtons(imagePath);
    saveReactionsToLocalStorage();
    
    // Also update the gallery item's reactions display
    updateGalleryItemReactions(imagePath);
}

function updateGalleryItemReactions(imagePath) {
    const galleryItem = document.querySelector(`.gallery-item[data-path="${imagePath}"]`);
    if (galleryItem) {
        const reactionsContainer = galleryItem.querySelector('.reactions');
        reactionsContainer.innerHTML = '';
        
        // Add reaction indicators
        if (userReactions[imagePath]) {
            Object.entries(userReactions[imagePath]).forEach(([reaction, isActive]) => {
                if (isActive) {
                    const reactionIcon = document.createElement('div');
                    reactionIcon.className = 'reaction-icon';
                    
                    let icon = '';
                    switch (reaction) {
                        case 'love': icon = '<i class="fas fa-heart"></i>'; break;
                        case 'clap': icon = '<i class="fas fa-hands-clapping"></i>'; break;
                        case 'wow': icon = '<i class="fas fa-face-surprise"></i>'; break;
                        case 'laugh': icon = '<i class="fas fa-face-laugh"></i>'; break;
                    }
                    
                    reactionIcon.innerHTML = icon;
                    reactionsContainer.appendChild(reactionIcon);
                }
            });
        }
    }
}

// Event Listeners
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update current category and re-render
        currentCategory = button.dataset.category;
        renderGallery();
    });
});

closeButton.addEventListener('click', closeImagePopup);

// Close when clicking outside the image
imagePopup.addEventListener('click', event => {
    if (event.target === imagePopup) {
        closeImagePopup();
    }
});

// Handle reaction buttons
reactionButtons.forEach(button => {
    button.addEventListener('click', () => {
        const reaction = button.dataset.reaction;
        const imagePath = imagePopup.dataset.currentPath;
        toggleReaction(reaction, imagePath);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && imagePopup.classList.contains('active')) {
        closeImagePopup();
    }
});

// Initialize gallery
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
});