module.exports = {
  createInterface: jest.fn().mockReturnValue({
    question: jest.fn(),
    close: jest.fn(),
    on: jest.fn(),
  }),
};
