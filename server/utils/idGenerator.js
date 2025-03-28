// Only digits, length 6
const generateFoodId = async (Model) => {
  const { customAlphabet } = await import('nanoid');
  const nanoDigits = customAlphabet('0123456789', 6);

  let id;
  let exists = true;
  while (exists) {
    id = `F-${nanoDigits()}`;
    exists = await Model.exists({ food_id: id });
  }
  return id;
};

const generateServingId = async (Model) => {
  const { customAlphabet } = await import('nanoid');
  const nanoDigits = customAlphabet('0123456789', 6);

  let id;
  let exists = true;
  while (exists) {
    id = `S-${nanoDigits()}`;
    exists = await Model.exists({ serving_id: id });
  }
  return id;
};

module.exports = { generateFoodId, generateServingId };