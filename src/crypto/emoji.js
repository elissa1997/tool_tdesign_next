import { keyToNumber, toBase64Utf8, fromBase64Utf8 } from './utils.js'

const BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

const EMOJIS = [
    "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊",
    "😋","😎","😍","😘","😗","😙","😚","🙂","🤗","🤩",
    "🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮",
    "🤐","😯","😪","😫","🥱","😴","😌","😛","😜","😝",
    "🤤","😒","😓","😔","😕","🙃","🤑","😲","☹️","🙁",
    "😖","😞","😟","😤","😢","😭","😦","😧","😨","😩",
    "🤯","😬","➕","➗","🟰"
]

function buildMap(key) {
    const off = keyToNumber(key) % EMOJIS.length
    const map = {}, rev = {}

    for (let i = 0; i < BASE.length; i++) {
        const e = EMOJIS[(i + off) % EMOJIS.length]
        map[BASE[i]] = e
        rev[e] = BASE[i]
    }
    return { map, rev }
}

export default {
    encrypt(text, key) {
        const { map } = buildMap(key)
        const b64 = toBase64Utf8(text)

        let out = ''
        for (const c of b64) out += map[c]
        return out
    },

    decrypt(text, key) {
        const { rev } = buildMap(key)
        let b64 = '', buf = ''

        for (const ch of text) {
            buf += ch
            if (rev[buf]) {
                b64 += rev[buf]
                buf = ''
            }
        }
        return fromBase64Utf8(b64)
    }
}
