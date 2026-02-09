import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Meta from "gi://Meta";
import Shell from "gi://Shell";
import GObject from "gi://GObject";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import {
  QuickToggle,
  SystemIndicator,
} from "resource:///org/gnome/shell/ui/quickSettings.js";

const ExampleToggle = GObject.registerClass(
  class ExampleToggle extends QuickToggle {
    constructor() {
      super({
        title: _("Smile"),
        iconName: "face-smile-symbolic",
        toggleMode: true,
      });
    }
  },
);

const ExampleIndicator = GObject.registerClass(
  class ExampleIndicator extends SystemIndicator {
    _indicator: any;

    constructor() {
      super();

      this._indicator = this._addIndicator();
      this._indicator.iconName = "face-smile-symbolic";

      const toggle = new ExampleToggle();
      toggle.bind_property(
        "checked",
        this._indicator,
        "visible",
        GObject.BindingFlags.SYNC_CREATE,
      );
      this.quickSettingsItems.push(toggle);
    }
  },
);

export default class TypeScriptTemplateExtension extends Extension {
  gsettings?: Gio.Settings;
  animationsEnabled: boolean = true;
  _indicator?: InstanceType<typeof ExampleIndicator>;

  enable() {
    this.gsettings = this.getSettings();
    this.animationsEnabled = this.gsettings.get_boolean("animate") ?? true;

    this._indicator = new ExampleIndicator();
    Main.panel.statusArea.quickSettings.addExternalIndicator(
      this._indicator as any,
    );
  }

  disable() {
    if (this._indicator) {
      this._indicator.quickSettingsItems.forEach((item: any) => item.destroy());
      this._indicator.destroy();
      this._indicator = undefined;
    }

    this.gsettings = undefined;
  }
}
