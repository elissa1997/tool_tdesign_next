import shift from './shift.js'
import segment from './segment.js'
import emoji from './emoji.js'
import { checksum } from './utils.js'

/* ================= 常量（已合并） ================= */

export const DECRYPT_FAILED = 'DECRYPT_FAILED'
const MAGIC = '::CLIP::'

/* ================= 算法表 ================= */

const ALGOS = { shift, segment, emoji }

/* ================= 对外 API ================= */

export function encrypt(text, key, type = 'shift') {
    const algo = ALGOS[type]
    if (!algo) return DECRYPT_FAILED

    const body = `${MAGIC}${text}::H:${checksum(text, key)}`
    return algo.encrypt(body, key)
}

export function decrypt(cipher, key, type = 'shift') {
    const algo = ALGOS[type]
    if (!algo) return DECRYPT_FAILED

    const raw = algo.decrypt(cipher, key)
    if (!raw || !raw.startsWith(MAGIC)) return DECRYPT_FAILED

    const idx = raw.lastIndexOf('::H:')
    if (idx === -1) return DECRYPT_FAILED

    const text = raw.slice(MAGIC.length, idx)
    const sig = raw.slice(idx + 4)

    return checksum(text, key) === sig
        ? text
        : DECRYPT_FAILED
}
