const pipeline = {
  use: () => pipeline,
  processSync: (input) => input,
};

module.exports = {
  unified: () => pipeline,
};
