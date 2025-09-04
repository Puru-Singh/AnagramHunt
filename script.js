// --- GAME DATA ---

let sourceWord = '';
let uniqueChars = [];
let possibleWords = [];

// --- STATE VARIABLES ---
// let guessedWords = {}; // Now stores { word: { points, time } }
let guessedWords = []; 
let totalScore = 0;
let timeLeft = 60;
let timerId = null;
let lastGuessTime = 0; // Time of the last successful guess

// Variables for maintaining streak.
let streakCount = 0;
let lastGuessTimestamp = 0; // Tracks the precise time of the last guess
let isStreakActive = false;
let streakGlowTimerId = null;

// --- DOM ELEMENTS ---
const startPopup = document.getElementById('start-popup');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const timerDisplay = document.getElementById('timer');
const charContainer = document.getElementById('char-container');
const wordInput = document.getElementById('word-input');
const guessDisplay = document.getElementById('guess-display');
const totalScoreDisplay = document.getElementById('total-score');
const guessedWordsList = document.getElementById('guessed-words-list');
const guessedWordsPlaceholder = document.getElementById('guessed-words-placeholder');
const guessedWordsContainer = document.getElementById('guessed-words-container'); 
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const finalWordsList = document.getElementById('final-words-list');
const notification = document.getElementById('notification');
const copyButton = document.getElementById('copy-button');
const popupOverlay = document.getElementById('popup-overlay');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');

/**
 * Initializes the game UI.
 */
function setupUI() {
    charContainer.innerHTML = uniqueChars.map(char =>
        `<div class="bg-black/20 border border-secondary-color/50 text-accent-color w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xl md:text-2xl font-bold rounded-lg">${char}</div>`
    ).join('');

}

/**
 * Starts the game.
 */
async function startGame() {
    // Show loading indicator and disable the button
    const startButton = document.getElementById('start-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    startButton.disabled = true;
    loadingIndicator.classList.remove('hidden');

    try {
        // Fetch a random word from our new API
        const response = await fetch('/api/get-word');
        if (!response.ok) {
            throw new Error('Failed to load word');
        }
        const wordData = await response.json();

        // Assign the fetched data to our variables
        sourceWord = wordData.sourceWord.toUpperCase();
        possibleWords = wordData.possibleWords.map(word => word.toLowerCase());
        uniqueChars = [...new Set(sourceWord.split(''))].sort();

        // Now that we have the data, set up the UI and start the game
        setupUI(); // We need to call this again to draw the new letters

        startPopup.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        gameContainer.classList.add('fade-in');
        wordInput.focus();
        timerId = setInterval(updateTimer, 1000);

    } catch (error) {
        console.error(error);
        loadingIndicator.textContent = 'Could not load word. Please try again.';
        startButton.disabled = false; // Re-enable button on error
    }
}
/**
 * Updates the timer and ends the game if time is up.
 */
function updateTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
        endGame();
    }
}

/**
 * Preprocesses a word to be lowercase and trimmed.
 */
function preprocessWord(word) {
    return word.toLowerCase().trim();
}

/**
 * Resets the game state and UI to their initial values.
 */
function resetGame() {
    // Reset state variables
    totalScore = 0;
    timeLeft = 60;
    guessedWords = [];
    streakCount = 0;
    lastGuessTimestamp = 0;
    isStreakActive = false;
    streakGlowTimerId = null;
    if (timerId) clearInterval(timerId);

    // Reset UI Elements
    totalScoreDisplay.textContent = '0';
    timerDisplay.textContent = '60';
    wordInput.value = '';
    wordInput.classList.remove('streak-active', 'time-bonus-glow');
    guessedWordsList.innerHTML = '';
    guessedWordsPlaceholder.classList.remove('hidden');
    document.getElementById('start-button').disabled = false;
    document.getElementById('loading-indicator').classList.add('hidden');
    copyButton.textContent = 'Copy Words';

    // Hide the game over screen and show the start popup
    gameOverScreen.classList.add('hidden');
    startPopup.classList.remove('hidden');
}


