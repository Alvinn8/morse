var morse = {
    a: ".-",
    b: "-..."
};

var morseTable = document.getElementById("morseTable");

for (var char of Object.keys(morse)) {
    var value = morse[char];
    var elem = document.createElement("p");
    elem.className = "entry";
    var charElem = document.createElement("span");
    charElem.className = "char";
    var valueElem = document.createElement("span");
    valueElem.className = "value";

    charElem.appendChild(document.createTextNode(char.toUpperCase()));
    valueElem.appendChild(document.createTextNode(value));

    elem.appendChild(charElem);
    elem.appendChild(valueElem);

    morseTable.appendChild(elem);
}