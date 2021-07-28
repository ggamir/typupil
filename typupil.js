'use strict';
let currentLevel = 0;
let currentScore = 0;
let isInitialized = false;
let isMessageMode = false;
let keyToPress;
const scoreboardEl = document.getElementById('scoreboard');
const levelEl = document.getElementById('level');
const targetEl = document.getElementById('target');
const messageEl = document.getElementById('message');
const appContainerEl = document.getElementById('appContainer');
const keypressedEl = document.getElementById('keypressed');
const scorebarEl = document.getElementById('score-bar');
const scorebarUpdateEl = document.getElementById('score-bar-update');
const heartsEl = document.getElementById('hearts');
const synth = window.speechSynthesis;
synth.cancel();
const speechCache = {};

const NO_KEY = 'NO_KEY';

const startAudio = new Audio('audio/sfx/rupee.wav'); //new Audio('sword shine 1.wav');
const mistakeAudio = new Audio('audio/sfx/small enemy hit.wav');
const matchAudio = new Audio('audio/sfx/life refill.wav');
// const levelUpAudio = new Audio('crystal.wav');
const levelUpAudio = new Audio('audio/sfx/heart piece 1.wav');
const messageAudio = new Audio('audio/sfx/message.wav');
const messageFinishedAudio = new Audio('audio/sfx/message finish.wav');
const rainBGAudio = new Audio('audio/sfx/LTTP_Rain_In.wav');
rainBGAudio.volume = 0.3;
rainBGAudio.loop = true;

const gameMusic = new Audio('audio/music/025_A_New_Town.mp3'); //'The Last Sylph.ogg');
gameMusic.loop = true;

const introMusic = new Audio('audio/music/03. time of the falling rain.mp3');
introMusic.volume = 0.6;
introMusic.loop = true;

let heartCount = 0;

