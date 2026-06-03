/**
 * @overview Builds a tree-like JSON string from the LWC doclet data.
 * @version 0.0.1
 */
'use strict';

const fs = require('fs');
const {resolve, dirname} = require('path');
const parseString = require('xml2js').parseString;
const dump = require('jsdoc/util/dumper').dump;

function paramCase(value) {
  return value
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

function formatType(type) {
  return type ? (type.names.length === 1 ? type.names[0] : type.names) : '';
}

function formatBooleanParam(boolParam) {
  return typeof boolParam === 'boolean' ? boolParam : '';
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
    examples: [],
  };

  parentNode.functions.push(thisFunction);

  if (element.returns) {
    thisFunction.returns = {
      type: formatType(element.returns[0].type),
      description: element.returns[0].description || '',
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
  return element.tags?.filter((tag) => tag.originalTitle === tagTitle).length;
}

function isPublic(element) {
  return isTagDefined(element, 'api');
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
    type: element.type?.names?.join('|') || '',
  };
  if (prop.type.name === 'function') {
    ((prop.type.params = element.params || ''),
      (prop.type.returns = element.returns || ''));
  }
  parentNode.properties.push(prop);
}

function getMetadata(element) {
  const filePath = `${element.meta.path}/${element.meta.filename}-meta.xml`;

  const xmlData = fs.readFileSync(filePath, 'utf8');
  return new Promise((resolve, reject) => {
    parseString(xmlData, {explicitArray: false}, function (err, result) {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

function getComponentCategories(element) {
  const categories = element.tags?.filter(
    (tag) => tag.originalTitle === 'category'
  );
  return categories ? categories.map((category) => category.value) : [];
}

const categoryMap = {
  search: 'Search',
  resultTemplate: 'Result Template',
  caseAssist: 'Case Assist',
  utility: 'Utility',
  insightPanel: 'Insight Panel',
  internal: 'Internal',
  recommendation: 'Recommendation',
};

async function parseClass(element, parentNode, childNodes) {
  if (!parentNode.components) {
    parentNode.components = {};
    Object.keys(categoryMap).forEach(
      (key) => (parentNode.components[key] = [])
    );
  }

  const metadata = await getMetadata(element);
  element.xmlMeta = metadata.LightningComponentBundle;

  const thisClass = {
    name: element.name,
    attribute: paramCase(element.name),
    description: element.classdesc || '',
    categories: getComponentCategories(element),
    fires: element.fires || '',
    examples: [],
    xmlMeta: {
      apiVersion: element.xmlMeta?.apiVersion || '',
      isExposed: element.xmlMeta?.isExposed,
      targets: element.xmlMeta?.targets?.target || [],
    },
  };

  if (thisClass.categories.includes(categoryMap.internal)) {
    return;
  }

  const categoryKeys = Object.keys(categoryMap).filter((key) =>
    thisClass.categories.includes(categoryMap[key])
  );

  if (!categoryKeys.length) {
    throw new Error(
      `JsDoc parsing FAILED: Invalid or missing category value(s) on component ${thisClass.name}.`
    );
  }
  categoryKeys.forEach((categoryKey) =>
    parentNode.components[categoryKey].push(thisClass)
  );

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

async function graft(parentNode, childNodes, parentLongname) {
  const elements = childNodes.filter(function (element) {
    return element.memberof === parentLongname;
  });

  const promises = elements.map(function (element, _index) {
    switch (element.kind) {
      case 'function':
        return parseFunction(element, parentNode);
      case 'member':
        return parseMember(element, parentNode);
      case 'class':
        return parseClass(element, parentNode, childNodes);
      default:
        return Promise.resolve();
    }
  });

  await Promise.all(promises);
}

/**
 * @param {TAFFY} data
 * @param {object} opts
 */
exports.publish = async function (data, opts) {
  let root = {};

  data({undocumented: true}).remove();
  const docs = data().get();

  await graft(root, docs);

  if (opts.destination === 'console') {
    console.log(dump(root));
  } else {
    fs.mkdirSync(resolve(dirname(opts.destination)), {recursive: true});
    fs.writeFileSync(resolve(opts.destination), dump(root));
  }
};