function handleWordSubmit(e) {
    e.preventDefault();
    try {
        const rawWord = wordInput.value;
        if (!rawWord) return;

        const processedWord = preprocessWord(rawWord);

        //improve this later.

        const isAlreadyGuessed = guessedWords.find(entry => entry.word === processedWord);
        const isValidWord = possibleWords.includes(processedWord);

        if (isAlreadyGuessed) {
            showNotification("Word already guessed!");
            return; // Stop the function here
        }

        if (!isValidWord) {
            showNotification("Invalid Word!");
            return; // Stop the function here
        }

        if (possibleWords.includes(processedWord) && !guessedWords.find(entry => entry.word === processedWord)) {

            // --- NEW: TIME BONUS LOGIC FOR 7-LETTER WORDS ---
            if (processedWord.length === 7) {
                // 1. Add 7 seconds to the timer
                timeLeft += 7;
                timerDisplay.textContent = timeLeft;

                // 2. Add green glow to the input for 2 seconds
                wordInput.classList.add('time-bonus-glow');
                setTimeout(() => {
                    wordInput.classList.remove('time-bonus-glow');
                }, 2000);

                // 3. Add a flash effect to the timer
                timerDisplay.classList.add('timer-flash');
                setTimeout(() => {
                    timerDisplay.classList.remove('timer-flash');
                }, 1000); // Remove after animation ends
            }
            const now = performance.now();
            const timeSinceLastGuess = (now - lastGuessTimestamp) / 1000;

            // Always clear the previous glow timer on a successful guess
            if (streakGlowTimerId) {
                clearTimeout(streakGlowTimerId);
            }

            if (lastGuessTimestamp === 0 || timeSinceLastGuess > 3) {
                // Streak is broken or it's the first word
                streakCount = 1;
                isStreakActive = false;
                wordInput.classList.remove('streak-active'); // Ensure glow is off
            } else {
                // Streak continues
                streakCount++;
            }
            lastGuessTimestamp = now;

            let bonusPoints = 0;
            // Check if a streak becomes active
            if (!isStreakActive && streakCount >= 3) {
                isStreakActive = true;
                // Retroactively add bonus to the two words that started the streak
                if (guessedWords.length >= 2) {
                    guessedWords[guessedWords.length - 1].bonus = 1;
                    guessedWords[guessedWords.length - 2].bonus = 1;
                }
            }

            if (isStreakActive) {
                bonusPoints = 1;
                wordInput.classList.add('streak-active'); // Turn on the glow

                // Set a new timer that will turn the glow off after 3 seconds
                streakGlowTimerId = setTimeout(() => {
                    wordInput.classList.remove('streak-active');
                }, 3000);
            }

            // --- (The rest of the scoring logic remains exactly the same) ---
            const currentTime = 60 - timeLeft;
            const timeTaken = currentTime - lastGuessTime;
            lastGuessTime = currentTime;

            guessedWords.push({
                word: processedWord,
                points: processedWord.length,
                bonus: bonusPoints,
                time: timeTaken
            });

            updateScoreboard();

        } else {
            showNotification();
        }
    } catch (error) {
        console.error("An error occurred during word submission:", error);
    } finally {
        wordInput.value = '';
    }
}

/**
 * Updates the scoreboard UI to show the last 3 words.
 */
function updateScoreboard() {
    if (guessedWords.length > 0) {
        guessedWordsPlaceholder.classList.add('hidden');
    }

    // Recalculate total score from the array to ensure it's always accurate
    totalScore = guessedWords.reduce((sum, entry) => sum + entry.points + entry.bonus, 0);
    totalScoreDisplay.textContent = totalScore;

    guessedWordsList.innerHTML = guessedWords.map(({ word, ...data }) => {
        const displayPoints = data.points + data.bonus;
        const bonusIndicator = data.bonus > 0 ?
            `<span class="text-green-400 font-bold text-sm ml-2">+1</span>` :
            '';

        return `
            <div class="flex justify-between items-center p-1.5 rounded-md animate-fade-in-short">
                <span>${word}</span>
                <span class="font-semibold accent-text">${displayPoints} ${bonusIndicator}</span>
            </div>
        `;
    }).join('');

    guessedWordsContainer.scrollTop = guessedWordsContainer.scrollHeight;
}

/**
 * Shows the "Invalid Word" notification.
 */