// keys = [layerIndex][keyColumnIndex]
const keys = [
    // Layer 0
    [
        // Column 1 (right-most column of keys)
        [
            {
                display: 'a',
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
                display: 'e',
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
                display: 'Space',
                key: 'Space',
            },
            {
                display: 'Delete',
                key: 'Delete',
            },
            {
                display: 'Backspace',
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
        goal: 111,
        keys: [...keys[0][0]],
        message: [
            'Hello??? Is there someone there?',
            'After all this time...!',
            '...you are the only one that has heard us...',
            'Please, this world needs your help!',
            'It has been cast into darkness...',
            '...and we need your light! The only way is...',
            '... through expression!',
            'In this world, we can only express...',
            '...with words and typing!',
            'You have to build your stamina for expression...',
            '...with typing skills.',
            'Are you ready?',
            'Type the key above to begin!',
        ],
    },

    {
        level: 1,
        goal: 333,
        keys: [...keys[0][0]],
        message: [
            "That's it! That's how you build stamina!",
            "You're doing great! Keep going!",
        ],
    },

    {
        level: 2,
        goal: 555,
        keys: [...keys[0][0], ...keys[0][1]],
        message: ['Alright.', 'testing...', '...1...', '...2...', '...3...'],
    },

    {
        level: 3,
        goal: 888,
        keys: [...keys[0][0], ...keys[0][1]],
    },

    {
        level: 4,
        goal: 1111,
        keys: [...keys[0][0], ...keys[0][1], ...keys[0][2]],
    },

    {
        level: 5,
        goal: 1555,
        // keys: [...keys[0][0]],
        phrases: ['aba bab', 'cab', 'abc', 'bad babe'],
        message: ['Alright.', 'testing...', '...1...', '...2...', '...3...'],
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


  attacking monsters - each monster has a "key" associated with it
  and you type the key to attack it (in attack range); if incorrect, it misses.

  sometimes, more powerful enemies and monsters have words associated with them that need to be typed to attack the monster.

  bosses have whole sentences.

  after mastering all the keys, some monsters will not have any keys associated with it
  and you ahve to try all the keys to find out what hits it

  maybe typing specific words causes special attacks or using items like health potion

  if correct, it hits.

  maybe the sword is for one-off attacks.
  and theres a wand for "spells" which are words.
  perhaps theres a spellbook that has the words and also the required items.
  eg. for heal, you need some herbs, water, and honey, etc.
  

  lantern - fog of war around you. you have to increase the lantern to see more of the map
  if you are out of fuel/light, then on other player's maps, you appear faded.
  and for you everyone else is faded.

  pub to meet other players and party.

  guild to have guild reserves for light and letters and other items.
  
  typing letters correctly increases letters in "reserve" - used to send chat messages.
  incorrect typing reduces letters in reserve. when sending chat messages, it also uses up letters.
  if you don't have the ltter, then the message will be missing it.
  for instance, when you type the missing letter, there's a rejection sound and the letter is faded
*/

document.addEventListener('keydown', (e) => {
    if (!isInitialized) {
        isInitialized = true;
        startAudio.play();

        keypressedEl.innerHTML = '';
        levelEl.innerHTML = currentLevel;
        scoreboardEl.innerHTML = currentScore;
        // gameMusic.play();
        rainBGAudio.play();
        appContainerEl.classList.add('started');

        animateMessages(levels[0].message, keypressedEl, true).then(() => {
            appContainerEl.classList.add('firstKey');
            keyToPress = getRandomKeyForCurrentLevel();
            targetEl.innerHTML = keyToPress.display;
            targetEl.setAttribute('data-key', keyToPress.key);
        });
    }

    if (isMessageMode) {
        appContainerEl.classList.add('initialState');
        return;
    } else {
        if (appContainerEl.classList.contains('firstKey')) {
            appContainerEl.classList.remove('firstKey');
            introMusic.play();
        }

        appContainerEl.classList.remove('initialState');
    }

    keyToPress.xp_matches = keyToPress.xp_matches || 0;
    keyToPress.xp_misses = keyToPress.xp_misses || 0;
    keyToPress.xp_match_ratio = keyToPress.xp_match_ratio || 0;
    const key = (keypressedEl.innerHTML = e.key === ' ' ? 'Space' : e.key);
    const whatToSay = (speechCache[key] =
        speechCache[key] || new SpeechSynthesisUtterance(key));
    whatToSay.rate = 2;
    synth.cancel();
    // synth.speak(whatToSay);

    const matched = targetEl.getAttribute('data-key') === key;

    // if matched
    let scoreUpdate = 0;
    if (matched) {
        matchAudio.play();
        scoreUpdate += 10;

        keyToPress.xp_matches += 1;
        keyToPress.xp_match_ratio =
            keyToPress.xp_matches /
            (keyToPress.xp_matches + keyToPress.xp_misses);
        console.log(keyToPress);

        // update next keyToPress
        let nextKeyToPress = getRandomKeyForCurrentLevel(scoreUpdate);
        // while (keyToPress === nextKeyToPress) {
        //     nextKeyToPress = getRandomKeyForCurrentLevel(scoreUpdate);
        // }
        keyToPress = nextKeyToPress;

        appContainerEl.classList.remove('flash-miss');
        appContainerEl.classList.remove('flash-match');
        void appContainerEl.offsetWidth; // hack to trigger reflow to allow animation to replay
        appContainerEl.classList.add('flash-match');

        // if missed
    } else {
        mistakeAudio.play();
        scoreUpdate -= 5;
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

    keypressedEl.classList.remove('fade-out');
    void keypressedEl.offsetWidth; // hack to trigger reflow to allow animation to replay
    keypressedEl.classList.add('fade-out');

    currentScore += scoreUpdate;
    if (currentScore < 0) {
        currentScore = 0;
    }
    scoreboardEl.innerHTML = currentScore;

    let scorebarUpdateWidth = Math.round(
        (Math.abs(scoreUpdate) / levels[currentLevel].goal) * 100
    );
    let scorebarWidth = Math.round(
        (currentScore / levels[currentLevel].goal) * 100
    );
    if (currentLevel > 0) {
        scorebarWidth = Math.round(
            ((currentScore - levels[currentLevel - 1].goal) /
                (levels[currentLevel].goal - levels[currentLevel - 1].goal)) *
                100
        );
    }

    scorebarUpdateEl.style.marginLeft =
        scoreUpdate > 0 ||
        currentScore <= 0 ||
        (currentLevel > 0 && currentScore <= levels[currentLevel - 1].goal)
            ? 0
            : `-${scorebarUpdateWidth}%`;

    scorebarUpdateEl.animate(
        [
            {
                width: `${scorebarUpdateWidth}%`,
                // opacity: 0,
                marginLeft: scorebarUpdateEl.style.marginLeft,
            },
            // {
            //     opacity: 1,
            // },
            {
                width: '0px',
                // opacity: 1,
                marginLeft: 0,
            },
        ],
        {
            duration: 300,
            iterations: 1,
            fill: 'forwards',
        }
    );

    scorebarEl.animate(
        [
            {
                width: `${scorebarWidth}%`,
            },
        ],
        {
            duration: 300,
            iterations: 1,
            fill: 'forwards',
        }
    );

    if (matched) {
        const targetElAnimation = targetEl.animate(
            [
                {
                    transform: 'translate3D(0, -20px, 0) scale(.1)',
                    opacity: 0,
                },
            ],
            {
                duration: 100,
                iterations: 1,
            }
        );

        targetElAnimation.onfinish = () => {
            targetEl.innerHTML = keyToPress.display;
            targetEl.setAttribute('data-key', keyToPress.key);

            targetEl.animate(
                [
                    {
                        transform: 'translate3D(0, 20px, 0) scale(2)',
                        opacity: 0,
                    },
                    {
                        transform: 'translate3D(0, 0, 0) scale(1)',
                        opacity: 1,
                    },
                ],
                {
                    duration: 100,
                    iterations: 1,
                }
            );
        };
    } else {
        const variableScale = 0.95 + Math.random() * 0.05;
        const variableTranslate = 5 + Math.random();
        const variableIterations = 2 + Math.floor(Math.random() * 2);
        targetEl.animate(
            [
                {
                    transform: 'translate3D(0, 0, 0)',
                },
                {
                    transform: `translate3D(-${variableTranslate}px, 0, 0) scale(${variableScale})`,
                },
                {
                    transform: 'translate3D(0, 0, 0)',
                },
                {
                    transform: `translate3D(${variableTranslate}px, 0, 0) scale(${variableScale})`,
                },
                {
                    transform: 'translate3D(0, 0, 0)',
                },
            ],
            {
                duration: 200,
                iterations: variableIterations,
            }
        );
    }
});

function getRandomKeyForCurrentLevel(scoreUpdate) {
    let currLevelData = levels[currentLevel];
    if (
        currLevelData.goal &&
        currentScore + scoreUpdate >= currLevelData.goal
    ) {
        levelUpAudio.play();
        currentLevel++;
        levelEl.innerHTML = currentLevel;
        heartCount++;

        const heartSpanEl = document.createElement('span');
        heartSpanEl.innerHTML = '❤';
        heartsEl.appendChild(heartSpanEl);

        if (levels[currentLevel].message) {
            animateMessages(levels[currentLevel].message, messageEl).then(
                () => {
                    keyToPress = getRandomKeyForCurrentLevel();
                    targetEl.innerHTML = keyToPress.display;
                    targetEl.setAttribute('data-key', keyToPress.key);
                }
            );
        }
    }
    const currentLevelKeys = currLevelData.keys;
    const randomKeyIndex = Math.floor(Math.random() * currentLevelKeys.length);
    return currentLevelKeys[randomKeyIndex];
}

function animateMessages(messageArray, messageContainerElement, finishEarly) {
    const animateMessagesPromise = new Promise((resolve, reject) => {
        animateMessageString(messageArray[0], messageContainerElement);
        let messageIdx = 0;
        isMessageMode = true;
        document.addEventListener('keydown', (e) => {
            if (messageIdx < messageArray.length - 1) {
                messageIdx++;

                animateMessageString(
                    messageArray[messageIdx],
                    messageContainerElement
                );

                if (finishEarly && messageIdx === messageArray.length - 1) {
                    isMessageMode = false;
                    resolve();
                }
            } else {
                messageContainerElement.innerHTML = '';
                isMessageMode = false;
                resolve();
            }
        });
    });
    return animateMessagesPromise;
}

function animateMessageString(messageString, messageContainerElement) {
    messageContainerElement.innerHTML = '';
    const messageWords = messageString.split(' ');
    messageWords.forEach((word, idx, wordArr) => {
        const newWordSpanEl = document.createElement('span');
        newWordSpanEl.innerHTML = word;
        newWordSpanEl.style.opacity = 0;

        if (idx < wordArr.length - 1) {
            newWordSpanEl.style.marginRight = '10px';
        }
        newWordSpanEl.style.marginBottom = '10px';
        const wordAnimation = newWordSpanEl.animate(
            [
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                },
            ],
            {
                duration: 50 + word.length * 10,
                delay: 200 * idx + word.length,
                iterations: 1,
                fill: 'forwards',
            }
        );

        wordAnimation.onfinish = () => {
            if (idx < wordArr.length - 1) {
                messageAudio.play();
            } else {
                messageFinishedAudio.play();
            }
        };
        messageContainerElement.appendChild(newWordSpanEl);
    });
}
