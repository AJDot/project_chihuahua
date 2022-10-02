interface Command {
  do(...args: unknown[]): unknown
  undo(): unknown
}

export default class Commander {
  commands: Command[] = []
  position: number = -1

  do(command: Command) {
    if (this.position < this.commands.length - 1) {
      this.commands = this.commands.slice(0, this.position + 1)
    }

    this.position++
    this.commands.push(command)
    return command.do()
  }

  undo() {
    if (this.position >= 0) {
      this.commands[this.position].undo()
      this.position--
    }
  }

  redo() {
    if (this.position < this.commands.length - 1) {
      this.position++
      this.commands[this.position].do()
    }
  }
}