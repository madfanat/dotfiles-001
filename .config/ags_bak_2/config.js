import Notification from "./notifications/Notification.js"
import Bar from "./bar/Bar.js"

App.config({
    style: "./style.css",
    windows: [
        Bar(),
        Notification(),
        // you can call it, for each monitor
        // Bar(0),
        // Bar(1)
    ],
})
