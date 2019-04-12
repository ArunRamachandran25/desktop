export class NullDelimiterParser<T extends { [name: string]: string }> {
  private readonly keys = new Array<string>()
  public readonly format: string = ''

  public constructor(fields: T, delimiterString = '%x00') {
    for (const [key, value] of Object.entries(fields)) {
      this.keys.push(key)
      this.format = `${this.format}${value}${delimiterString}`
    }
  }

  public *parse(output: string): Iterable<T> {
    const { keys } = this

    let head = 0
    let tail = 0
    let fieldIndex = 0
    let entry = {} as T

    while (head < output.length && (tail = output.indexOf('\0', head)) !== -1) {
      const value = output.substring(head, tail)
      const key = keys[fieldIndex % keys.length]
      entry[key] = value

      head = tail + 1
      fieldIndex++

      if (fieldIndex % keys.length === 0) {
        yield entry
        entry = {} as T

        if (head < output.length) {
          if (output[head] !== '\0' && output[head] !== '\n') {
            const char = output.charCodeAt(head)
            throw new Error(
              `Unexpected character at end of record: '0x${char.toString(16)}'`
            )
          }
          head++
        }
      }
    }
  }
}
