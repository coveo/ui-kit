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

  it("returns undefined", () => {
    expect(emit(params)).toBe(undefined);
  });

  it("sets expected url, token and body for the send function", () => {
    emit(params);

    expect(params.environment.send).toHaveBeenCalledWith(
      params.config.url,
      "I am token",
      params.event
    );
  });

  it("calls listeners", () => {
    const { listenerManager, event } = params;
    emit(params);
    expect(listenerManager.call).toHaveBeenCalledWith(event);
  });

  it("does not call listeners when in disabled mode", () => {
    params.config.mode = "disabled";
    emit(params);
    expect(params.listenerManager.call).not.toBeCalled();
  });

  it("does not call the environment send function when in disabled mode", () => {
    const sendSpy = jest.fn();
    const environment = createMockEnvironment({ send: sendSpy });
    params.config.mode = "disabled";
    params.environment = environment;
    emit(params);

    expect(sendSpy).toHaveBeenCalledTimes(0);
  });
});
