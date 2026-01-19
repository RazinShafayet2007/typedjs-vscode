module.exports = {
  meta: {
    type: "problem",
    docs: { description: "Deep property validation for TypedJS" },
    messages: {
      typeMismatch: "Type Mismatch: Expected '{{ expected }}' but got '{{ actual }}'.",
      missingProperty: "Property '{{ propName }}' is missing in type '{{ interfaceName }}'.",
      extraProperty: "Property '{{ propName }}' does not exist in type '{{ interfaceName }}'."
    }
  },
  create(context) {
    const typeRegistry = new Map();

    function getTypeName(node) {
      if (!node) return "any";
      if (node.type === 'TSUnionType') return node.types.map(t => getTypeName(t)).join(' | ');
      if (node.type.startsWith('TS') && node.type.endsWith('Keyword')) {
        return node.type.replace('TS', '').replace('Keyword', '').toLowerCase();
      }
      if (node.type === 'TSTypeReference') return node.typeName.name;
      return "unknown";
    }

    function getActualType(init) {
      if (!init) return "undefined";
      if (init.type === "Literal") {
        if (init.bigint) return "bigint";
        return typeof init.value;
      }
      if (init.type === "ObjectExpression") return "object";
      return "complex-type";
    }

    return {
      // 1. Store Interface Members with their types
      TSInterfaceDeclaration(node) {
        const members = {};
        node.body.body.forEach(prop => {
          if (prop.type === "TSPropertySignature") {
            members[prop.key.name] = getTypeName(prop.typeAnnotation?.typeAnnotation);
          }
        });
        typeRegistry.set(node.id.name, { type: "interface", members });
      },

      VariableDeclarator(node) {
        const typeAnnotation = node.id.typeAnnotation?.typeAnnotation;
        const init = node.init;
        if (!typeAnnotation || !init) return;

        let expected = getTypeName(typeAnnotation);
        const actual = getActualType(init);

        // 2. Handle Object Literal Validation against Interfaces
        if (actual === "object" && typeRegistry.has(expected)) {
          const registered = typeRegistry.get(expected);

          if (registered.type === "interface") {
            const assignedProps = {};
            init.properties.forEach(p => {
              assignedProps[p.key.name] = p.value;
            });

            // Check if all required members are present and correct
            for (const [propName, propType] of Object.entries(registered.members)) {
              if (!(propName in assignedProps)) {
                context.report({
                  node: init,
                  messageId: "missingProperty",
                  data: { propName, interfaceName: expected }
                });
              } else {
                const valueNode = assignedProps[propName];
                const valueType = getActualType(valueNode);
                if (!propType.includes(valueType)) {
                  context.report({
                    node: valueNode,
                    messageId: "typeMismatch",
                    data: { expected: propType, actual: valueType }
                  });
                }
              }
            }
            return; // Finished deep check
          }
        }

        // Standard check for primitives
        if (!expected.includes(actual)) {
          context.report({
            node: init,
            messageId: "typeMismatch",
            data: { expected, actual }
          });
        }
      }
    };
  }
};