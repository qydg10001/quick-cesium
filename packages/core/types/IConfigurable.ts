// 定义接口
// 包含约束 toJSONConfig 实例方法
interface IConfigurable<TConfig extends object> {
  toConfig: () => TConfig
}

// 定义一个类型检查 Type
// 要求检查的 Class 可以被 new 调用，并且接受一个 TConfig 类型的参数，返回一个实现了 IConfigurable<TConfig> 的实例
// type ConfigurableClassType<T extends IConfigurable<TConfig>, TConfig extends object> = {
//   new (config: TConfig): T
// }

// 定义一个类型检查 Type
// 要求检查的 Class 有 fromConfig 静态方法，用于接受一个 TConfig 配置，返回一个实现了 IConfigurable<TConfig> 的实例
type ConfigurableClassType<T extends IConfigurable<TConfig>, TConfig extends object> = {
  // new (config: TConfig): T
  fromConfig(config: TConfig): T
}

// 类型检查语句
// 在具体实现类MyComponent中使用，MyComponentConfig为配置类型
// const _checkMyComponentType: ConfigurableClassType<MyComponent, MyComponentConfig> = MyComponent;

export type { IConfigurable, ConfigurableClassType }
