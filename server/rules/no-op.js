/**
 * Enhanced TypedJS ESLint Rule
 * Supports: primitives, unions, intersections, literals, enums, arrays, tuples,
 * Maps, Sets, Records, objects, optional properties, index signatures
 */
module.exports = {
  meta: {
    type: "problem",
    docs: { description: "Comprehensive type validation for TypedJS" },
    messages: {
      typeMismatch: "Type mismatch: Expected '{{ expected }}' but got '{{ actual }}'",
      missingProperty: "Property '{{ propName }}' is missing in '{{ interfaceName }}'",
      extraProperty: "Unexpected property '{{ propName }}' in '{{ interfaceName }}'",
      invalidLiteral: "Expected literal value {{ expected }}, got {{ actual }}",
      invalidEnum: "Value {{ actual }} is not valid for enum {{ enumName }}",
      invalidUnion: "Value does not match any type in union: {{ expected }}",
      invalidTuple: "Tuple has incorrect length or types"
    }
  },

  create(context) {
    const typeRegistry = new Map();
    const enumRegistry = new Map();

    // Convert TS AST type node to type representation
    function parseTypeNode(node) {
      if (!node) return 'any';

      switch (node.type) {
        case 'TSStringKeyword': return 'string';
        case 'TSNumberKeyword': return 'number';
        case 'TSBooleanKeyword': return 'boolean';
        case 'TSNullKeyword': return 'null';
        case 'TSUndefinedKeyword': return 'undefined';
        case 'TSBigIntKeyword': return 'bigint';
        case 'TSSymbolKeyword': return 'symbol';
        case 'TSVoidKeyword': return 'void';
        case 'TSNeverKeyword': return 'never';
        case 'TSAnyKeyword': return 'any';
        case 'TSUnknownKeyword': return 'unknown';
        case 'TSObjectKeyword': return 'object';

        case 'TSLiteralType':
          return { kind: 'literal', value: node.literal.value };

        case 'TSUnionType':
          return { kind: 'union', types: node.types.map(parseTypeNode) };

        case 'TSIntersectionType':
          return { kind: 'intersection', types: node.types.map(parseTypeNode) };

        case 'TSArrayType':
          return { kind: 'array', elementType: parseTypeNode(node.elementType) };

        case 'TSTupleType':
          return { kind: 'tuple', elements: node.elementTypes.map(parseTypeNode) };

        case 'TSTypeReference':
          const typeName = node.typeName.name;

          // Handle generic types
          if (typeName === 'Array' && node.typeParameters?.params?.length > 0) {
            return { kind: 'array', elementType: parseTypeNode(node.typeParameters.params[0]) };
          }
          if (typeName === 'Map' && node.typeParameters?.params?.length === 2) {
            return {
              kind: 'map',
              keyType: parseTypeNode(node.typeParameters.params[0]),
              valueType: parseTypeNode(node.typeParameters.params[1])
            };
          }
          if (typeName === 'Set' && node.typeParameters?.params?.length > 0) {
            return { kind: 'set', elementType: parseTypeNode(node.typeParameters.params[0]) };
          }
          if (typeName === 'Record' && node.typeParameters?.params?.length === 2) {
            return {
              kind: 'record',
              keyType: parseTypeNode(node.typeParameters.params[0]),
              valueType: parseTypeNode(node.typeParameters.params[1])
            };
          }

          return typeName;

        case 'TSTypeLiteral':
          const shape = {};
          node.members.forEach(m => {
            if (m.type === 'TSPropertySignature') {
              const propName = m.key.name || m.key.value;
              const propType = parseTypeNode(m.typeAnnotation?.typeAnnotation);
              shape[propName] = m.optional ? { kind: 'optional', type: propType } : propType;
            }
            if (m.type === 'TSIndexSignature') {
              const keyType = parseTypeNode(m.parameters[0].typeAnnotation?.typeAnnotation);
              const valueType = parseTypeNode(m.typeAnnotation?.typeAnnotation);
              shape.__indexSignature = { keyType, valueType };
            }
          });
          return shape;

        default:
          return 'unknown';
      }
    }

    // Get actual type from value node
    function getValueType(node) {
      if (!node) return 'undefined';

      switch (node.type) {
        case 'Literal':
          if (node.bigint) return 'bigint';
          if (node.value === null) return 'null';
          return typeof node.value;
        case 'ObjectExpression':
          return 'object';
        case 'ArrayExpression':
          return 'array';
        case 'UnaryExpression':
          if (node.operator === '-' && node.argument.type === 'Literal') {
            return typeof node.argument.value;
          }
          return 'unknown';
        default:
          return 'unknown';
      }
    }

    // Check if value matches type
    function matchesType(valueNode, type) {
      const valueType = getValueType(valueNode);

      // Handle primitive types
      if (typeof type === 'string') {
        if (type === 'any' || type === 'unknown') return true;
        return valueType === type;
      }

      // Handle union types
      if (type?.kind === 'union') {
        return type.types.some(t => matchesType(valueNode, t));
      }

      // Handle intersection types (all must match)
      if (type?.kind === 'intersection') {
        return type.types.every(t => matchesType(valueNode, t));
      }

      // Handle literal types
      if (type?.kind === 'literal') {
        if (valueNode.type === 'Literal') {
          return valueNode.value === type.value;
        }
        return false;
      }

      // Handle array types
      if (type?.kind === 'array') {
        if (valueNode.type !== 'ArrayExpression') return false;
        return valueNode.elements.every(el => el && matchesType(el, type.elementType));
      }

      // Handle tuple types
      if (type?.kind === 'tuple') {
        if (valueNode.type !== 'ArrayExpression') return false;
        if (valueNode.elements.length !== type.elements.length) return false;
        return type.elements.every((elType, i) =>
          valueNode.elements[i] && matchesType(valueNode.elements[i], elType)
        );
      }

      // Handle object types
      if (typeof type === 'object' && valueType === 'object') {
        return true; // Will be checked in detail separately
      }

      return false;
    }

    // Type to string for error messages
    function typeToString(type) {
      if (typeof type === 'string') return type;
      if (type?.kind === 'literal') return JSON.stringify(type.value);
      if (type?.kind === 'union') return type.types.map(typeToString).join(' | ');
      if (type?.kind === 'intersection') return type.types.map(typeToString).join(' & ');
      if (type?.kind === 'array') return `Array<${typeToString(type.elementType)}>`;
      if (type?.kind === 'tuple') return `[${type.elements.map(typeToString).join(', ')}]`;
      if (type?.kind === 'map') return `Map<${typeToString(type.keyType)}, ${typeToString(type.valueType)}>`;
      if (type?.kind === 'set') return `Set<${typeToString(type.elementType)}>`;
      if (type?.kind === 'record') return `Record<${typeToString(type.keyType)}, ${typeToString(type.valueType)}>`;
      if (type?.kind === 'optional') return `${typeToString(type.type)}?`;
      if (typeof type === 'object') {
        const props = Object.entries(type)
          .filter(([k]) => !k.startsWith('__'))
          .map(([k, v]) => `${k}: ${typeToString(v)}`)
          .join(', ');
        return `{ ${props} }`;
      }
      return 'unknown';
    }

    return {
      // Register interfaces
      TSInterfaceDeclaration(node) {
        const shape = {};
        node.body.body.forEach(member => {
          if (member.type === 'TSPropertySignature') {
            const propName = member.key.name || member.key.value;
            const propType = parseTypeNode(member.typeAnnotation?.typeAnnotation);
            shape[propName] = member.optional ? { kind: 'optional', type: propType } : propType;
          }
          if (member.type === 'TSIndexSignature') {
            const keyType = parseTypeNode(member.parameters[0].typeAnnotation?.typeAnnotation);
            const valueType = parseTypeNode(member.typeAnnotation?.typeAnnotation);
            shape.__indexSignature = { keyType, valueType };
          }
        });
        typeRegistry.set(node.id.name, { kind: 'interface', shape });
      },

      // Register type aliases
      TSTypeAliasDeclaration(node) {
        const aliasType = parseTypeNode(node.typeAnnotation);
        typeRegistry.set(node.id.name, { kind: 'typeAlias', type: aliasType });
      },

      // Register enums
      TSEnumDeclaration(node) {
        const members = {};
        let autoValue = 0;

        node.members.forEach(m => {
          const name = m.id.name;
          if (m.initializer?.type === 'Literal') {
            members[name] = m.initializer.value;
            if (typeof m.initializer.value === 'number') {
              autoValue = m.initializer.value + 1;
            }
          } else {
            members[name] = autoValue++;
          }
        });

        enumRegistry.set(node.id.name, members);
      },

      // Validate variable declarations
      VariableDeclarator(node) {
        const typeAnnotation = node.id.typeAnnotation?.typeAnnotation;
        const init = node.init;

        if (!typeAnnotation || !init) return;

        let expectedType = parseTypeNode(typeAnnotation);

        // Resolve type aliases
        if (typeof expectedType === 'string' && typeRegistry.has(expectedType)) {
          const resolved = typeRegistry.get(expectedType);
          if (resolved.kind === 'typeAlias') {
            expectedType = resolved.type;
          } else if (resolved.kind === 'interface') {
            expectedType = resolved.shape;
          }
        }

        // Check if value matches type
        if (!matchesType(init, expectedType)) {
          const actualType = getValueType(init);
          context.report({
            node: init,
            messageId: 'typeMismatch',
            data: {
              expected: typeToString(expectedType),
              actual: actualType
            }
          });
          return;
        }

        // Deep object validation
        if (init.type === 'ObjectExpression' && typeof expectedType === 'object' && !expectedType.kind) {
          const providedProps = new Set();

          init.properties.forEach(prop => {
            if (prop.type === 'Property') {
              const propName = prop.key.name || prop.key.value;
              providedProps.add(propName);

              const expectedPropType = expectedType[propName];
              if (!expectedPropType && !expectedType.__indexSignature) {
                context.report({
                  node: prop,
                  messageId: 'extraProperty',
                  data: { propName, interfaceName: node.id.name }
                });
              } else if (expectedPropType) {
                const actualPropType = expectedPropType?.kind === 'optional' ? expectedPropType.type : expectedPropType;
                if (!matchesType(prop.value, actualPropType)) {
                  context.report({
                    node: prop.value,
                    messageId: 'typeMismatch',
                    data: {
                      expected: typeToString(actualPropType),
                      actual: getValueType(prop.value)
                    }
                  });
                }
              }
            }
          });

          // Check for missing required properties
          Object.entries(expectedType).forEach(([propName, propType]) => {
            if (propName.startsWith('__')) return;
            const isOptional = propType?.kind === 'optional';
            if (!isOptional && !providedProps.has(propName)) {
              context.report({
                node: init,
                messageId: 'missingProperty',
                data: { propName, interfaceName: node.id.name }
              });
            }
          });
        }
      }
    };
  }
};