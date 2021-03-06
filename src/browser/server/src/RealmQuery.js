const Types = require('../../../../www/Types');

const Case = Types.Case.enum;
const Sort = Types.Sort.enum;

const DEFAULT_LIMIT = 40;

function escapeValue(value) {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return value;
}

function addImplicitAnd(ops) {
  const expression = [];
  const numOfops = ops.length;
  let i = 0;
  while (i < numOfops) {
    const op = ops[i];
    const { name } = op;
    const { name: nextOpName } =
      i + 1 < numOfops ? ops[i + 1] : { name: undefined };
    if (
      nextOpName === 'beginGroup' ||
      nextOpName === 'or' ||
      nextOpName === 'not' ||
      nextOpName === undefined
    ) {
      expression.push(op);
    } else if (nextOpName !== undefined) {
      expression.push(op);
      if (nextOpName !== 'or' && nextOpName !== 'endGroup') {
        expression.push({ name: 'and' });
      }
    }
    i++;
  }
  return expression;
}

function process(ops) {
  const expression = [];
  let limit = DEFAULT_LIMIT;
  let offset = 0;
  if (Array.isArray(ops)) {
    ops.forEach(op => {
      const { name, args } = op;
      if (name === 'limit') {
        limit = args[0];
      } else if (name === 'offset') {
        offset = args[0];
      } else {
        expression.push(op);
      }
    });
  }
  return { expression, limit, offset };
}

function createQuery(expression) {
  return addImplicitAnd(expression)
    .reduce((query, op) => {
      const args = op.args;
      switch (op.name) {
        case 'beginGroup':
          query.push('(');
          break;
        case 'beginsWith':
          const caseSensitive = args.length === 3 && args[2] === Case.SENSITIVE;
          const caseOp = `BEGINSWITH${caseSensitive ? '' : '[c]'}`;
          query.push(`${args[0]} ${caseOp} ${escapeValue(args[1])}`);
          break;
        case 'between': {
          const field = args[0];
          const arg1 = escapeValue(args[1]);
          const arg2 = escapeValue(args[2]);
          query.push(`${field} >= ${arg1} and ${field} <= ${arg2}`);
          break;
        }
        case 'contains': {
          const field = args[0];
          const caseSensitive = args.length === 3 && args[2] === Case.SENSITIVE;
          const caseOp = `CONTAINS${caseSensitive ? '' : '[c]'}`;
          const arg1 = escapeValue(args[1]);
          query.push(`${field} ${caseOp} ${arg1}`);
          break;
        }
        case 'endGroup':
          query.push(')');
          break;
        case 'endsWith': {
          const field = args[0];
          const caseSensitive = args.length === 3 && args[2] === Case.SENSITIVE;
          const caseOp = `ENDSWITH${caseSensitive ? '' : '[c]'}`;
          const arg1 = escapeValue(args[1]);
          query.push(`${field} ${caseOp} ${arg1}`);
          break;
        }
        case 'equalTo': {
          const caseSensitive = args.length === 3 && args[2] === Case.SENSITIVE;
          const caseOp = `==${caseSensitive ? '' : '[c]'}`;
          query.push(`${args[0]} ${caseOp} ${escapeValue(args[1])}`);
          break;
        }
        case 'greaterThan':
          query.push(`${args[0]} > ${escapeValue(args[1])}`);
          break;
        case 'greaterThanOrEqualTo':
          query.push(`${args[0]} >= ${escapeValue(args[1])}`);
          break;
        case 'in': {
          console.warn('Not supported in the browser');
          // FIXME!
          const caseSensitive = args.length === 3 && args[2] === Case.SENSITIVE;
          const caseOp = `IN${caseSensitive ? '' : '[c]'}`;
          query.push(`${args[0]} IN ${escapeValue(args[1])}`);
          break;
        }
        case 'isEmpty':
        case 'isNotEmpty':
        case 'isNotNull':
        case 'isNull':
          break;
        case 'lessThan':
          query.push(`${args[0]} < ${escapeValue(args[1])}`);
          break;
        case 'lessThanOrEqualTo':
          query.push(`${args[0]} <= ${escapeValue(args[1])}`);
          break;
        case 'notEqualTo': {
          const caseSensitive = args.length === 3 && args[2] === Case.SENSITIVE;
          const caseOp = `!={caseSensitive ? '' : '[c]'}`;
          query.push(`${args[0]} ${caseOp} ${escapeValue(args[1])}`);
          break;
        }
        case 'not':
        case 'and':
        case 'or':
          query.push(op.name);
          break;
      }
      return query;
    }, [])
    .join(' ');
}

function findAll(realm, schemaName, ops) {
  let objects = realm.objects(schemaName);
  const { expression, limit, offset } = process(ops);
  if (expression.length > 0) {
    objects = objects.filtered(createQuery(expression));
  }

  return objects.slice(offset, limit);
}

function findAllSorted(realm, schemaName, ops, sortField, sortOrder) {
  const { expression, limit, offset } = process(ops);

  let objects = realm.objects(schemaName);
  if (expression.length > 0) {
    objects = objects.filtered(createQuery(expression));
  }

  let sortDescriptor;
  if (sortOrder === undefined) {
    sortDescriptor = sortField;
  } else {
    sortDescriptor = [sortField, sortOrder];
  }
  if (sortDescriptor !== undefined) {
    objects = objects.sorted(sortDescriptor);
  }

  return objects.slice(offset, limit);
}

module.exports = {
  findAll,
  findAllSorted
};
