export function removeSymbols(input: string, exceptions: string[] = []): string {
  const regex = new RegExp(`[^a-zA-Z0-9${exceptions.join('')}]`, 'g')
  return input.replace(regex, '')
}
