import Service from "resource:///com/github/Aylur/ags/service.js";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
// @ts-ignore
import Soup from "gi://Soup?version=3.0";
import Keys from "../../keys.js";

export class ChatGPTMessage extends Service {
  static {
    Service.register(this, {},
      {
        "content": ["string"],
        "thinking": ["boolean"]
      });
  }

  _role = "";
  _content = "";
  _thinking = false;

  /**
   * @param {string} role
   * @param {string} content
   * @param {boolean} [thinking=false]
   * @constructor
   */
  constructor(role, content, thinking = false) {
    super();
    this._role = role;
    this._content = content;
    this._thinking = thinking;
  }

  get role() {
    return this._role;
  }

  set role(role) {
    this._role = role;
    this.emit("changed");
  }

  get content() {
    return this._content;
  }

  set content(content) {
    this._content = content;
    this.notify("content");
    this.emit("changed");
  }

  get thinking() {
    return this._thinking;
  }

  set thinking(thinking) {
    this._thinking = thinking;
    this.notify("thinking");
    this.emit("changed");
  }

  /**
   * @param {string} delta
  */
  addDelta(delta) {
    if (this.thinking) {
      this.thinking = false;
      this.content = delta;
    } else {
      this.content += delta;
    }
  }
}

class ChatGPTService extends Service {
  static {
    Service.register(this, {
      "newMsg": ["int"],
      "clear": [],
    });
  }

  _systemMessage = {
    role: "system",
    content: ""
  };

  /** @type {ChatGPTMessage[]} */
  _messages = [];
  _decoder = new TextDecoder();
  model = "gpt-3.5-turbo-1106";
  url = GLib.Uri.parse("https://api.openai.com/v1/chat/completions", GLib.UriFlags.NONE);

  /** @param {string} msg */
  setSystemMessage(msg) {
    this._systemMessage.content = msg;
  }

  get messages() {
    return this._messages;
  }

  get lastMessage() {
    return this.messages[this.messages.length - 1];
  }

  clear() {
    this._messages = [];
    this.emit("clear");
  }

  /**
   * @param {Gio.DataInputStream} stream
   * @param {ChatGPTMessage} aiResponse
  */
  readResponse(stream, aiResponse) {
    stream.read_line_async(
      0, null,
      (stream, res) => {
        if (!stream) {
          return;
        }
        const [bytes] = stream.read_line_finish(res);
        const line = this._decoder.decode(bytes ?? undefined);
        if (line && line != "") {
          let data = line.substring(6);
          if (data == "[DONE]") return;
          try {
            const result = JSON.parse(data);
            if (result.choices[0].finish_reason === "stop") return;
            aiResponse.addDelta(result.choices[0].delta.content);
          } catch {
            aiResponse.addDelta(line + "\n");
          }
        }
        this.readResponse(stream, aiResponse);
      });
  }

  /** @param {string} msg } */
  send(msg) {
    this.messages.push(new ChatGPTMessage("user", msg));
    this.emit("newMsg", this.messages.length - 1);

    const messages = this.messages.map(msg => {
      let m = {role: msg.role, content: msg.content};
      return m;
    });

    const aiResponse = new ChatGPTMessage("assistant", "thinking...", true);
    this.messages.push(aiResponse);
    this.emit("newMsg", this.messages.length - 1);

    //    aiResponse.content = `<html><head>
    // <title>Test HTML File</title>
    // <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    // </head>
    // <body>
    // <p>This is a very simple HTML file.</p>
    // </body></html>`
    //    return;

    const body = {
      model: this.model,
      messages: this._systemMessage.content != "" ? [this._systemMessage, ...messages] : messages,
      stream: true,
    };

    const session = new Soup.Session();
    const message = new Soup.Message({
      method: "POST",
      uri: this.url,
    });
    message.request_headers.append("Authorization", "Bearer " + Keys.OPENAI_API_KEY);
    // @ts-ignore
    message.set_request_body_from_bytes("application/json", new GLib.Bytes(JSON.stringify(body)));

    session.send_async(message, 0, null, /** @type Gio.AsyncReadyCallback*/(_, result) => {
      const stream = session.send_finish(result);
      this.readResponse(new Gio.DataInputStream({
        close_base_stream: true,
        base_stream: stream
      }), aiResponse);
    });
  }
}

export default new ChatGPTService();













