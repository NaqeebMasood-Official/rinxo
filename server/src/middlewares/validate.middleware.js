// Why needed: Validate request data against predefined schemas to ensure data integrity and prevent malformed data from reaching route handlers.

// When to use: Forms, filters, or any user input that needs validation before processing.

import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array(),
    });
  }

  next();
};
