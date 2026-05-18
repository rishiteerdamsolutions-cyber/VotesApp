const SYLLABLES: [string, string][] = [
  ['ch', 'చ'],
  ['th', 'థ'],
  ['dh', 'ధ'],
  ['kh', 'ఖ'],
  ['gh', 'ఘ'],
  ['ph', 'ఫ'],
  ['bh', 'భ'],
  ['sh', 'ష'],
  ['aa', 'ఆ'],
  ['ee', 'ఈ'],
  ['ii', 'ఈ'],
  ['oo', 'ఊ'],
  ['uu', 'ఊ'],
  ['ai', 'ై'],
  ['au', 'ౌ'],
  ['a', 'అ'],
  ['A', 'ఆ'],
  ['i', 'ఇ'],
  ['I', 'ఈ'],
  ['u', 'ఉ'],
  ['U', 'ఊ'],
  ['e', 'ఎ'],
  ['E', 'ఏ'],
  ['o', 'ఒ'],
  ['O', 'ఓ'],
  ['k', 'క'],
  ['c', 'క'],
  ['g', 'గ'],
  ['j', 'జ'],
  ['t', 'ట'],
  ['d', 'డ'],
  ['n', 'న'],
  ['p', 'ప'],
  ['b', 'బ'],
  ['m', 'మ'],
  ['y', 'య'],
  ['r', 'ర'],
  ['l', 'ల'],
  ['v', 'వ'],
  ['w', 'వ'],
  ['s', 'స'],
  ['h', 'హ'],
  [' ', ' '],
]

export function teluguTransliterate(englishText: string): string {
  if (!englishText.trim()) return ''
  let i = 0
  let out = ''
  const lower = englishText
  while (i < lower.length) {
    let matched = false
    for (const [latin, te] of SYLLABLES) {
      if (lower.slice(i, i + latin.length).toLowerCase() === latin.toLowerCase()) {
        out += te
        i += latin.length
        matched = true
        break
      }
    }
    if (!matched) {
      out += lower[i]
      i += 1
    }
  }
  return out
}
