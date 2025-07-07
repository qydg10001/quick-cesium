function createUUID(): string {
  // 检查当前环境是否支持 crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  } else {
    // 如果环境不支持，可以考虑回退到其他方法或抛出错误
    // 注意：下面的回退方法仅为示例，不推荐在生产环境中使用 Math.random() 生成 UUID
    // 更安全的做法是使用第三方库
    console.warn(
      'crypto.randomUUID() not supported, falling back to less secure method or library.',
    )
    // 生成一个临时 UUID (简化的、不安全的)
    // 生产环境请使用库或确保 crypto.randomUUID 可用
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}

export { createUUID }
