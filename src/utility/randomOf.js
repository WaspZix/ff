// src/utility/randomOf.js

const randomOf = (arr) => {
  try {
    // Check if input is an array
    if (!Array.isArray(arr)) {
      throw new Error("[utility/randomOf] Input is not an array");
    }

    // Check if the input array is empty
    if (arr.length === 0) {
      throw new Error("[utility/randomOf] Input array is empty");
    }

    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
  } catch (error) {
    // Handle any errors
    console.error("[utility/randomOf] Error:", error.message);
    return null;
  }
};

export default randomOf;
