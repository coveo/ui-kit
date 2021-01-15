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

  # ----------------------Type Resolver-----------------------

  def get_type(type_object, section)
    return {} if type_object.nil?
    return process_string_literal(type_object) if is_type?(type_object, 'stringLiteral')
    return process_intrinsic_type(type_object) if is_type?(type_object, 'intrinsic') || is_type?(type_object, 'unknown')
    return process_array_type(type_object) if is_type?(type_object, 'array')
    return process_union_type(type_object, section) if is_type?(type_object, 'union')
    return process_intersection_type(type_object) if is_type?(type_object, 'intersection')
    return process_reference_type(type_object, section) if is_type?(type_object, 'reference')
    return process_type_parameter_type(type_object) if is_type?(type_object, 'typeParameter')
    return process_reflection_type(type_object) if is_type?(type_object, 'reflection')

    {}
  end

  def is_type?(type_object, target_type)
    type_object['type'] == target_type
  end

  def process_string_literal(type_object)
    {
      'type' => type_object['type'],
      'value' => type_object['value']
    }
  end

  def process_intrinsic_type(type_object)
    {
      'type' => type_object['type'],
      'name' => type_object['name']
    }
  end

  def process_array_type(type_object)
    {
      'type' => 'array',
      'arrayOf' => get_type(type_object['elementType'], 'array')
    }
  end

  def process_union_type(type_object, section)
    processed_type = {
      'type' => 'union',
      'unionOf' => type_object['types'].map do |type|
        get_type(type, 'union')
      end
    }
    if section == 'interface' && processed_type['unionOf'].include?({'type' => 'intrinsic', 'name' => 'undefined'})
      processed_type['optional'] = 'true'
      processed_type['unionOf'].reject! { |type| type == {'type' => 'intrinsic', 'name' => 'undefined'}}
    end
    processed_type
  end

  def process_intersection_type(type_object)
    processed_type = {
      'type' => 'intersection',
      'intersectionOf' => type_object['types'].map do |member|
        get_type(member, 'intersection')
      end
    }
  end

  def process_reference_type(type_object, section)
    processed_type = {
      'type' => 'reference',
      'name' => type_object['name']
    }
    if type_object.key?('typeArguments')
      processed_type['type_parameters'] = type_object['typeArguments'].map do |type_arg|
        get_type(type_arg, section)
      end
    end
    processed_type
  end

  def process_type_parameter_type(type_object)
    processed_type = {
      'type' => 'type_parameter',
      'name' => type_object['name']
    }
    if type_object.key?('constraint')
      processed_type['extends'] = get_type(type_object['constraint'], 'generic')
    end
    if type_object.key?('default')
      processed_type['default'] = get_type(type_object['default'], 'generic')
    end
    processed_type
  end

  def process_reflection_type(type_object)
    if type_object['declaration'].key?('children')
      {
        'type' => 'object',
        'properties' => type_object['declaration']['children'].map do |property|
          {
            'name' => property['name'],
            'type' => get_type(property['type'], 'object')
          }
        end
      }
    elsif type_object['declaration'].key?('signatures')
      processed_type = {
        'type' => 'function',
        'parameters' => [],
        'returns' => get_type(type_object['declaration']['signatures'].first['type'], 'function')
      }
      if type_object['declaration']['signatures'].first.key?('parameters')
        type_object['declaration']['signatures'].first['parameters'].each do |param|
          processed_type['parameters'].push({
            'name' => param['name'],
            'type' => get_type(param['type'], 'parameter')
          })
        end
      end
      processed_type
    else
      {}
    end
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
        'type' => get_type(type['type'], 'type'),
        'text' => get_desc(type['comment'])
      }
      type_object['type_parameters'] = expand_type_parameters(type['typeParameter']) if type.key?('typeParameter')
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
      interface_object['type_parameters'] = expand_type_parameters(interface['typeParameter']) if interface.key?('typeParameter')
      interface['children'].each do |property|
        property_object = {
          'name' => property['name'],
          'type' => get_type(property['type'], 'interface'),
          'text' => get_desc(property['comment'])
        }
        property_object['optional'] = 'true' if property['flags'].key?('isOptional')
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
        'returns' => get_type(function_signature['type'], 'function'),
        'returns text' => get_returns(function_signature['comment'])
      }
      function_object['type_parameters'] = expand_type_parameters(function_signature['typeParameter']) if function_signature.key?('typeParameter')
      unless function_signature['parameters'].nil?
        function_signature['parameters'].each do |parameter|
          parameter_object = {
            'name' => parameter['name'],
            'type' => get_type(parameter['type'], 'parameter'),
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

  def expand_initializer(function)
    function_signature = function['signatures'].find { |sig| sig['kindString'] == 'Call signature' }
    function_object = {
      'name' => function['name'],
      'text' => get_desc(function_signature['comment']),
      'parameters' => [],
      'returns' => get_controller_methods(function_signature['type']),
      'returns text' => get_returns(function_signature['comment'])
    }
    function_object['type_parameters'] = expand_type_parameters(function_signature['typeParameter']) if function_signature.key?('typeParameter')
    unless function_signature['parameters'].nil?
      function_signature['parameters'].each do |parameter|
        parameter_object = {
          'name' => parameter['name'],
          'type' => get_type(parameter['type'], 'parameter'),
          'text' => get_desc(parameter['comment'])
        }
        function_object['parameters'].push(parameter_object)
      end
    end
    alphabetize(function_object['parameters'])
    function_object
  end

  def get_controller_methods(type_object)
    functions = []
    accessors = []
    type_object['declaration']['children'].each do |method|
      functions.push(method) if method['kindString'] == 'Function'
      accessors.push(method) if method['kindString'] == 'Accessor'
    end
    {
      'methods' => expand_functions(functions),
      'accessors' => expand_accessors(accessors)
    }
  end

  def expand_actions(actions)
    actions.map do |action|
      {
        'name' => action['name'],
        'text' => get_desc(action['comment']),
        'parameters' => get_action_parameters(action)
      }
    end
  end

  def get_action_parameters(action)
    return [] if action['comment'].nil? || action['comment']['tags'].nil?

    action['comment']['tags'].map do |param|
      {
        'name' => param['param'],
        'text' => get_desc(param)
      }
    end
  end

  def expand_type_parameters(type_parameters)
    type_parameters.map do |param|
      obj = {
        'name' => param['name']
      }
      obj['extends'] = get_type(param['type'], 'generic')
      obj
    end
  end

  # Engine

  def parse_engine
    engine_modules = []
    @config['engine']['sources'].each { |source| engine_modules.concat(get_modules(source)) }
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
      controller_modules = []
      controller_config['sources'].each { |source| controller_modules.concat(get_modules(source)) }
      {
        'name' => controller_config['name'],
        'initializer' => expand_initializer(get_entity_from_modules_by_name(controller_modules, "build#{controller_config['name']}")),
        'types' => expand_types(get_entities_from_modules_by_kind_string(controller_modules, 'Type alias')),
        'interfaces' => expand_interfaces(get_entities_from_modules_by_kind_string(controller_modules, 'Interface')),
        'functions' => expand_functions(get_entities_from_modules_by_kind_string(controller_modules, 'Function').reject { |function| function['name'] == "build#{controller_config['name']}"}),
        'enums' => expand_enums(get_entities_from_modules_by_kind_string(controller_modules, 'Enumeration'))
      }
    end
  end

  # Actions

  def parse_actions
    @config['actions']['sections'].map do |section|
      section_modules = []
      section['sources'].each { |source| section_modules.concat(get_modules(source)) }
      actions = get_entities_from_modules_by_kind_string(section_modules, 'Variable')
      actions.concat(get_entities_from_modules_by_kind_string(section_modules, 'Function'))
      actions.select! do |action|
        action['flags'].key?('isExported') && action['flags']['isExported']
      end
      {
        'section' => section['name'],
        'actions' => expand_actions(actions)
      }
    end
  end
end

def main
  File.write(OUTPUT_PATH, JSON.pretty_generate(DocJsonParser.new(DOC_GEN_PATH, CONFIG_PATH).parse))
end

main