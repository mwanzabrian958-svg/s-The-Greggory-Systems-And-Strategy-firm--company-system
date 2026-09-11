/**
 * Standardized API response helpers.
 *
 * Usage:
 *   return success(res, { users: [...] });
 *   return success(res, { id: result.insertId }, 201);
 *   return error(res, 'Not found', 404);
 *   return error(res, 'Validation failed', 400, [{ field: 'email', message: 'Invalid' }]);
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {object} data - Payload to include under `data`.
 * @param {number} [status=200]
 */
function success(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, ...data });
}

/**
 * Send a created (201) response.
 * @param {import('express').Response} res
 * @param {object} data
 */
function created(res, data = {}) {
  return success(res, data, 201);
}

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {string} message - Human-readable error message.
 * @param {number} [status=500]
 * @param {Array<{field:string,message:string}>} [errors] - Optional validation details.
 */
function error(res, message = 'Internal server error', status = 500, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
}

/**
 * Send a paginated response.
 * @param {import('express').Response} res
 * @param {Array} items - Result rows.
 * @param {number} total - Total count (unpaginated).
 * @param {number} page - 1-based page number.
 * @param {number} limit - Items per page.
 */
function paginated(res, items, total, page = 1, limit = 20) {
  return res.status(200).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}

module.exports = { success, created, error, paginated };
