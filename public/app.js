/*
 * Name: MB
 * Revised: 06/03/2025
 * Original Date: 12/2/2021
 * File: ./app.js
 */

// Game state variables
let answer = '';
let maxWrong = 10;
let diff_setting = 'Easy';
let mistakes = 0;
let guessed = [];
let wordStatus = null;

function handleGuess(chosenLetter) {
  if (guessed.indexOf(chosenLetter) === -1) guessed.push(chosenLetter);
  document.getElementById(chosenLetter).setAttribute('disabled', true);

  if (answer.indexOf(chosenLetter) >= 0) {
    guessedWord();
    checkIfGameWon();
  } else {
    mistakes++;
    updateMistakes();
    checkIfGameLost();
  }
}

function checkIfGameWon() {
  if (wordStatus === answer) {
    document.getElementById('keyboard').innerHTML = 'Good job!';
  }
}

function checkIfGameLost() {
  if (mistakes === maxWrong) {
    document.getElementById('wordSpotlight').innerHTML = 'The answer was: ' + answer;
    document.getElementById('keyboard').innerHTML = 'Better luck next time!';
  }
}

function guessedWord() {
  wordStatus = answer.split('').map(letter => (guessed.indexOf(letter) >= 0 ? letter : " _ ")).join('');
  document.getElementById('wordSpotlight').innerHTML = wordStatus;
}

function updateMistakes() {
  document.getElementById('mistakes').innerHTML = mistakes;
}

function generateButtons() {
  let buttonsHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter =>
    `<button class="keys" id='${letter}' onClick="handleGuess('${letter}')">${letter}</button>`
  ).join('');

  document.getElementById('keyboard').innerHTML = buttonsHTML;
}

function restart() {
  let defaultSelection = 'Easy';
  mistakes = 0;
  guessed = [];
  guessedWord();
  updateMistakes();
  generateButtons();
  setDifficulty(defaultSelection);
}

function setDifficulty(difficulty) {
  diff_setting = difficulty;
  mistakes = 0;
  guessed = [];
  fetchWordFromAPI(diff_setting);
  guessedWord();
  updateMistakes();
  generateButtons();
  guessDifficulty(diff_setting);
}

function guessDifficulty(difficulty) {
  if (difficulty === 'Easy') {
    maxWrong = 10;
  } else if (difficulty === 'Medium') {
    maxWrong = 7;
  } else if (difficulty === 'Hard') {
    maxWrong = 5;
  } else {
    maxWrong = 10;
  }
  document.getElementById('maxWrong').innerHTML = maxWrong;
}

function fetchWordFromAPI(difficulty) {
  fetch(`/api/word?difficulty=${difficulty}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      answer = data.word;
      guessedWord();
      generateButtons();
      updateMistakes();
      guessDifficulty(difficulty);
    })
    .catch(error => {
      console.error('Error fetching word from API:', error);
      answer = 'FALLBACK';
      guessedWord();
      generateButtons();
      updateMistakes();
      guessDifficulty(difficulty);
    });
}

// Initial game start
fetchWordFromAPI(diff_setting);
