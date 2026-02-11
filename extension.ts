import St from "gi://St";
import Clutter from "gi://Clutter";

import {
    Extension,
    gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class ShowKeyExtension extends Extension {
    _panelButton: PanelMenu.Button | null = null;
    _container: St.BoxLayout | null = null;
    _filterID: number | null = null;

    private _pressedKeys: number[] = [];

    update() {
        console.debug(this._pressedKeys);
        this._container?.remove_all_children();
        for (const keysym of this._pressedKeys) {
            console.log(keysym);
            const label = new St.Label({
                text: this._keysymToLabel(keysym),
                style_class: "key-style",
            });
            this._container?.add_child(label);
        }
    }

    _onClutterEvent(event: Clutter.Event): boolean {
        const eventType = event.type();
        switch (eventType) {
            case Clutter.EventType.KEY_PRESS: {
                const keysym = event.get_key_symbol();
                if (keysym === null) break;
                console.log("pressed key:", keysym);
                this._pressedKeys.push(keysym);
                this.update();
                break;
            }
            case Clutter.EventType.KEY_RELEASE: {
                const keysym = event.get_key_symbol();
                if (keysym === null) break;
                console.log("released key:", keysym);
                const index = this._pressedKeys.lastIndexOf(keysym);
                if (index < 0) break;
                this._pressedKeys.splice(index, 1);
                this.update();
                break;
            }
            case Clutter.EventType.KEY_STATE: {
                console.log("key state:", event.get_key_state());
                break;
            }
            default: {
                break;
            }
        }

        return Clutter.EVENT_PROPAGATE;
    }

    private _keysymToLabel(keysym: number): string {
        if (keysym >= 32 && keysym <= 126) {
            return String.fromCharCode(keysym);
        }

        switch (keysym) {
            case Clutter.KEY_Return:
                return "↵";
            case Clutter.KEY_Escape:
                return "Esc";
            case Clutter.KEY_BackSpace:
                return "⌫";
            case Clutter.KEY_Tab:
                return "Tab";
            case Clutter.KEY_space:
                return "Space";
            case Clutter.KEY_Up:
                return "↑";
            case Clutter.KEY_Down:
                return "↓";
            case Clutter.KEY_Left:
                return "←";
            case Clutter.KEY_Right:
                return "→";
            case Clutter.KEY_Control_L:
            case Clutter.KEY_Control_R:
                return "Ctrl";
            case Clutter.KEY_Shift_L:
            case Clutter.KEY_Shift_R:
                return "Shift";
            case Clutter.KEY_Alt_L:
            case Clutter.KEY_Alt_R:
                return "Alt";
            case Clutter.KEY_Super_L:
            case Clutter.KEY_Super_R:
                return "Super";
        }

        return `Key(${keysym})`;
    }

    enable() {
        this._panelButton = new PanelMenu.Button(0.0, _("Any Key?"));
        this._container = new St.BoxLayout({
            x_align: Clutter.ActorAlign.END,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: "showkeys-container",
        });

        if (this._container.layout_manager) {
            this._container.layout_manager.spacing = 6;
        }
        this._panelButton.add_child(this._container);
        Main.panel.addToStatusArea(this.uuid, this._panelButton);
        this._filterID = Clutter.event_add_filter(
            null,
            this._onClutterEvent.bind(this),
        );
    }

    disable() {
        if (this._filterID) {
            Clutter.event_remove_filter(this._filterID);
            this._filterID = null;
        }

        if (this._panelButton) {
            if (this._container) {
                this._panelButton.remove_child(this._container);
            }
            Main.panel.remove_child(this._panelButton);
            this._panelButton = null;
            this._container = null;
        }
    }
}
