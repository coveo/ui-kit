require 'json'

DOC_GEN_PATH = './dist/doc.json'
CONFIG_PATH = './docs.config.json'
OUTPUT_PATH = './dist/parsed_doc.json'

class DocJsonParser
  def initialize(doc_gen_path, config_path)
    @doc_gen = JSON.parse(File.read(doc_gen_path))
    @config = JSON.parse(File.read(config_path))
  end

  def parse
    {
      'engine' => parse_engine,
      'controllers' => parse_controllers,
      'actions' => parse_actions
    }
  end

  private

  # Methods to retrieve stuff from the docgen

  def get_modules(module_path)
    @doc_gen['children'].select do |child|
      child['originalName'].include?(module_path)
    end
  end

  def get_entity_from_modules_by_name(modules, name)
    modules.each do |mod|
      entity = get_entity_from_module_by_name(mod, name)
      return entity unless entity.nil?
    end
    return nil
  end

  def get_entity_from_module_by_name(mod, name)
    mod['children'].find do |object|
      object['name'] == name
    end
  end

  def get_entities_from_modules_by_kind_string(modules, kind_string)
    entities = []
    modules.each do |mod|
      entities.concat(get_entities_from_module_by_kind_string(mod, kind_string))
    end
    entities
  end

  def get_entities_from_module_by_kind_string(mod, kind_string)
    mod['children'].select do |object|
      object['kindString'] == kind_string
    end
  end

  def get_desc(comment)
    return '' unless comment.respond_to?('key?')

    unless comment.key?('shortText') && comment.key?('text')
      return (comment.key?('shortText') ? comment['shortText'] : comment['text']).to_s
    end

    "#{comment['shortText']}\n\n#{comment['text']}"
  end

  def get_returns(comment)
    return '' unless comment.respond_to?('key?')

    comment.key?('returns') ? comment['returns'] : ''
  end

  # ----------------------Type Extractor-----------------------
  def get_type(object)
    type_object = object['type'].instance_of?(String) ? object : object['type']
    return '' if type_object.nil?
    return type_object['name'] if intrinsic_type?(type_object)
    return get_reference_type(type_object) if reference_type?(type_object)
    return "#{type_object['elementType']['name']}[]" if array_type?(type_object)
    return get_union_type(type_object, object) if union_type?(type_object)
    return get_intersection_type(type_object) if intersection_type?(type_object)
    return 'object' if reflection_type?(type_object)

    'Type Placeholder'
  end

  def intrinsic_type?(type_object)
    type_object['type'] == 'intrinsic'
  end

  def array_type?(type_object)
    type_object['type'] == 'array'
  end

  def reference_type?(type_object)
    type_object['type'] == 'reference'
  end

  def union_type?(type_object)
    type_object['type'] == 'union'
  end

  def reflection_type?(type_object)
    type_object['type'] == 'reflection'
  end

  def intersection_type?(type_object)
    type_object['type'] == 'intersection'
  end

  def optional_union_type?(type_object, object)
    object['kindString'] == 'Interface' && type_object['types'].include?({
      'type' => 'intrinsic',
      'name' => 'undefined'
    })
  end

  def get_reference_type(type_object)
    reference_type = type_object['name']
    unless type_object['typeArguments'].nil?
      types = type_object['typeArguments'].map { |argument| get_type(argument) }
    end
    reference_type += "<#{types.join(', ')}>" unless types.nil?
    reference_type
  end

  def get_union_type(type_object, object)
    members = optional_union_type?(type_object, object) ? get_optional_union_members(type_object) : type_object['types']
    union_type = members.map do |member|
      get_type(member)
    end.join(' | ')
    union_type += ', optional' if optional_union_type?(type_object, object)
    union_type
  end

  def get_optional_union_members(type_object)
    members = type_object['types'].reject do |type|
      type == {
        'type' => 'intrinsic',
        'name' => 'undefined'
      }
    end
    members
  end

  def get_intersection_type(type_object)
    type_object['types'].map do |member|
      get_type(member)
    end.join(' & ')
  end

  def expand_reflection_type(type_object)
    return {} unless type_object.key?('declaration') && type_object['declaration'].key?('children')

    {
      'properties' => type_object['declaration']['children'].map do |child|
        {
          'name' => child['name'],
          'type' => get_type(child['type']),
          'text' => (child.key?('comment') ? get_desc(child['comment']) : '')
        }
      end
    }
  end

  # Expand the various entities

  def alphabetize(object_array)
    object_array.sort! do |a, b|
      a['name'] <=> b['name']
    end
  end

  def expand_functions(functions)
    expand_any_functions(functions, 'Call signature', 'signatures')
  end

  def expand_accessors(functions)
    expand_any_functions(functions, 'Get signature', 'getSignature')
  end

  def expand_constructor(function)
    expand_any_functions([function], 'Constructor signature', 'signatures').first
  end

  def expand_types(types)
    types_expanded = types.map do |type|
      type_object = {
        'name' => type['name'],
        'type' => get_type(type),
        'text' => get_desc(type['comment'])
      }
      type_object['reflection'] = expand_reflection_type(type['type']) if type_object['type'] == 'object'
      type_object
    end
    alphabetize(types_expanded)
    types_expanded
  end

  def expand_interfaces(interfaces)
    interfaces_expanded = []
    interfaces.each do |interface|
      interface_object = {
        'name' => interface['name'],
        'text' => get_desc(interface['comment']),
        'properties' => []
      }
      interface['children'].each do |property|
        property_object = {
          'name' => property['name'],
          'type' => get_type(property),
          'text' => get_desc(property['comment'])
        }
        interface_object['properties'].push(property_object)
      end
      alphabetize(interface_object['properties'])
      interfaces_expanded.push(interface_object)
    end
    alphabetize(interfaces_expanded)
    interfaces_expanded
  end

  def expand_enums(enums)
    enums_expanded = []
    enums.each do |enum|
      enum_object = {
        'name' => enum['name'],
        'text' => get_desc(enum['comment']),
        'members' => []
      }
      enum['children'].each do |member|
        member_object = {
          'name' => member['name'],
          'text' => get_desc(member['comment'])
        }
        enum_object['members'].push(member_object)
      end
      alphabetize(enum_object['members'])
      enums_expanded.push(enum_object)
    end
    alphabetize(enums_expanded)
    enums_expanded
  end

  def expand_any_functions(functions, kind_string, signature_property)
    functions_expanded = []
    functions.each do |function|
      function_signature = function[signature_property].find { |sig| sig['kindString'] == kind_string }
      function_object = {
        'name' => function['name'],
        'text' => get_desc(function_signature['comment']),
        'parameters' => [],
        'returns' => get_type(function_signature),
        'returns text' => get_returns(function_signature['comment'])
      }
      unless function_signature['parameters'].nil?
        function_signature['parameters'].each do |parameter|
          parameter_object = {
            'name' => parameter['name'],
            'type' => get_type(parameter),
            'text' => get_desc(parameter['comment'])
          }
          function_object['parameters'].push(parameter_object)
        end
      end
      alphabetize(function_object['parameters'])
      functions_expanded.push(function_object)
    end
    alphabetize(functions_expanded)
    functions_expanded
  end

  # Engine

  def parse_engine
    engine_modules = get_modules(@config['engine']['source'])
    {
      'headless_engine' => get_headless_engine(engine_modules),
      'types' => expand_types(get_entities_from_modules_by_kind_string(engine_modules, 'Type alias')),
      'interfaces' => expand_interfaces(get_entities_from_modules_by_kind_string(engine_modules, 'Interface')),
      'functions' => expand_functions(get_entities_from_modules_by_kind_string(engine_modules, 'Function'))
    }
  end

  def get_headless_engine(engine_modules)
    headless_engine = get_entity_from_modules_by_name(engine_modules, 'HeadlessEngine')
    {
      'constructor' => expand_constructor(get_entity_from_module_by_name(headless_engine, 'constructor')),
      'properties' => expand_types(get_entities_from_module_by_kind_string(headless_engine, 'Property')),
      'methods' => expand_functions(get_entities_from_module_by_kind_string(headless_engine, 'Method')),
      'accessors' => expand_accessors(get_entities_from_module_by_kind_string(headless_engine, 'Accessor'))
    }
  end

  # Controllers

  def parse_controllers
    @config['controllers'].map do |controller_config|
      controller_modules = get_modules(controller_config['source'])
      {
        'initializer' => expand_functions([get_entity_from_modules_by_name(controller_modules, "build#{controller_config['name']}")]),
        'types' => expand_types(get_entities_from_modules_by_kind_string(controller_modules, 'Type alias')),
        'interfaces' => expand_interfaces(get_entities_from_modules_by_kind_string(controller_modules, 'Interface')),
        'functions' => expand_functions(get_entities_from_modules_by_kind_string(controller_modules, 'Function').reject { |function| function['name'] == "build#{controller_config['name']}"}),
        'enums' => expand_enums(get_entities_from_modules_by_kind_string(controller_modules, 'Enumeration'))
      }
    end
  end

  # Actions

  def parse_actions
    {}
  end
end

def main
  File.write(OUTPUT_PATH, JSON.pretty_generate(DocJsonParser.new(DOC_GEN_PATH, CONFIG_PATH).parse))
end

main