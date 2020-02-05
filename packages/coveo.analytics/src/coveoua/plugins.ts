export type UAPluginOptions = any[];

export class Plugins {
    private plugins: {[name: string]: any} = {};

    register(name: string, plugin: any): void {
        this.plugins[name] = plugin;
    }

    execute(name: string, fn: string, ...pluginOptions: UAPluginOptions[]) {
        const plugin = this.plugins[name];
        const actionFunction = plugin[fn];
        return actionFunction.apply(plugin, pluginOptions);
    }
}
