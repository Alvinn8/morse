// https://en.wikipedia.org/wiki/Prosigns_for_Morse_code#Official_International_Morse_code_procedure_signs

var morse = {
    alphabet: {
        a: ".-",
        b: "-...",
        c: "-.-.",
        d: "-..",
        e: ".",
        f: "..-.",
        g: "--.",
        h: "....",
        i: "..",
        j: ".---",
        k: "-.-",
        l: ".-..",
        m: "--",
        n: "-.",
        o: "---",
        p: ".--.",
        q: "--.-",
        r: ".-.",
        s: "...",
        t: "-",
        u: "..-",
        v: "...-",
        w: ".--",
        x: "-..-",
        y: "-.--",
        z: "--.."
    },
    digits: {
        "0": "-----",
        "1": ".----",
        "2": "..---",
        "3": "...--",
        "4": "....-",
        "5": ".....",
        "6": "-....",
        "7": "--...",
        "8": "---..",
        "9": "----."
    },
    extras: {
        ".": ".-.-.-",
        ",": "--..--",
        "?": "..--..",
        "!": "-.-.--",
        "-": "-....-",
        "/": "-..-.",
        "@": ".--.-.",
        "(": "-.--.",
        ")": "-.--.-"
    }
};
var prosigns = {
    "-.-.-": {
        shortName: "START",
        longName: "Start of transmission/message",
        description: "Sent just before a morse code message is sent.",
        type: "amateur radio prosign"
    },
    "........": {
        shortName: "ERROR",
        longName: "Error/Correction",
        description: "The morse sent before this was incorrect, after this is the correct morse",
        type: "amateur radio prosign and international official procedure sign"
    },
    "...---...": {
        shortName: "SOS",
        longName: "SOS"
    },
    ".-.-.": {
        shortName: "END",
        longName:"End of transmission",
        type: "international official procedure sign"
    }
};
var playingMorseSound = false;
var isPracticing = false;

function reverseObject(object) {
    var ret = {};
    for (var key in object) {
        var value = object[key];
        ret[value] = key;
    }
    return ret;
}

function getAllMorse() {
    var ret = {};
    for (var name in morse) {
        if (name == "extras") continue; // extras is disabled
        if (name == "digits") continue; // digits is disabled
        Object.assign(ret, morse[name]);
    }
    return ret;
}
    
