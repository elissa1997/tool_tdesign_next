import { keyToNumber } from './utils.js'

export default {
    encrypt(text, key) {
        const k = keyToNumber(key)
        const size = 3 + (k % 3)
        const rev = k % 2 === 0

        const codes = []
        for (const ch of text) {
            codes.push(ch.codePointAt(0).toString(36))
        }

        const out = []
        for (let i = 0; i < codes.length; i += size) {
            const seg = codes.slice(i, i + size)
            out.push((rev ? seg.reverse() : seg).join('.'))
        }
        return out.join('|')
    },

    decrypt(text, key) {
        const rev = keyToNumber(key) % 2 === 0
        let out = ''

        for (const part of text.split('|')) {
            const seg = part.split('.')
            const list = rev ? seg.reverse() : seg

            for (const c of list) {
                const n = parseInt(c, 36)
                if (Number.isNaN(n)) return null
                out += String.fromCodePoint(n)
            }
        }
        return out
    }
}
