// tdRowFix.js
export default {
    mounted(el) {
        if (!el.classList.contains('t-row')) return

        const applyFix = () => {
            const ml = el.style.marginLeft
            const mr = el.style.marginRight
            if (!ml || !mr) return

            const half = Math.abs(parseFloat(ml))
            if (!half) return

            /* 1️⃣ 禁用 row 的负 margin */
            el.style.marginLeft = '0'
            el.style.marginRight = '0'

            /* 2️⃣ 取所有直接子级 col */
            const cols = Array.from(el.children).filter(c =>
                c.classList.contains('t-col')
            )

            if (!cols.length) return

            /* 3️⃣ 先还原所有 col 的 padding（防止重复 resize 累积） */
            cols.forEach(col => {
                col.style.paddingLeft = `${half}px`
                col.style.paddingRight = `${half}px`
            })

            /* 4️⃣ 按“行”分组（关键） */
            const rows = []
            cols.forEach(col => {
                const top = col.offsetTop
                let row = rows.find(r => r.top === top)
                if (!row) {
                    row = { top, cols: [] }
                    rows.push(row)
                }
                row.cols.push(col)
            })

            /* 5️⃣ 每一行：裁掉首尾的半个 gutter */
            rows.forEach(row => {
                const first = row.cols[0]
                const last  = row.cols[row.cols.length - 1]

                first.style.paddingLeft = '0'
                last.style.paddingRight = '0'
            })
        }

        /* 初次执行 */
        applyFix()

        /* resize / 响应式变化时重新执行 */
        const ro = new ResizeObserver(applyFix)
        ro.observe(el)

        el.__tdRowFixObserver__ = ro
    },

    unmounted(el) {
        if (el.__tdRowFixObserver__) {
            el.__tdRowFixObserver__.disconnect()
            delete el.__tdRowFixObserver__
        }
    }
}
