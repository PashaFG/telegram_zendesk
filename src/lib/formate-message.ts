export const formattingRegExp = new RegExp(/(\*|_|~|\||\[|\]|\{|\}|\(|\)|\.|#|-|\+|>|=|!|`)/gm)

export function formattingMsg(string: string): string {
    return string.replaceAll(formattingRegExp, '\\$1')
}

export function capitalize(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1)
}