function showNotification() {
    notification.classList.remove('opacity-0', '-translate-y-10');
    notification.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
        notification.classList.remove('opacity-100', 'translate-y-0');
        notification.classList.add('opacity-0', '-translate-y-10');
    }, 2000);
}

/**
 * Ends the game and shows the final score.
 */
async function fetchAndDisplayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '<p class="text-gray-400">Loading today\'s scores...</p>';
    try {
        // The URL no longer needs the '?word=' parameter
        const response = await fetch('/api/leaderboard'); 
        const scores = await response.json();

        if (scores.length === 0) {
            leaderboardList.innerHTML = '<p class="text-gray-400">No scores yet today. Be the first!</p>';
            return;
        }

        leaderboardList.innerHTML = scores.map((entry, index) => `
            <div class="flex justify-between items-center py-1">
                <span>${index + 1}. ${entry.name}</span>
                <span class="font-bold accent-text">${entry.score}</span>
            </div>
        `).join('');
    } catch (error) {
        leaderboardList.innerHTML = '<p class="text-red-400">Could not load scores.</p>';
    }
}

//Endgame function
async function endGame() {
    clearInterval(timerId);
    gameContainer.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');

    finalScoreDisplay.textContent = totalScore;

    // Correctly sort the array of word objects by total points
    const sortedWords = [...guessedWords].sort((a, b) => {
        const scoreA = a.points + a.bonus;
        const scoreB = b.points + a.bonus;
        if (scoreB !== scoreA) {
            return scoreB - scoreA;
        }
        return a.word.localeCompare(b.word);
    });

    if (sortedWords.length > 0) {
        finalWordsList.innerHTML = `
            <div class="grid grid-cols-3 gap-x-4 text-left font-bold border-b border-secondary-color/30 pb-2 mb-2">
                <span>Word</span>
                <span class="text-center">Points</span>
                <span class="text-right">Time Taken</span>
            </div>
            ${sortedWords.map(({ word, ...data }) =>
            `<div class="grid grid-cols-3 gap-x-4 text-left py-1">
                <span>${word}</span>
                <span class="font-bold accent-text text-center">${data.points + data.bonus}</span>
                <span class="text-gray-400 text-right">+${data.time}s</span>
            </div>`
        ).join('')}`;
    } else {
        finalWordsList.innerHTML = `<p class="text-center text-gray-400">You didn't find any words.</p>`;
        copyButton.classList.add('hidden');
    }

    // --- LEADERBOARD LOGIC ---
    if (totalScore > 0) {
        const playerName = await getPlayerName();
        if (playerName && playerName.trim()) {
            await fetch('/api/add-score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: playerName.trim(), score: totalScore }),
            });
        }
    }

    fetchAndDisplayLeaderboard();
}

/**
 * Copies the list of guessed words to the clipboard.
 */
function copyResultsToClipboard() {
    // Correctly map the array to get the 'word' property from each entry
    const wordsToCopy = guessedWords.map(entry => entry.word).join(', ');
    if (!wordsToCopy) return;

    // Use a temporary textarea to hold the text and copy it
    const textArea = document.createElement('textarea');
    textArea.value = wordsToCopy;
    textArea.style.position = 'fixed'; // Avoid scrolling to bottom
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    // Provide user feedback
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
        copyButton.textContent = 'Copy Words';
    }, 2000);
}

/**
 * Shows a custom popup to get the player's name.
 * Returns a Promise that resolves with the entered name.
 */
function getPlayerName() {
    popupOverlay.classList.remove('hidden');
    nameInput.focus();

    return new Promise((resolve) => {
        nameForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Stop the form from reloading the page
            const playerName = nameInput.value;
            popupOverlay.classList.add('hidden');
            resolve(playerName);
        }, { once: true }); // Important: listener runs only once
    });
}

// --- INITIALIZATION & EVENT LISTENERS ---
// This ensures the script runs after the HTML document is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    setupUI();
    const form = document.getElementById('word-form'); // Get the form from HTML
    const newGameButton = document.getElementById('new-game-button'); // Get the new button


    // Attach event listeners after the DOM is ready
    startButton.addEventListener('click', startGame);
    copyButton.addEventListener('click', copyResultsToClipboard);
    form.addEventListener('submit', handleWordSubmit);
    newGameButton.addEventListener('click', resetGame);
});
