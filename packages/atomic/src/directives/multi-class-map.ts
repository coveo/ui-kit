import {directive, Directive} from 'lit/directive.js';
import {classMap} from 'lit/directives/class-map.js';

export const tw = (rec: Record<string, boolean>) => rec;

class MultiClassMapDirective extends Directive {
  render(map: Record<string, boolean>) {
    const processedClassMap: Record<string, boolean> = {};

    for (const [key, value] of Object.entries(map)) {
      if (value) {
        key.split(/\s+/).forEach((cls) => {
          processedClassMap[cls] = true;
        });
      }
    }

    return classMap(processedClassMap);
  }
}

export const multiClassMap = directive(MultiClassMapDirective);
