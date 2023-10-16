import { createMockEnvironment } from "../__mocks__/environment";
import { createMockEvent } from "../__mocks__/event";
import { createMockConfig } from "../__mocks__/config";
import { EmitParams, emit } from "./emit";
import { createMockListenerManager } from "../__mocks__/listener-manager";

describe("emit", () => {
  let params = createEmitParams();

  function createEmitParams(): EmitParams {
    return {
      config: createMockConfig(),
      event: createMockEvent(),
      environment: createMockEnvironment(),
      listenerManager: createMockListenerManager(),
    };
  }

  beforeEach(() => {
    params = createEmitParams();
  });

  it("returns undefined", async () => {
    const response = await emit(params);
    expect(response).toBe(undefined);
  });

  it("calls listeners", async () => {
    const { listenerManager, event } = params;
    await emit(params);
    expect(listenerManager.call).toHaveBeenCalledWith(event);
  });

  it("returns a response when in validate mode", async () => {
    params.config.mode = "validate";
    const response = await emit(params);
    expect(response).toBeTruthy();
  });

  it("does not call listeners when in disabled mode", async () => {
    params.config.mode = "disabled";
    await emit(params);
    expect(params.listenerManager.call).not.toBeCalled();
  });
});
