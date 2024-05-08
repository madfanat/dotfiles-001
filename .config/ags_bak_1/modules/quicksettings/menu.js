import Widget from "resource:///com/github/Aylur/ags/widget.js";

/**
 * @param {Object} param
 * @param {string} param.title
 * @param {string} param.icon
 * @param {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget} param.content
 * @param {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget} [param.headerChild]
 * @return {import('types/widgets/box').default}
 */
export default ({title, icon, content, headerChild = Widget.Box()}) => Widget.Box({
  children: [
    Widget.Box({
      class_name: "qs-menu",
      vertical: true,
      children: [
        Widget.Box({
          class_name: "qs-title spacing-5",
          children: [
            Widget.Icon(icon),
            Widget.Label(title),
            Widget.Box({hexpand: true}),
            headerChild
          ],
        }),
        Widget.Separator({}),
        Widget.Box({
          class_name: "qs-content",
          children: [content],
        }),
      ],
    })
  ],
});

