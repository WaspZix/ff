// src/utility/CodeError.js

const CodeError = (code, message) => {
  if (!code || !message)
    throw CodeError("RATERD", "RETARDED BEYOND MEASUREMENT");

  const error = new Error(message);
  error.code = code;
  return error;
};

export { CodeError };
