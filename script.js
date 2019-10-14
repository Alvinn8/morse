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
        y: "-.--"
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
        Object.assign(ret, morse[name]);
    }
    return ret;
}
    
window.addEventListener("DOMContentLoaded", function() {
    
    var morseTable = document.getElementById("morseTable");
    
    var keys = Object.keys(morse.alphabet).concat(Object.keys(morse.digits));
    var renderedFirstDigit = false;
    for (var char of keys) {
        var value = morse.alphabet[char] || morse.digits[char] || morse.extras[char];
        var elem = document.createElement("p");
        if (morse.digits[char] && !renderedFirstDigit) {
            renderedFirstDigit = true;
            elem.style.marginTop = "33px";
        }
        elem.className = "entry";
        var charElem = document.createElement("span");
        charElem.className = "char";
        var valueElem = document.createElement("span");
        valueElem.className = "value";
    
        charElem.appendChild(document.createTextNode(char.toUpperCase()));
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