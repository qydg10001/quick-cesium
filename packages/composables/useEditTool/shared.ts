// import { ... } from 'cesium';

// 可以在这里定义共享的常量或辅助函数
// export const DEFAULT_LINE_COLOR = CesiumColor.RED;
// export const DEFAULT_FILL_COLOR = CesiumColor.RED.withAlpha(0.3);

// 如果 abortCallback 确实需要跨 useEditTool 实例共享，可以放在这里
// 但通常 hook 的状态是实例独立的，除非有特殊需求。
// 考虑到您原代码的注释，我们暂时保留在 index.ts 中，表示所有实例共用一个绘制状态。
// 如果未来需要每个实例独立，则需要将 abortCallback 移入 useEditTool 内部。