window.addEventListener("DOMContentLoaded", function(e) {
    
    var morseTable = document.getElementById("morseTableContent");
    
    var keys = Object.keys(morse.alphabet).concat(Object.keys(morse.digits)).concat(Object.keys(morse.extras));
    var renderedFirstDigit = false;
    var renderedFirstExtra = false;
    for (var char of keys) {
        var value = morse.alphabet[char] || morse.digits[char] || morse.extras[char];
        var elem = document.createElement("p");
        if (morse.digits[char] && !renderedFirstDigit) {
            renderedFirstDigit = true;
            elem.style.marginTop = "33px";
        }
        if (morse.extras[char] && !renderedFirstExtra) {
            renderedFirstExtra = true;
            elem.style.marginTop = "33px";
        }
        elem.className = "entry";
        var charElem = document.createElement("span");
        charElem.className = "char";
        var valueElem = document.createElement("span");
        valueElem.className = "value";
    
        charElem.appendChild(document.createTextNode(char.toUpperCase()));
        elem.setAttribute("char", char);
        elem.setAttribute("value", value);
        for (var valueChar of value) {
            var valueCharElem = document.createElement("span");
            valueCharElem.innerHTML = "&nbsp;";
            if (valueChar == ".") {
                valueCharElem.className = "dot";
            } else if (valueChar == "-") {
                valueCharElem.className = "dash";
            } else {
                valueCharElem.appendChild(document.createTextNode(valueChar));
            }
            valueElem.appendChild(valueCharElem);
        }
    
        elem.appendChild(charElem);
        elem.appendChild(valueElem);
    
        morseTable.appendChild(elem);
    }

    window.addEventListener("keydown", function(e) {
        if (!document.querySelector(":focus") || (document.querySelector(":focus") && !document.querySelector(":focus").tagName == "INPUT")) {
            document.getElementById("search").focus();
        }
    });
    document.getElementById("search").addEventListener("keydown", function(e) {
        if (e.key == "Enter") {
            e.preventDefault();
            var entry = document.getElementsByClassName("entry highlighted")[0];
            var search = document.getElementById("search");
            var morse = search.value;
            var elem = document.createElement("span");
            var hasChar = entry == null ? false : entry.hasAttribute("char");
            var char = hasChar ? entry.getAttribute("char") : null;
            if (!hasChar && prosigns[morse]) {
                var prosign = prosigns[morse];
                char = prosign.shortName;
                elem.setAttribute("isProsign", true);
                hasChar = true;
            }
            elem.className = "inputtedMessageChar"+ ((!hasChar) ? " unknown" : "") + (elem.getAttribute("isProsign") ? " prosign" : "");
            if (hasChar) elem.appendChild(document.createTextNode(char.toUpperCase()));
            elem.setAttribute("morse", morse);
            document.getElementById("inputtedMessage").appendChild(elem);
            search.value = "";
            searchInput();
        }
    });
    document.getElementById("search").addEventListener("input", searchInput);

    document.getElementById("charLearningContainerStartButton").addEventListener("click", function(e) {
        isPracticing = true;
        document.getElementById("charLearningContainerContent").className = "active";
        document.getElementById("charLearningContainerStartContainer").style.display = "none";
        document.getElementById("morseTable").style.backgroundColor = "black";
        document.getElementById("stopPracticingMessage").style.display = "block";
        newCharLearningRound();
    });
    document.getElementById("charLearningDone").addEventListener("click", function(e) {
        if (playingMorseSound) return;

        var enteredValueElem = document.getElementById("charLearningInput");
        var enteredValue = enteredValueElem.value.toUpperCase();
        enteredValueElem.value = "";
        var correctValue = document.getElementById("charLearningValue").getAttribute("answer").toUpperCase();
        var result = document.getElementById("charLearningResult");
        result.style.display = "inline";
        playingMorseSound = true;
        if (enteredValue == correctValue) {
            result.style.backgroundColor = "lime";
            result.innerHTML = "Correct!";
            setTimeout(newCharLearningRound, 500);
        } else {
            result.style.backgroundColor = "red";
            result.innerHTML = "Incorrect, it was "+ correctValue;
            setTimeout(newCharLearningRound, 2000);
        }
    });
    document.getElementById("charLearningInput").addEventListener("keydown", function(e) {
        if (e.key == "Enter") {
            e.preventDefault();
            document.getElementById("charLearningDone").click();
        }
    });
    morseTable.addEventListener("click", function(e) {
        if (isPracticing) stopCharLearning();
    });
    document.getElementById("practiceFrequency").addEventListener("input", function(e) {
        var value =  document.getElementById("practiceFrequency").value;
        document.getElementById("practiceFrequencyValue").innerHTML = parseInt(value);
    });

});

function makeMorseTree() {
    var tree = {
        value: "",
        children: []
    };
    var allMorse = getAllMorse();
    var allMorseReversed = reverseObject(allMorse);

    var longestMorse = -1;
    for (var morseKey in allMorseReversed) {
        if (morseKey.length > longestMorse) longestMorse = morseKey.length;
    }

    function handleMorse(morseObject) {
        if (typeof morseObject !== "object") morseObject = { value: morseObject };
        morseObject.charValue = allMorseReversed[morseObject.value];

        if (typeof morseObject.value === "string" && morseObject.value.length > longestMorse) return morseObject;
        var dotValue = morseObject.value + ".";
        var dashValue = morseObject.value + "-";
        if (!morseObject.children) morseObject.children = {};
        morseObject.children[dotValue] = handleMorse(dotValue);
        morseObject.children[dashValue] = handleMorse(dashValue);
        return morseObject;
    }
    handleMorse(tree);
    return tree;
}

