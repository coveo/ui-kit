/**
  @overview Builds a tree-like JSON string from the doclet data.
  @version 0.0.1 
 */
'use strict';

function parseFunction(element, parentNode) {
  var i, len;

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
      type: element.returns[0].type ? (element.returns[0].type.names.length === 1 ? element.returns[0].type.names[0] : element.returns[0].type.names) : '',
      description: element.returns[0].description || ''
    };
  }

  if (element.examples) {
    for (i = 0, len = element.examples.length; i < len; i++) {
      thisFunction.examples.push(element.examples[i]);
    }
  }

  if (element.params) {
    for (i = 0, len = element.params.length; i < len; i++) {
      thisFunction.parameters.push({
        name: element.params[i].name,
        type: element.params[i].type ? (element.params[i].type.names.length === 1 ? element.params[i].type.names[0] : element.params[i].type.names) : '',
        description: element.params[i].description || '',
        default: element.params[i].defaultvalue || '',
        optional: typeof element.params[i].optional === 'boolean' ? element.params[i].optional : '',
        nullable: typeof element.params[i].nullable === 'boolean' ? element.params[i].nullable : ''
      });
    }
  }
}

function isTagDefined(element, tagTitle) {
  return element.tags?.filter((tag) => tag.title === tagTitle).length;
}

function isPublic(element) {
  if (isTagDefined(element, 'api') || element.access === "public") {
    return true;
  }
  return false;
}

function parseMember(element, parentNode) {
  const paramCase = require('change-case').paramCase;

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
  const fs = require('fs');
  const parser = require('xml2json');
  const filePath = `${element.meta.path}/${element.meta.filename}-meta.xml`;

  const xmlData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(parser.toJson(xmlData));
}

function parseClass(element, parentNode, childNodes) {
  const paramCase = require('change-case').paramCase;

  var i, len;

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
    category: element.category || '',
    xmlMeta: {
      apiVersion: element.xmlMeta?.apiVersion || '',
      isExposed: element.xmlMeta?.isExposed,
      targets: element.xmlMeta?.targets?.target || []
    }
  };

  parentNode.components.push(thisClass);

  if (element.examples) {
    for (i = 0, len = element.examples.length; i < len; i++) {
      thisClass.examples.push(element.examples[i]);
    }
  }

  if (element.params) {
    for (i = 0, len = element.params.length; i < len; i++) {
      thisClass.constructor.parameters.push({
        name: element.params[i].name,
        type: element.params[i].type ? (element.params[i].type.names.length === 1 ? element.params[i].type.names[0] : element.params[i].type.names) : '',
        description: element.params[i].description || '',
        default: element.params[i].defaultvalue || '',
        optional: typeof element.params[i].optional === 'boolean' ? element.params[i].optional : '',
        nullable: typeof element.params[i].nullable === 'boolean' ? element.params[i].nullable : '',
      });
    }
  }

  graft(thisClass, childNodes, element.longname, element.name);
}

function graft(parentNode, childNodes, parentLongname, _parentName) {
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
  @param {TAFFY} data
  @param {object} opts
*/
exports.publish = function (data, opts) {
  var root = {},
    docs;

  data({ undocumented: true }).remove();
  docs = data().get(); // <-- an array of Doclet objects

  graft(root, docs);

  if (opts.destination === 'console') {
    if (opts.query && opts.query.format === 'xml') {
      var xml = require('js2xmlparser');
      console.log(xml('jsdoc', root));
    }
    else {
      console.log(require('jsdoc/util/dumper').dump(root));
    }
  }
  else {
    console.log('This template only supports output to the console. Use the option "-d console" when you run JSDoc.');
  }
};
