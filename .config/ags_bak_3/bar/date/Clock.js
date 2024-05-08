import GLib from "gi://GLib"

const time = Variable("", {
    poll: [1000, () => GLib.DateTime.new_now_local().format("%H:%M %d.%m.%Y")],
})

export default () => Widget.Label({
    label: time.bind(),
})
