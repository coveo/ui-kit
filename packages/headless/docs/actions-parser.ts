import {Config, DocComment, DocGen, Entity} from './doc-json-types';
import {getDesc, getModule} from './utils';

export function parseActions(docgen: DocGen, config: Config) {
  return config.actions.sections.map((section) => {
    const sectionModules = section.sources.map((source) =>
      getModule(docgen, source)
    );
    return {
      section: section.name,
      actions: sectionModules
        .map((sectionModule) => sectionModule.children.map(parseAction))
        .reduce((acc, val) => acc.concat(val), []),
    };
  });
}

function parseAction(entity: Entity) {
  return {
    name: entity.name,
    text: getDesc(entity.comment),
    parameters: parseActionParameters(entity.comment),
  };
}

function parseActionParameters(comment: DocComment | undefined) {
  if (!comment || !comment.tags) return [];

  return comment.tags.map((param) => {
    return {
      name: param.param,
      text: getDesc(param),
    };
  });
}
