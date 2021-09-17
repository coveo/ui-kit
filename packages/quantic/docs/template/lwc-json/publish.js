/**
  @overview Builds a tree-like JSON string from the doclet data.
  @version 0.0.1 
 */
'use strict';

function parseNamespace(element, parentNode, childNodes) {
  if (!parentNode.namespaces) {
    parentNode.namespaces = [];
  }

  const thisNamespace = {
    name: element.name,
    description: element.description || '',
    access: element.access || '',
    virtual: !!element.virtual
  };

  parentNode.namespaces.push(thisNamespace);

  graft(thisNamespace, childNodes, element.longname, element.name);
}

function parseMixin(element, parentNode, childNodes) {
  if (!parentNode.mixins) {
    parentNode.mixins = [];
  }

  const thisMixin = {
    name: element.name,
    description: element.description || '',
    access: element.access || '',
    virtual: !!element.virtual
  };

  parentNode.mixins.push(thisMixin);

  graft(thisMixin, childNodes, element.longname, element.name);
}

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

function isPublic(element) {
  if (element.tags?.filter((tag) => tag.title === 'api').length || element.access === "public") {
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
    access: '@api',
    description: element.description || '',
    required: !element.defaultvalue,
    type: {
      name: element.type?.names?.[0] || '',
      defaultValue: element.defaultvalue || ''
    }
  }
  if (prop.type.name === 'function') {
    prop.type.params = element.params || '',
    prop.type.returns = element.returns || ''
  }
  parentNode.properties.push(prop);
}

function parseEvent(element, parentNode) {
  var i, len;

  if (!parentNode.events) {
    parentNode.events = [];
  }

  const thisEvent = {
    name: element.name,
    access: element.access || '',
    virtual: !!element.virtual,
    description: element.description || '',
    parameters: [],
    examples: []
  };

  parentNode.events.push(thisEvent);

  if (element.returns) {
    thisEvent.returns = {
      type: element.returns.type ? (element.returns.type.names.length === 1 ? element.returns.type.names[0] : element.returns.type.names) : '',
      description: element.returns.description || ''
    };
  }

  if (element.examples) {
    for (i = 0, len = element.examples.length; i < len; i++) {
      thisEvent.examples.push(element.examples[i]);
    }
  }

  if (element.params) {
    for (i = 0, len = element.params.length; i < len; i++) {
      thisEvent.parameters.push({
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

function getMetadata(element) {
  const fs = require('fs');
  const parser = require('xml2json');
  const filePath = `${element.meta.path}/${element.meta.filename}-meta.xml`;

  const xmlData = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(parser.toJson(xmlData));
}

function parseClass(element, parentNode, childNodes) {
  var i, len;

  if (!parentNode.classes) {
    parentNode.classes = [];
  }

  element.xmlMeta = getMetadata(element).LightningComponentBundle;

  const thisClass = {
    name: element.name,
    description: element.classdesc || '',
    access: element.access || '',
    fires: element.fires || '',
    examples: [],
    category: element.category || '',
    xmlMeta: {
      apiVersion: element.xmlMeta?.apiVersion || '',
      isExposed: element.xmlMeta?.isExposed,
      targets: element.xmlMeta?.targets || []
    }
  };

  parentNode.classes.push(thisClass);

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
        case 'namespace':
          return parseNamespace(element, parentNode, childNodes);
        case 'mixin':
          return parseMixin(element, parentNode, childNodes);
        case 'function':
          return parseFunction(element, parentNode);
        case 'member':
          return parseMember(element, parentNode);
        case 'event':
          return parseEvent(element, parentNode);
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
