// Simple test to verify Jest setup
describe('Jest Setup Test', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should support async tests', async () => {
    const result = await Promise.resolve('test')
    expect(result).toBe('test')
  })

  it('should support mocking', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })
}) 