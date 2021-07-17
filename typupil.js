'use strict';
let currentLevel = 0;
let currentScore = 0;
let initialized = false;
let keyToPress;
const scoreboardEl = document.getElementById('scoreboard');
const levelEl = document.getElementById('level');
const targetEl = document.getElementById('target');
const appContainerEl = document.getElementById('appContainer');
const keypressedEl = document.getElementById('keypressed');
const synth = window.speechSynthesis;
synth.cancel();
const speechCache = {};

const NO_KEY = 'NO_KEY';

// keys = [layerIndex][keyColumnIndex]
const keys = [
    // Layer 0
    [
        // Column 1 (right-most column of keys)
        [
            {
                display: 'a | layer 3',
                key: 'a',
            },
            {
                display: 'b',
                key: 'b',
            },
            {
                display: 'c',
                key: 'c',
            },
            {
                display: 'd',
                key: 'd',
            },
        ],

        // Column 2 (middle column)
        [
            {
                display: 'e | layer 2',
                key: 'e',
            },
            {
                display: 'f',
                key: 'f',
            },
            {
                display: 'g',
                key: 'g',
            },
            {
                display: 'h',
                key: 'h',
            },
        ],

        // Column 3 (left-most column)
        [
            {
                display: 'Space | layer 1',
                key: 'Space',
            },
            {
                display: 'Delete',
                key: 'Delete',
            },
            {
                display: 'Backspaceg',
                key: 'Backspace',
            },
            {
                display: 'h',
                key: 'h',
            },
        ],
    ],

    // Layer 1
    [
        // Column 1 (right-most column of keys)
        [
            NO_KEY,
            {
                display: 'i',
                key: 'i',
            },
            {
                display: 'j',
                key: 'j',
            },
            {
                display: 'k',
                key: 'k',
            },
        ],

        // Column 2 (middle column)
        [
            NO_KEY,
            {
                display: 'l',
                key: 'l',
            },
            {
                display: 'm',
                key: 'm',
            },
            {
                display: 'n',
                key: 'n',
            },
        ],

        // Column 3 (left-most column)
        [
            NO_KEY,
            {
                display: 'o',
                key: 'o',
            },
            {
                display: 'p',
                key: 'p',
            },
            {
                display: 'q',
                key: 'q',
            },
        ],
    ],
];

const levels = [
    {
        level: 0,
        goal: 1000,
        keys: keys[0][0],
        // [
        //   {
        //     keys: keys[0][0],
        //     countdown: 10,
        //     score: 10,
        //   }
        // ],
    },

    {
        level: 1,
        goal: 2000,
        keys: [...keys[0][0], ...keys[0][1]],
    },

    {
        level: 2,
        goal: false,
        keys: [...keys[0][0], ...keys[0][1], ...keys[0][2]],
    },
];

// targetEl = levels[level]

/*
TODO

  add level display
  increase levels based on score

  add countdown timer
  if matched, use remaining time on timer as a score-multiplier 
  if timer reaches 0, start decrementing the score by 1 every second

  add audio for:
    success/match (score increase)
    failure/miss (score decrease)
    level up
    timer/countdown (last 3 seconds)
    timer/countdown (0 seconds)
    timer/countdown (negative, score decreasing)

  add another element in background that is the key to press. 

  add highscores (local)
  add scoreboards (global/internet)
*/

document.addEventListener('keydown', (e) => {
    if (!initialized) {
        keyToPress = getRandomKeyForCurrentLevel();
        targetEl.innerHTML = keyToPress.display;
        targetEl.setAttribute('data-key', keyToPress.key);
        initialized = true;
        keypressedEl.innerHTML = 'Press the key designated above.';
        levelEl.innerHTML = currentLevel;
        return;
    }

    keyToPress.xp_matches = keyToPress.xp_matches || 0;
    keyToPress.xp_misses = keyToPress.xp_misses || 0;
    keyToPress.xp_match_ratio = keyToPress.xp_match_ratio || 0;
    const key = (keypressedEl.innerHTML = e.key === ' ' ? 'Space' : e.key);
    const whatToSay = (speechCache[key] =
        speechCache[key] || new SpeechSynthesisUtterance(key));
    whatToSay.rate = 2;
    synth.cancel();
    synth.speak(whatToSay);

    // if matched
    if (targetEl.getAttribute('data-key') === key) {
        currentScore += 10;

        keyToPress.xp_matches += 1;
        keyToPress.xp_match_ratio =
            keyToPress.xp_matches /
            (keyToPress.xp_matches + keyToPress.xp_misses);
        console.log(keyToPress);

        // update next keyToPress
        let nextKeyToPress = getRandomKeyForCurrentLevel();
        while (keyToPress === nextKeyToPress) {
            nextKeyToPress = getRandomKeyForCurrentLevel();
        }
        keyToPress = nextKeyToPress;

        appContainerEl.classList.remove('flash-miss');
        appContainerEl.classList.remove('flash-match');
        void appContainerEl.offsetWidth; // hack to trigger reflow to allow animation to replay
        appContainerEl.classList.add('flash-match');

        // if missed
    } else {
        currentScore += 1;
        keyToPress.xp_misses += 1;
        keyToPress.xp_match_ratio =
            keyToPress.xp_matches /
            (keyToPress.xp_matches + keyToPress.xp_misses);
        console.log(keyToPress);
        appContainerEl.classList.remove('flash-match');
        appContainerEl.classList.remove('flash-miss');
        void appContainerEl.offsetWidth; // hack to trigger reflow to allow animation to replay
        appContainerEl.classList.add('flash-miss');
    }

    appContainerEl.classList.remove('initialState');

    keypressedEl.classList.remove('fade-out');
    void keypressedEl.offsetWidth; // hack to trigger reflow to allow animation to replay
    keypressedEl.classList.add('fade-out');

    scoreboardEl.innerHTML = currentScore;
    targetEl.innerHTML = keyToPress.display;
    targetEl.setAttribute('data-key', keyToPress.key);
});

function getRandomKeyForCurrentLevel() {
    let currLevelObj = levels[currentLevel];
    if (
        .goal &&
        currentScore >= levels[currentLevel].goal
    ) {
        currentLevel++;
        levelEl.innerHTML = currentLevel;
    }
    const currentLevelKeys = levels[currentLevel].keys;
    const randomKeyIndex = Math.floor(Math.random() * currentLevelKeys.length);
    return currentLevelKeys[randomKeyIndex];
}
