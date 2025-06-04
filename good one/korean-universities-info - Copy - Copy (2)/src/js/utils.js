function getElement(selector) {
    return document.querySelector(selector);
}

function createElement(tag, className = '', attributes = {}) {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
    return element;
}

function appendChildren(parent, children) {
    children.forEach(child => {
        parent.appendChild(child);
    });
}

function formatDescription(description) {
    return description.length > 100 ? description.substring(0, 97) + '...' : description;
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const rotor_1 = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const rotor_2 = "AJDKSIRUXBLHWTMCQGZNPYFVOE";
const rotor_3 = "BDFHJLCPRTXVZNYEIWGAKMUSQO";
const reflector = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

function rotate(rotor, positions) {
    return rotor.slice(positions) + rotor.slice(0, positions);
}

function encode_character(char, rotor) {
    return rotor[alphabet.indexOf(char)];
}

export function enigma_encrypt(text, rotor1_offset, rotor2_offset, rotor3_offset) {
    let encrypted_text = "";
    let rotor1 = rotate(rotor_1, rotor1_offset);
    let rotor2 = rotate(rotor_2, rotor2_offset);
    let rotor3 = rotate(rotor_3, rotor3_offset);

    for (let char of text.toUpperCase()) {
        if (!alphabet.includes(char)) {
            encrypted_text += char;
            continue;
        }
        char = encode_character(char, rotor1);
        char = encode_character(char, rotor2);
        char = encode_character(char, rotor3);
        char = encode_character(char, reflector);
        char = alphabet[rotor3.indexOf(char)];
        char = alphabet[rotor2.indexOf(char)];
        char = alphabet[rotor1.indexOf(char)];
        encrypted_text += char;

        rotor1_offset = (rotor1_offset + 1) % alphabet.length;
        if (rotor1_offset === 0) {
            rotor2_offset = (rotor2_offset + 1) % alphabet.length;
            if (rotor2_offset === 0) {
                rotor3_offset = (rotor3_offset + 1) % alphabet.length;
            }
        }
        rotor1 = rotate(rotor_1, rotor1_offset);
        rotor2 = rotate(rotor_2, rotor2_offset);
        rotor3 = rotate(rotor_3, rotor3_offset);
    }
    return encrypted_text;
}