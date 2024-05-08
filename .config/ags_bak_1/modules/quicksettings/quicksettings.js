import Widget from "resource:///com/github/Aylur/ags/widget.js";
import icons from "../icons/index.js";
import MprisPlayerList from "../mpris/index.js";
import AudioContent from "../audio/index.js";
import Menu from "./menu.js";
import Notifications from "resource:///com/github/Aylur/ags/service/notifications.js";
import NotificationList from "../notifications/index.js";
import WifiList from "../network/index.js";
import BluetoothList from "../bluetooth/index.js";
// @ts-ignore
import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import Network from "resource:///com/github/Aylur/ags/service/network.js";
import { Switch } from "../widgets/widgets.js";
import { Cava } from "../cava/index.js";
import { LyricsTerminal } from "../vte/index.js";
import GObject from "gi://GObject";

/**
 * @param {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget} content
 */
export const QuickSettingsPage = content => Widget.Scrollable({
  class_name: "qs-page",
  vexpand: true,
  hexpand: true,
  hscroll: "never",
  child: content
});

/**
 * @returns {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget}
 */
const QSNotification = () => QuickSettingsPage(Menu({
  title: "Notifications",
  icon: icons.notifications.chat,
  content: NotificationList(),
  headerChild: Widget.Box({
    class_name: "spacing-5",
    children: [
      Widget.Button({
        on_clicked: () => Notifications.clear(),
        child: Widget.Box({
          children: [
            Widget.Label("Clear "),
            Widget.Icon(icons.trash.empty)
          ]
        }),
        visible: Notifications.bind("notifications").transform(notifs => notifs.length > 0)
      }),
      Switch({})
        .hook(Notifications, (sw) => {
          if (sw.active === Notifications.dnd)
            sw.active = !Notifications.dnd;
        })
        .on("notify::active", ({active}) => {
          if (active === Notifications.dnd)
            Notifications.dnd = !active;
        })
    ]
  })
}));

/**
 * @returns {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget}
 */
const QSWifi = () => QuickSettingsPage(Menu({
  title: "Wi-Fi",
  icon: "network-wireless-signal-good-symbolic",
  content: WifiList(),
  headerChild: Switch({})
    .hook(Network, (sw) => {
      if (sw.active !== Network.wifi.enabled)
        sw.active = Network.wifi.enabled;
    })
    .on("notify::active", ({active}) => {
      if (active !== Network.wifi.enabled)
        Network.wifi.enabled = active;
    })
}));

/**
 * @returns {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget}
 */
const QSBluetooth = () => QuickSettingsPage(
  Menu({
    title: "Bluetooth",
    icon: icons.bluetooth.enabled,
    content: BluetoothList(),
    headerChild: Widget.Switch({
      setup: (self) =>
        self.bind_property(
          "active",
          Bluetooth,
          "enabled",
          GObject.BindingFlags.BIDIRECTIONAL,
        ),
    })
  }));

/**
 * @returns {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget}
 */
const QSAudio = () => QuickSettingsPage(
  Menu({
    title: "Audio",
    icon: icons.audio.volume.high,
    content: AudioContent()
  })
);

/**
 * @returns {import('types/@girs/gtk-3.0/gtk-3.0').Gtk.Widget}
 */
const QSMpris = () => {
  return QuickSettingsPage(
    Widget.Box({
      vertical: true,
      children: [
        Menu({
          title: "Player",
          icon: icons.mpris.fallback,
          content: Widget.Box({
            class_name: "spacing-5",
            vertical: true,
            children: [
              MprisPlayerList(),
              LyricsTerminal(),
              Widget.Box({vexpand: true}),
            ]
          })
        }),
        Cava({
          bars: 30,
          barHeight: 150,
          smooth: true,
        })
      ]
    })
  );
};

export const Quicksettings = () => {
  const items = {
    "Notifications": QSNotification(),
    "Wifi": QSWifi(),
    "Bluetooth": QSBluetooth(),
    "Audio": QSAudio(),
    "Mpris": QSMpris(),
  };
  return items;
};

export default Quicksettings;
