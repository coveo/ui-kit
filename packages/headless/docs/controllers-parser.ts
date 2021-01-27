import {Config, Controller, DocGen, Func, Source} from './doc-json-types';
import {getDesc, getFromModuleByName, getModule, parseEntity} from './utils';
import {getType} from './type-resolver';

export function parseControllers(docgen: DocGen, config: Config) {
  return config.controllers.map((controller) => {
    return {
      name: controller.name,
      text: getControllerText(docgen, controller),
      initialize: {
        initializer: parseInitializer(
          docgen,
          controller.initialize.initializer
        ),
        others: controller.initialize.others.map((source) => {
          return parseEntity(docgen, source);
        }),
      },
    };
  });
}

function getControllerText(docgen: DocGen, controller: Controller) {
  return getDesc(
    getFromModuleByName(
      getModule(docgen, controller.initialize.initializer.source),
      controller.name
    ).comment
  );
}

function parseInitializer(docgen: DocGen, initializerSource: Source) {
  const initializer = getFromModuleByName(
    getModule(docgen, initializerSource.source),
    initializerSource.name
  ) as Func;
  const initializerSignature = initializer.signatures.find((sig) => {
    return sig.kindString === 'Call signature';
  });
  if (!initializerSignature)
    throw `${initializer.name} is missing a function signature.`;
  return {
    name: initializer.name,
    text: getDesc(initializerSignature.comment),
    parameters: initializerSignature.parameters.map((param) => {
      return {
        name: param.name,
        type: getType(param.type, 'parameter'),
        text: getDesc(param.comment),
      };
    }),
    methods: getControllerMethods(),
  };
}

// TODO: methods
function getControllerMethods() {
  return [];
}
