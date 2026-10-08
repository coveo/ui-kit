/** One visit to a page. A new visit, even to the same page, gives the page fresh surfaces. */
export type Visit = {id: number; page: 'home'} | {id: number; page: 'assistant'; prompt: string};

let visitCount = 0;

export function visitHome(): Visit {
  visitCount += 1;
  return {id: visitCount, page: 'home'};
}

export function visitAssistant(prompt: string): Visit {
  visitCount += 1;
  return {id: visitCount, page: 'assistant', prompt};
}
