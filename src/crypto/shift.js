import { keyToNumber } from './utils.js'

export default {
    encrypt(text, key) {
        const offset = 3 + (keyToNumber(key) % 7)
        let out = ''
        let i = 0

        for (const ch of text) {
            out += String.fromCodePoint(ch.codePointAt(0) + offset)
            if ((i + offset) % 2 === 0) out += '#'
            i++
        }
        return out
    },

    decrypt(text, key) {
        const offset = 3 + (keyToNumber(key) % 7)
        let out = ''

        for (const ch of text) {
            if (ch === '#') continue
            out += String.fromCodePoint(ch.codePointAt(0) - offset)
        }
        return out
    }
}
