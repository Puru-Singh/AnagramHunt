// --- GAME DATA ---
const sourceWord = 'POINTER';
const uniqueChars = [...new Set(sourceWord.split(''))].sort();
const possibleWords = [
    // 'eon', 'eir', 'ent', 'eon', 'ern', 'ion', 'ire', 'net', 'nip', 'nit', 'nor', 'not', 'one', 'ope', 'opt', 'ore',
    // 'ort', 'pen', 'per', 'pet', 'pie', 'pin', 'pit', 'poi', 'pon', 'pot', 'pro', 'rei', 'rep', 'ret', 'rin', 'rip',
    // 'roe', 'rot', 'ten', 'tie', 'tin', 'tip', 'toe', 'ton', 'top', 'tor', 'tri', 'inept', 'inter', 'intro', 'irone',
    // 'netop', 'nitro', 'noire', 'niter', 'nitre', 'nope', 'note', 'often', 'ofter', 'opine', 'opter', 'orient', 'orpin',
    // 'pein', 'pent', 'peon', 'peri', 'pert', 'pine', 'pinto', 'pion', 'pirn', 'poet', 'point', 'ponte', 'pore', 'port',
    // 'pote', 'prion', 'print', 'prone', 'protein', 'ptr', 'rein', 'rent', 'repin', 'repot', 'ripe', 'ripen', 'rite',
    // 'rope', 'rote', 'tenor', 'tern', 'tier', 'tine', 'tire', 'tone', 'toner', 'tope', 'toper', 'tore', 'tori', 'torn',
    // 'trip', 'tripe', 'trop', 'trone', 'tropin', 'repoint'
    'eon','ern','inert','inter','intern','into','intro','ion','ire','iron','irone','net','nip','nit','nitro','noir','nor','nope',
    'nori','not','note','noter','one','open','opine','opt','ore','orpin','ort','pen','pent','peon','per','peri','pert','pet',
    'pie','pier','pin','pine','piner','pinot','pint','pinto','pion','pirn','pit','poet','poi','point','pointer','pone','pont','pontie',
    'pore','port','pot','pre','prion','pro','prone','protei','protein','rein','rent','rep','repin','repo','repoint',
    'repot','ret','rin','rip','ripe','ripen','rite','roe','ropent','rope','rot','rote','roti','ten','tenio','tenor','tern',
    'tie','tin','tine','tip','tire','tiro','toe','ton','tone','toner','tonier','top','tope','toper','topi','tor','tore','tori',
    'torn','trine','trio','trip','tripe','tron','trope','tropine'
].map(word => word.toLowerCase());

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
function startGame() {
    startPopup.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameContainer.classList.add('fade-in');
    wordInput.focus();
    timerId = setInterval(updateTimer, 1000);
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
 * Handles the word submission logic.
 */
// function handleWordSubmit(e) {
//     e.preventDefault();
//     const rawWord = wordInput.value;
//     if (!rawWord) return;

//     const processedWord = preprocessWord(rawWord);

//     // if (possibleWords.includes(processedWord) && !guessedWords.hasOwnProperty(processedWord)) {
//     if (possibleWords.includes(processedWord) && !guessedWords.find(entry => entry.word === processedWord)) {
//         // --- STREAK LOGIC START ---
//         const now = performance.now(); // Get high-precision timestamp
//         const timeSinceLastGuess = (now - lastGuessTimestamp) / 1000; // Time in seconds

//         // If it's the first guess or the player was too slow, reset streak
//         if (lastGuessTimestamp === 0 || timeSinceLastGuess > 3) {
//             streakCount = 1;
//             isStreakActive = false;
//         } else {
//             // Player was fast enough, increment streak
//             streakCount++;
//         }
//         lastGuessTimestamp = now; // Update timestamp for the next guess

//         let bonusPoints = 0;
//         // Check if a new streak has just been achieved
//         if (!isStreakActive && streakCount >= 3) {
//             isStreakActive = true;
//             // Retroactively award bonus points for the 3 words that started the streak
//             totalScore += 3; 
//             // We need to find the keys of the last 2 guessed words to update their bonus
//             const guessedKeys = Object.keys(guessedWords);
//             const lastTwoKeys = guessedKeys.slice(-2);
//             lastTwoKeys.forEach(key => {
//                 guessedWords[key].bonus = 1;
//             });
//         }

//         if (isStreakActive) {
//             bonusPoints = 1;
//         }
//         // --- STREAK LOGIC END ---

//         const points = processedWord.length;
//         totalScore += points; // Add base points

//         const currentTime = 60 - timeLeft;
//         const timeTaken = currentTime - lastGuessTime;
//         lastGuessTime = currentTime;

//         // Store all word data, including bonus
//         //guessedWords[processedWord] = { points: points, bonus: bonusPoints, time: timeTaken };
//         guessedWords.push({ word: processedWord, points: points, bonus: bonusPoints, time: timeTaken });
//         updateScoreboard();

//     } else {
//         showNotification();
//     }

//     wordInput.value = '';
// }
function handleWordSubmit(e) {
    e.preventDefault();
    const rawWord = wordInput.value;
    if (!rawWord) return;

    const processedWord = preprocessWord(rawWord);

    if (possibleWords.includes(processedWord) && !guessedWords.find(entry => entry.word === processedWord)) {
        const now = performance.now();
        const timeSinceLastGuess = (now - lastGuessTimestamp) / 1000;

        if (lastGuessTimestamp === 0 || timeSinceLastGuess > 3) {
            streakCount = 1;
            isStreakActive = false;
        } else {
            streakCount++;
        }
        lastGuessTimestamp = now;

        let bonusPoints = 0;
        if (!isStreakActive && streakCount >= 3) {
            isStreakActive = true;
            totalScore += 3; // Add +1 for this word and the previous two
            // Update the last two words in the array to give them their bonus
            if (guessedWords.length >= 2) {
                guessedWords[guessedWords.length - 1].bonus = 1;
                guessedWords[guessedWords.length - 2].bonus = 1;
            }
        }

        if (isStreakActive) {
            bonusPoints = 1;
        }

        const points = processedWord.length;
        // IMPORTANT: Don't add bonus points to totalScore here, it's done retroactively or in updateScoreboard
        totalScore += points;

        const currentTime = 60 - timeLeft;
        const timeTaken = currentTime - lastGuessTime;
        lastGuessTime = currentTime;

        guessedWords.push({ word: processedWord, points: points, bonus: bonusPoints, time: timeTaken });
        updateScoreboard();

    } else {
        showNotification();
    }

    wordInput.value = ''; // This line will now be reached correctly.
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
// At the top of the file, add this new function
async function fetchAndDisplayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    try {
        // The URL will be relative to your Vercel deployment
        const response = await fetch('/api/leaderboard'); 
        const scores = await response.json();

        if (scores.length === 0) {
            leaderboardList.innerHTML = '<p class="text-gray-400">No scores yet. Be the first!</p>';
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

// EndGame function
// async function endGame() {
//     clearInterval(timerId);
//     gameContainer.classList.add('hidden');
//     gameOverScreen.classList.remove('hidden');

//     finalScoreDisplay.textContent = totalScore;
//     // The code to display your found words remains the same...
//     const sortedWords = Object.entries(guessedWords).sort((a, b) => b[1].points - a[1].points || a[0].localeCompare(b[0]));
//     if (sortedWords.length > 0) {
//          finalWordsList.innerHTML = `
//             <div class="grid grid-cols-3 gap-x-4 text-left font-bold border-b border-secondary-color/30 pb-2 mb-2">
//                 <span>Word</span>
//                 <span class="text-center">Points</span>
//                 <span class="text-right">Time Taken</span>
//             </div>
//             ${sortedWords.map(([word, data]) =>
//             `<div class="grid grid-cols-3 gap-x-4 text-left py-1">
//                 <span>${word}</span>
//                 <span class="font-bold accent-text text-center">${data.points}</span>
//                 <span class="text-gray-400 text-right">+${data.time}s</span>
//             </div>`
//         ).join('')}`;
//      } else {
//         finalWordsList.innerHTML = `<p class="text-center text-gray-400">You didn't find any words.</p>`;
//         copyButton.classList.add('hidden');
//     }

//     // --- UPDATED LEADERBOARD LOGIC ---
//     if (totalScore > 0) {
//         const playerName = await getPlayerName(); // Wait for user to submit name
//         if (playerName && playerName.trim()) {
//             await fetch('/api/add-score', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ name: playerName.trim(), score: totalScore }),
//             });
//         }
//     }

//     // Fetch and show the leaderboard after submitting the score
//     fetchAndDisplayLeaderboard();
// }
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

    // --- LEADERBOARD LOGIC (No changes needed here) ---
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
    const wordsToCopy = Object.keys(guessedWords).join(', ');
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

    // Attach event listeners after the DOM is ready
    startButton.addEventListener('click', startGame);
    copyButton.addEventListener('click', copyResultsToClipboard);
    form.addEventListener('submit', handleWordSubmit);
});
