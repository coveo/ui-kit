import {
  callEventApi,
  EventApiCallParams,
} from "../event-api-call/event-api-caller";

export async function emit(params: EventApiCallParams) {
  await callEventApi(params);
}
