export const formattingRegExp = new RegExp(/(\*|_|~|\||\[|\]|\{|\}|\(|\)|\.|#|-|\+|>|=|!|`)/gm)

export function formattingMsg(string: string): string {
    return string.replaceAll(formattingRegExp, '\\$1')
}