import {PluginClass, PluginOptions, BasePlugin, Plugin} from '../plugins/BasePlugin';
import {EC} from '../plugins/ec';
import {Link} from '../plugins/link';
import {SVC} from '../plugins/svc';

export class Plugins {
    public static readonly DefaultPlugins: string[] = [EC.Id, SVC.Id, Link.Id];
    private registeredPluginsMap: Record<string, PluginClass> = {
        [EC.Id]: EC,
        [SVC.Id]: SVC,
        [Link.Id]: Link,
    };
    private requiredPlugins: Record<string, BasePlugin> = {};

    require(name: string, options: PluginOptions): void {
        const pluginClass = this.registeredPluginsMap[name];
        if (!pluginClass) {
            throw new Error(
                `No plugin named "${name}" is currently registered. If you use a custom plugin, use 'provide' first.`
            );
        }
        this.requiredPlugins[name] = new (pluginClass as any)(options);
    }

    provide(name: string, plugin: PluginClass) {
        this.registeredPluginsMap[name] = plugin;
    }

    clearRequired(): void {
        this.requiredPlugins = {};
    }

    execute(name: string, fn: string, ...args: any[]): any {
        const plugin = this.requiredPlugins[name] as Plugin;
        if (!plugin) {
            throw new Error(`The plugin "${name}" is not required. Check that you required it on initialization.`);
        }
        const actionFunction = plugin.getApi(fn);
        if (!actionFunction) {
            throw new Error(`The function "${fn}" does not exist on the plugin "${name}".`);
        }
        if (typeof actionFunction !== 'function') {
            throw new Error(`"${fn}" of the plugin "${name}" is not a function.`);
        }
        return actionFunction.apply(plugin, args);
    }
}
