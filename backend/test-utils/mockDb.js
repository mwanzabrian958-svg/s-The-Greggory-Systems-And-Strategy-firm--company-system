'use strict';

function createMockDb() {
  const db = {
    store: {},
    knownTables: [],
    __seed(tableName, rows) {
      this.store[tableName] = rows.map((r) => ({ ...r }));
      if (!this.knownTables.includes(tableName)) this.knownTables.push(tableName);
    },
    __knownTables() {
      return this.knownTables;
    },
    __clear() {
      this.store = {};
      this.knownTables = [];
    },
  };

  const store = db.store;
  const knownTables = db.knownTables;

  function selectFrom(sql, params) {
    const tblMatch = sql.match(/FROM\s+`?(\w+)`?\s/gi);
    if (!tblMatch) return [[]];
    const lastFrom = tblMatch[tblMatch.length - 1];
    const tableName = lastFrom.replace(/^FROM\s+`?(\w+)`?/i, '$1').trim();
    let rows = store[tableName] || [];
    const lower = sql.toLowerCase();
    const whereIdx = lower.indexOf('where');
    const orderIdx = lower.indexOf('order by');
    const limitIdx = lower.indexOf('limit');

    if (whereIdx !== -1) {
      const end = orderIdx !== -1 ? orderIdx : limitIdx !== -1 ? limitIdx : sql.length;
      const whereClause = sql.slice(whereIdx + 5, end).trim();
      if (params && params.length) {
        let clause = whereClause;
        for (let i = 0; i < params.length; i++) {
          const p = params[i];
          clause = clause.replace(
            /\?/,
            typeof p === 'number' ? String(p) : `'${String(p).replace(/'/g, "\\'")}'`,
          );
        }
        rows = rows.filter((row) => {
          try {
            let expr = clause;
            const eqMatch = expr.match(/^(\w+)\s*=\s*'([^']*)'$/);
            if (eqMatch) {
              const col = eqMatch[1];
              const val = eqMatch[2];
              if (row[col] !== undefined) return String(row[col]) === val;
            }
            const isNullMatch = expr.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
            if (isNullMatch) {
              const col = isNullMatch[1];
              const isNot = !!isNullMatch[2];
              const v = row[col];
              if (v === null || v === undefined) return !isNot;
              return isNot;
            }
            const andParts = expr.split(/\s+AND\s+/i);
            if (andParts.length > 1) {
              return andParts.every((part) => {
                const eq = part.match(/^(\w+)\s*=\s*'([^']*)'$/);
                if (eq) {
                  const col = eq[1];
                  const val = eq[2];
                  if (row[col] !== undefined) return String(row[col]) === val;
                }
                const isNull = part.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
                if (isNull) {
                  const col = isNull[1];
                  const isNot = !!isNull[2];
                  const v = row[col];
                  if (v === null || v === undefined) return !isNot;
                  return isNot;
                }
                return true;
              });
            }
            return true;
          } catch (_) {
            return true;
          }
        });
      }
    }

    const orderClause = sql.match(/ORDER BY\s+(\w+)\s*(ASC|DESC)/i);
    if (orderClause) {
      const col = orderClause[1];
      const dir = orderClause[2] && orderClause[2].toUpperCase() === 'DESC' ? -1 : 1;
      rows = [...rows].sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (av === bv) return 0;
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        return av > bv ? dir : -dir;
      });
    }

    const limitClause = sql.match(/LIMIT\s+(\d+)/i);
    if (limitClause) rows = rows.slice(0, parseInt(limitClause[1], 10));

    return [rows];
  }

  function insertInto(sql, params) {
    const tblMatch = sql.match(/INTO\s+`?(\w+)`?\s/);
    if (!tblMatch) return { affectedRows: 0, insertId: 0 };
    const tableName = tblMatch[1];
    const colListMatch = sql.match(/`((\w+(, \w+)*))`\s/);
    let columns = [];
    if (colListMatch) columns = colListMatch[1].split(', ');
    const existing = store[tableName] || [];
    const idCol = 'id';
    let targetRow = null;
    if (columns.includes(idCol) && params.length === columns.length) {
      const idVal = params[columns.indexOf(idCol)];
      targetRow = existing.find((r) => String(r[idCol]) === String(idVal));
    }
    if (targetRow) {
      columns.forEach((col, i) => {
        if (i < params.length) targetRow[col] = params[i];
      });
      targetRow.updated_at = new Date();
      return { affectedRows: 1, insertId: targetRow[idCol] };
    }
    const newRow = {};
    columns.forEach((col, i) => {
      if (i < params.length) newRow[col] = params[i];
    });
    if (newRow[idCol] === undefined || newRow[idCol] === null) {
      newRow[idCol] = 1;
      if (existing.length) {
        const maxId = Math.max(...existing.map((r) => Number(r[idCol]) || 0));
        newRow[idCol] = maxId + 1;
      }
    }
    newRow.created_at = new Date();
    newRow.updated_at = new Date();
    existing.push(newRow);
    store[tableName] = existing;
    if (!knownTables.includes(tableName)) knownTables.push(tableName);
    return { affectedRows: 1, insertId: newRow[idCol] };
  }

  function deleteFrom(sql, params) {
    const tblMatch = sql.match(/FROM\s+`?(\w+)`?\s/);
    if (!tblMatch) return { affectedRows: 0, insertId: 0 };
    const tableName = tblMatch[1];
    const existing = store[tableName] || [];
    if (params && params.length) {
      const idVal = params[0];
      const idx = existing.findIndex((r) => String(r.id) === String(idVal));
      if (idx !== -1) {
        existing.splice(idx, 1);
        store[tableName] = existing;
        return { affectedRows: 1, insertId: idVal };
      }
    }
    return { affectedRows: 0, insertId: 0 };
  }

  function updateIn(sql, params) {
    const tblMatch = sql.match(/UPDATE\s+`?(\w+)`?\s/);
    if (!tblMatch) return { affectedRows: 0, insertId: 0 };
    const tableName = tblMatch[1];
    const existing = store[tableName] || [];
    const whereIdx = sql.toLowerCase().indexOf('where');
    if (whereIdx === -1) return { affectedRows: 0, insertId: 0 };
    const whereClause = sql.slice(whereIdx + 5).trim();
    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) return { affectedRows: 0, insertId: 0 };
    const setClause = setMatch[1];
    const setQm = (setClause.match(/\?/g) || []).length;
    const whereQm = (whereClause.match(/\?/g) || []).length;
    const setParams = params.slice(0, setQm);
    const whereParams = params.slice(setQm, setQm + whereQm);
    const updateMap = {};
    let si = 0;
    setClause.split(',').forEach((s) => {
      const parts = s.trim().split(/\s*=\s*/);
      if (parts.length === 2) {
        updateMap[parts[0].trim()] =
          parts[1].trim() === '?' ? setParams[si++] : parts[1].trim().replace(/'/g, '');
      }
    });
    let wi = 0;
    let whereExpr = whereClause.replace(/\?/g, () => {
      const p = whereParams[wi++];
      return typeof p === 'number' ? String(p) : `'${String(p).replace(/'/g, "\\'")}'`;
    });
    const matched = existing.filter((row) => {
      try {
        const andParts = whereExpr.split(/\s+AND\s+/i);
        return andParts.every((part) => {
          const eq = part.match(/^(\w+)\s*=\s*'([^']*)'$/);
          if (eq) {
            const col = eq[1];
            const val = eq[2];
            if (row[col] !== undefined) return String(row[col]) === val;
          }
          const isNull = part.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
          if (isNull) {
            const col = isNull[1];
            const isNot = !!isNull[2];
            const v = row[col];
            if (v === null || v === undefined) return !isNot;
            return isNot;
          }
          return true;
        });
      } catch (_) {
        return true;
      }
    });
    matched.forEach((row) => {
      Object.keys(updateMap).forEach((col) => {
        row[col] = updateMap[col];
      });
      row.updated_at = new Date();
    });
    return { affectedRows: matched.length, insertId: 0 };
  }

  db.promise = function () {
    return {
      query(sql, params) {
        const upper = sql.trim().toUpperCase();
        if (upper.startsWith('SELECT')) return Promise.resolve(selectFrom(sql, params));
        if (upper.startsWith('INSERT')) return Promise.resolve([insertInto(sql, params)]);
        if (upper.startsWith('UPDATE')) return Promise.resolve([updateIn(sql, params)]);
        if (upper.startsWith('DELETE')) return Promise.resolve([deleteFrom(sql, params)]);
        return Promise.resolve([[]]);
      },
      execute(sql, params) {
        return db.promise().query(sql, params);
      },
      getConnection(cb) {
        if (cb) {
          cb(null, {
            query(sql, params, cb2) {
              db.promise()
                .query(sql, params)
                .then(([r]) => cb2(null, r))
                .catch((e) => cb2(e));
            },
            execute(sql, params, cb2) {
              db.promise()
                .execute(sql, params)
                .then((r) => cb2(null, r))
                .catch((e) => cb2(e));
            },
            release() {},
          });
        }
        return Promise.resolve({ query: () => {}, execute: () => {}, release: () => {} });
      },
    };
  };

  db.query = function (sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    try {
      cb(null, selectFrom(sql, params)[0]);
    } catch (e) {
      cb(e);
    }
  };

  db.execute = function (sql, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      params = [];
    }
    try {
      cb(
        null,
        insertInto(sql, params) || deleteFrom(sql, params) || { affectedRows: 0, insertId: 0 },
      );
    } catch (e) {
      cb(e);
    }
  };

  db.end = function (cb) {
    cb && cb();
  };
  return db;
}

module.exports = { createMockDb };
