function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const e = new Error('Validation failed');
      e.status = 400;
      e.details = error.details.map((d) => d.message);
      return next(e);
    }
    req[source] = value;
    next();
  };
}

module.exports = { validate };
