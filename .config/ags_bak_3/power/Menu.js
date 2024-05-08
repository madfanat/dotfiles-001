const Button = (command, label) => Widget.Button({
  on_clicked: command,
  child: Widget.Label(label)
})


const Box = () => Widget.Box({
  children: [
    Button("", "asdas"),
    Button("", "asd",)
  ],
})

export default () => Widget.Window({
  child: Box,
})
