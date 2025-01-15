
const routes = {

    welcomePage: `
        <div class="logo">
            <img src="media/Dr. Knows.png" alt="Logo" width="200"> 
        </div>
        <h1>Welcome to the Home Page</h1>
        <p>This is the main page of our app.</p>
        <span class="welcome"><button onclick="location.href = '#mainPage'">Next page</button></span>
    `,

    mainPage: `
        <div class="counter">
            Go to card: 
            <input type="number" id="cardInput" min="1" placeholder="#">
            <button onclick="goToCard()">Go</button>
            <span>| Card <span id="currentCard">1</span> of <span id="totalCards">0</span></span>
        </div>

        <div class="nav-controls">
            <button class="random-btn" onclick="goToRandomCard()">
                Random Card
            </button>
        </div>

        <div class="nav-arrow prev" onclick="navigateCards('prev')">←</div>
        <div class="nav-arrow next" onclick="navigateCards('next')">→</div>
        <div class="container" id="cardContainer"></div>
        <div class="instructions">Swipe, use arrows, or type card number to navigate</div>
        `,
};

const blankCanvas = document.getElementById('blankCanvas');

function renderWholePage() {
    const hash = location.hash.slice(1) || 'welcomePage'; // Remove the '#' from the hash
    blankCanvas.innerHTML = routes[hash] || `<h1>404</h1><p>Page not found.</p>`;

    if (hash === 'mainPage') {
        fetchAndRenderCards();;
    }
}

window.addEventListener('hashchange', renderWholePage);

renderWholePage();





let wordGroups = [];
let currentIndex = 0;

function updateCardPosition(card, index, deltaX = 0) {
    const offset = index - currentIndex;
    
    // Only show cards from current to current + 4
    if (offset >= 0 && offset < 5) {
        const translateZ = -offset * 30;
        const translateY = offset * 8;
        const rotation = deltaX * 0.1;
        const scale = 1 - (offset * 0.05);
        
        card.style.transform = `
            translateX(${deltaX}px)
            translateY(${translateY}px)
            translateZ(${translateZ}px)
            rotateY(${rotation}deg)
            scale(${scale})
        `;
        card.style.zIndex = 10 - offset;
        card.classList.add('visible');
        
        // Only allow interaction with the top card
        if (offset === 0) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    } else {
        card.classList.remove('visible', 'active');
        card.style.transform = 'translateZ(-1000px)';
        card.style.zIndex = -1;
    }
}

function renderCards(groups) {
    const container = document.getElementById('cardContainer');
    container.innerHTML = '';
    
    document.getElementById('totalCards').textContent = groups.length;
    document.getElementById('currentCard').textContent = currentIndex;

    groups.forEach((group, index) => {
        const card = document.createElement('div');
        card.className = 'card';

        // const background = document.createElement('img');
        // background.src = 'media/border.png';
        // card.appendChild(background);
        
        const title = document.createElement('h2');
        title.textContent = group.Group;
        card.appendChild(title);

        const list = document.createElement('ol');
        list.className = 'word-list';
        
        group.Words.forEach(word => {
            const li = document.createElement('li');
            li.textContent = word;
            list.appendChild(li);
        });

        card.appendChild(list);
        container.appendChild(card);
        updateCardPosition(card, index);
    });

    updateArrows();
    initializeCardInteractions();
}


function initializeCardInteractions() {
    const cards = document.querySelectorAll('.card.active');
    
    cards.forEach((card) => {
        const hammer = new Hammer(card);
        
        hammer.on('pan', (e) => {
            const cardIndex = Array.from(card.parentNode.children).indexOf(card);
            updateCardPosition(card, cardIndex, e.deltaX);
        });

        hammer.on('panend', (e) => {
            if (Math.abs(e.deltaX) > 100) {
                if (e.deltaX > 0 && currentIndex > 0) {
                    currentIndex--;
                } else if (e.deltaX < 0 && currentIndex < wordGroups.length - 1) {
                    currentIndex++;
                }
                renderCards(wordGroups);
            } else {
                const cardIndex = Array.from(card.parentNode.children).indexOf(card);
                updateCardPosition(card, cardIndex, 0);
            }
        });
    });
}

async function fetchAndRenderCards() {
    try {
        const response = await fetch('convertJson.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        wordGroups = await response.json();
        
        if (!Array.isArray(wordGroups)) {
            throw new Error("JSON data is not an array");
        }
        
        renderCards(wordGroups);
        updateArrows(); // Initialize arrows state
    } catch (error) {
        console.error("Error loading JSON data:", error);
        alert("Failed to load word groups");
    }
}




function updateArrows() {
    const prevArrow = document.querySelector('.nav-arrow.prev');
    const nextArrow = document.querySelector('.nav-arrow.next');
    
    prevArrow.classList.toggle('disabled', currentIndex === 0);
    nextArrow.classList.toggle('disabled', currentIndex === wordGroups.length - 1);
}

function navigateCards(direction) {
    if (direction === 'prev' && currentIndex > 0) {
        currentIndex--;
        renderCards(wordGroups);
    } else if (direction === 'next' && currentIndex < wordGroups.length - 1) {
        currentIndex++;
        renderCards(wordGroups);
    }
    updateArrows();
}

function goToCard() {
    const input = document.getElementById('cardInput');
    const cardNumber = parseInt(input.value);
    
    if (cardNumber >= 1 && cardNumber <= wordGroups.length) {
        currentIndex = cardNumber;
        renderCards(wordGroups);
        updateArrows();
        input.value = ''; // Clear input after use
    } else {
        alert(`Please enter a number between 1 and ${wordGroups.length}`);
    }
}

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        navigateCards('prev');
    } else if (e.key === 'ArrowRight') {
        navigateCards('next');
    }
});

function goToRandomCard () {
    const randomIndex = Math.floor(Math.random() * wordGroups.length);
    currentIndex = randomIndex;
    renderCards(wordGroups);
    updateArrows();
};