function playMorseSound(msg) {
    if (!window.audio) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        window.audio = new AudioContext();
    }
    var speed = document.getElementById("practiceWpm").value || 15;
    var frequency = document.getElementById("practiceFrequency").value || 600;
    var dotLength = 1.2 / speed;

    var startTime = audio.currentTime;
    var time = audio.currentTime;

    var oscillator = audio.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    var gain = audio.createGain();
    gain.gain.setValueAtTime(0, time);
    oscillator.connect(gain);
    gain.connect(audio.destination);

    for (var i = 0; i < msg.length; i++) {
        var char = msg[i];
        if (char == ".") {
            gain.gain.setValueAtTime(1, time);
            time += dotLength;
            gain.gain.setValueAtTime(0, time);
            time += dotLength;
        } else if (char == "-") {
            gain.gain.setValueAtTime(1, time);
            time += 3 * dotLength;
            gain.gain.setValueAtTime(0, time);
            time += dotLength;
        } else if (char == " ") {
            time += 7 * dotLength;
        } else {
            console.error("Unknown char while playing morse code, "+ char);
        }
    }

    setTimeout(function() {
        document.getElementById("charLearningInput").focus();
        playingMorseSound = false;
    }, (time - startTime) * 1000);

    oscillator.start();
}

function newCharLearningRound() {
    document.getElementById("charLearningResult").style.display = "none";
    var valueElem = document.getElementById("charLearningValue");
    valueElem.innerHTML = "";

    var all = getAllMorse();
    var rand = Math.floor(Math.random() * Object.keys(all).length);
    var value = Object.values(all)[rand];
    var char = Object.keys(all)[rand];
    valueElem.setAttribute("answer", char);

    if (document.getElementById("charLearningType1").checked || document.getElementById("charLearningType3").checked) {
        for (var i = 0; i < value.length; i++) {
            var char = value[i];
            var elem = document.createElement("span");
            elem.innerHTML = "&nbsp;";
            if (char == ".") elem.className = "dot";
            else if (char == "-") elem.className = "dash";
            valueElem.appendChild(elem);
        }
    }
    if (document.getElementById("charLearningType1").checked || document.getElementById("charLearningType2").checked) playMorseSound(value);
    else playingMorseSound = false;
}
function stopCharLearning() {
    isPracticing = false;
    document.getElementById("charLearningContainerContent").className = null;
    document.getElementById("charLearningContainerStartContainer").style.display = "block";
    document.getElementById("morseTable").style.backgroundColor = null;
    document.getElementById("stopPracticingMessage").style.display = "none";
}
function searchInput(e) {
    var query = document.getElementById("search").value.toUpperCase();

    if (!query) document.getElementById("search").blur();

    var entries = document.getElementsByClassName("entry");
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        entry.className = "entry";
        if (!entry
        || (entry.getAttribute("char") && entry.getAttribute("char").toUpperCase().startsWith(query))
        || (entry.getAttribute("value") && entry.getAttribute("value").toUpperCase().startsWith(query))) {
            entry.style.opacity = 1;
            if (entry
            && (entry.getAttribute("char") && entry.getAttribute("char").toUpperCase() == query)
            || (entry.getAttribute("value") && entry.getAttribute("value").toUpperCase() == query)) {
                entry.className = "entry highlighted";
            }
        } else {
            entry.style.opacity = 0.2;
        }
    }
    if (!document.getElementsByClassName("entry highlighted").length) {
        var prosign = prosigns[query];
        if (prosign) {
            var elem = document.getElementById("prosign");
            elem.innerHTML = "";
            if (prosign.type) elem.appendChild(document.createTextNode("This may be referancing the "+ prosign.type + " "+ prosign.longName));
            else elem.appendChild(document.createTextNode("This could mean the prosign "+ prosign.longName));
        } else {
            document.getElementById("prosign").innerHTML = "";
        }
    } else {
        document.getElementById("prosign").innerHTML = "";
    }
}
