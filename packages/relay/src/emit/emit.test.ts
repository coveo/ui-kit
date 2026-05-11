import { vi } from "vitest";
import { createMockEnvironment } from "../__mocks__/environment.js";
import { createMockEvent } from "../__mocks__/event.js";
import { createMockConfig } from "../__mocks__/config.js";
import { emit, type EmitParams } from "./emit.js";
import { createMockListenerManager } from "../__mocks__/listener-manager.js";

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
    expect(await emit(params)).toBe(undefined);
  });

  it("sets expected url, token and body for the send function", async () => {
    await emit(params);

    expect(params.environment.send).toHaveBeenCalledWith(
      params.config.url,
      "I am token",
      params.event,
    );
  });

  it("calls listeners", async () => {
    const { listenerManager, event } = params;
    await emit(params);
    expect(listenerManager.call).toHaveBeenCalledWith(event);
  });

  it("does not call listeners when in disabled mode", async () => {
    params.config.mode = "disabled";
    await emit(params);
    expect(params.listenerManager.call).not.toHaveBeenCalled();
  });

  it("does not call the environment send function when in disabled mode", async () => {
    const sendSpy = vi.fn();
    const environment = createMockEnvironment({ send: sendSpy });
    params.config.mode = "disabled";
    params.environment = environment;
    await emit(params);

    expect(sendSpy).toHaveBeenCalledTimes(0);
  });
});
