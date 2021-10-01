/**
 * @overview Builds a tree-like JSON string from the LWC doclet data.
 * @version 0.0.1 
 */
'use strict';

const fs = require('fs');
const paramCase = require('change-case').paramCase;
const xmlToJson = require('xml2json').toJson;
const dump = require('jsdoc/util/dumper').dump; 

function formatType(type) {
  return type
    ? (type.names.length === 1 ? type.names[0] : type.names)
    : '';
}

function formatBooleanParam(boolParam) {
  return typeof boolParam === 'boolean' ? boolParam : ''
}

function parseFunction(element, parentNode) {
  if (!isPublic(element)) {
    return;
  }

  if (!parentNode.functions) {
    parentNode.functions = [];
  }

  const thisFunction = {
    name: element.name,
    access: element.access || '',
    virtual: !!element.virtual,
    description: element.description || '',
    parameters: [],
    examples: []
  };

  parentNode.functions.push(thisFunction);

  if (element.returns) {
    thisFunction.returns = {
      type: formatType(element.returns[0].type),
      description: element.returns[0].description || ''
    };
  }

  if (element.examples) {
    for (let i = 0; i < element.examples.length; i++) {
      thisFunction.examples.push(element.examples[i]);
    }
  }

  if (element.params) {
    for (let i = 0; i < element.params.length; i++) {
      thisFunction.parameters.push({
        name: element.params[i].name,
        type: formatType(element.params[i].type),
        description: element.params[i].description || '',
        default: element.params[i].defaultvalue || '',
        optional: formatBooleanParam(element.params[i].optional),
      });
    }
  }
}

function isTagDefined(element, tagTitle) {
  return element.tags?.filter((tag) => tag.title === tagTitle).length;
}

function isPublic(element) {
  if (isTagDefined(element, 'api')) {
    return true;
  }
  return false;
}

function parseMember(element, parentNode) {
  if (!isPublic(element)) {
    return;
  }
  if (!parentNode.properties) {
    parentNode.properties = [];
  }
  const prop = {
    name: element.name,
    attribute: paramCase(element.name),
    access: '@api',
    description: element.description || '',
    required: !element.defaultvalue && !isTagDefined(element, 'optional'),
    defaultValue: element.defaultvalue || '',
    type: element.type?.names?.[0] || '',
  }
  if (prop.type.name === 'function') {
    prop.type.params = element.params || '',
    prop.type.returns = element.returns || ''
  }
  parentNode.properties.push(prop);
}

function getMetadata(element) {
  const filePath = `${element.meta.path}/${element.meta.filename}-meta.xml`;

  const xmlData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(xmlToJson(xmlData));
}

function parseClass(element, parentNode, childNodes) {
  if (!parentNode.components) {
    parentNode.components = [];
  }

  element.xmlMeta = getMetadata(element).LightningComponentBundle;

  const thisClass = {
    name: element.name,
    attribute: paramCase(element.name),
    description: element.classdesc || '',
    access: element.access || '',
    fires: element.fires || '',
    examples: [],
    xmlMeta: {
      apiVersion: element.xmlMeta?.apiVersion || '',
      isExposed: element.xmlMeta?.isExposed,
      targets: element.xmlMeta?.targets?.target || []
    }
  };

  parentNode.components.push(thisClass);

  if (element.examples) {
    for (let i = 0, len = element.examples.length; i < len; i++) {
      thisClass.examples.push(element.examples[i]);
    }
  }

  if (element.params) {
    for (let i = 0; i < element.params.length; i++) {
      thisClass.constructor.parameters.push({
        name: element.params[i].name,
        type: formatType(element.params[i].type),
        default: element.params[i].defaultvalue || '',
        optional: formatBooleanParam(element.params[i].optional),
      });
    }
  }

  graft(thisClass, childNodes, element.longname);
}

function graft(parentNode, childNodes, parentLongname) {
  childNodes
    .filter(function (element) {
      return (element.memberof === parentLongname);
    })
    .forEach(function (element, _index) {
      switch(element.kind) {
        case 'function':
          return parseFunction(element, parentNode);
        case 'member':
          return parseMember(element, parentNode);
        case 'class':
          return parseClass(element, parentNode, childNodes);
        default:
          return;
      }
    });
}

/**
 * @param {TAFFY} data
 * @param {object} opts
 */
exports.publish = function (data, opts) {
  let root = {};

  data({ undocumented: true }).remove();
  const docs = data().get();

  graft(root, docs);

  if (opts.destination === 'console') {
    console.log(dump(root));
  }
  else {
    console.log('This template only supports output to the console. Use the option "-d console" when you run JSDoc.');
  }
};
