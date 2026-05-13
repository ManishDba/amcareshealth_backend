const sendSuccess = (res, { data = null, message = 'Success', statusCode = 200, meta = null }) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, { data = null, message = 'Created successfully' }) => {
  return sendSuccess(res, { data, message, statusCode: 201 });
};

const sendPaginated = (res, { data, total, page, limit, message = 'Success' }) => {
  return sendSuccess(res, {
    data,
    message,
    meta: {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      total,
      totalPages: Math.ceil(total / (parseInt(limit) || 20)),
    },
  });
};

module.exports = { sendSuccess, sendCreated, sendPaginated };
