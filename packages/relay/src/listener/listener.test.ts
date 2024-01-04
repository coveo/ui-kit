import { createMockEvent } from "../__mocks__/event";
import { createListenerManager } from "./listener";

describe("createListenerManager", () => {
  describe("add", () => {
    it("adds the listener", () => {
      const { add, call } = createListenerManager();
      const type = "*";
      const event = createMockEvent();
      const spy1 = jest.fn();
      const spy2 = jest.fn();

      add({ type, callback: spy1 });
      add({ type, callback: spy2 });
      call(event);

      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
    });

    it("does not add a duplicate listener", () => {
      const { add, call } = createListenerManager();
      const type = "*";
      const event = createMockEvent();
      const spy1 = jest.fn();

      add({ type, callback: spy1 });
      add({ type, callback: spy1 });
      call(event);

      expect(spy1).toHaveBeenCalledTimes(1);
    });

    it("returns the function to remove the listener", () => {
      const { add, call } = createListenerManager();
      const type = "*";
      const event = createMockEvent();
      const spy = jest.fn();
      const removeFn = add({ type, callback: spy });

      call(event);
      expect(spy).toHaveBeenCalledTimes(1);

      removeFn();
      call(event);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("call", () => {
    it("calls the all type listeners' callback for any events", () => {
      const spy = jest.fn();
      const clickEvent = createMockEvent({ meta: { type: "itemClick" } });
      const viewEvent = createMockEvent({ meta: { type: "itemView" } });
      const { add, call } = createListenerManager();
      add({ type: "*", callback: spy });

      call(clickEvent);
      call(viewEvent);

      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("calls the listeners that have the corresponding event type", () => {
      const successSpy = jest.fn();
      const failSpy = jest.fn();
      const successEvent = createMockEvent({ meta: { type: "success" } });
      const { add, call } = createListenerManager();

      add({ type: "success", callback: successSpy });
      add({ type: "fail", callback: successSpy });
      call(successEvent);

      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(failSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("remove", () => {
    it("removes all listeners when the type parameter is * and no callback is set", () => {
      const { add, call, remove } = createListenerManager();
      const spy = jest.fn();
      const event = createMockEvent({ meta: { type: "itemClick" } });
      add({ type: "*", callback: spy });
      add({ type: "itemClick", callback: spy });

      remove("*");
      call(event);

      expect(spy).toHaveBeenCalledTimes(0);
    });

    it("removes all listeners of the passed type, without a callback defined", () => {
      const { add, call, remove } = createListenerManager();
      const allSpy = jest.fn();
      const itemClickSpy1 = jest.fn();
      const itemClickSpy2 = jest.fn();
      const event = createMockEvent({ meta: { type: "itemClick" } });
      add({ type: "*", callback: allSpy });
      add({ type: "itemClick", callback: itemClickSpy1 });
      add({ type: "itemClick", callback: itemClickSpy2 });

      remove("itemClick");
      call(event);

      expect(allSpy).toHaveBeenCalledTimes(1);
      expect(itemClickSpy1).toHaveBeenCalledTimes(0);
      expect(itemClickSpy2).toHaveBeenCalledTimes(0);
    });

    it("will not remove any listeners if none has the passed type", () => {
      const { add, call, remove } = createListenerManager();
      const allSpy = jest.fn();
      const itemClickSpy = jest.fn();
      const event = createMockEvent({ meta: { type: "itemClick" } });
      add({ type: "*", callback: allSpy });
      add({ type: "itemClick", callback: itemClickSpy });

      remove("patate");
      call(event);

      expect(allSpy).toHaveBeenCalledTimes(1);
      expect(itemClickSpy).toHaveBeenCalledTimes(1);
    });

    it("removes the listener with the corresponding type and callback parameter", () => {
      const spy1 = jest.fn();
      const spy2 = jest.fn();
      const { add, call, remove } = createListenerManager();
      const event = createMockEvent({ meta: { type: "itemClick" } });
      add({ type: "itemClick", callback: spy1 });
      add({ type: "itemClick", callback: spy2 });

      remove("itemClick", spy2);
      call(event);

      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(0);
    });

    it("will not remove any listener if no corresponding listener's callback equals the callback parameter", () => {
      const spy1 = jest.fn();
      const spy2 = jest.fn();
      const { add, call, remove } = createListenerManager();
      const event = createMockEvent({ meta: { type: "itemClick" } });
      add({ type: "itemClick", callback: spy1 });
      add({ type: "itemClick", callback: spy2 });

      remove("itemClick", jest.fn());
      call(event);

      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(1);
    });
  });
});
