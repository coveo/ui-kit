const createExplorerMessenger = () => {
  const sendMessage = () => jest.fn();
  return { sendMessage };
};

module.exports = {
  createExplorerMessenger,
};
