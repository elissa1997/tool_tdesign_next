export function keyToNumber(key = '') {
    let h = 0
    for (let i = 0; i < key.length; i++) {
        h = (h * 31 + key.charCodeAt(i)) >>> 0
    }
    return h
}

/* 明文 + key → 校验码 */
export function checksum(text, key) {
    let h = keyToNumber(key)
    for (const ch of text) {
        h = (h + ch.codePointAt(0)) >>> 0
    }
    return h.toString(16)
}

/* UTF-8 Base64（现代安全写法） */
export function toBase64Utf8(str) {
    const bytes = new TextEncoder().encode(str)
    let bin = ''
    for (const b of bytes) bin += String.fromCharCode(b)
    return btoa(bin)
}

export function fromBase64Utf8(b64) {
    try {
        const bin = atob(b64)
        const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
        return new TextDecoder().decode(bytes)
    } catch {
        return null
    }
}
