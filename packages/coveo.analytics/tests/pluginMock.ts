import {uuidv4} from '../src/client/crypto';
import {BasePlugin, PluginOptions} from '../src/plugins/BasePlugin';

export class TestPlugin extends BasePlugin {
    public static readonly Id: 'test';
    protected addHooks(): void {}
    protected clearPluginData(): void {}
    constructor({client, uuidGenerator = uuidv4}: PluginOptions) {
        super({client, uuidGenerator});
    }
}
