# MotionForge 3D

浏览器端 3D 动效工作台原型，支持：

- OBJ / FBX 本地导入（模型不会上传）
- 悬浮旋转、拖拽位移、环绕运镜、波浪变形
- 材质颜色、速度、强度、镜头距离与变换参数
- GIF 循环动画和 SVG 当前视图导出
- SVG / OBJ / FBX 固定背景导入，以及程序化世界球背景
- 三款灯光预设与主光、环境光、颜色、方向控制
- 两款相机预设与焦距、聚焦位置、桶形/枕形镜头畸变
- WEB 实时交互包导出：生成仅包含中央 3D 显示窗的 HTML 播放器、场景预设、资源文件和 iframe 嵌入示例

## 接入导出的画布

导出页面包含明确的 `<canvas id="motionforge-canvas">`，加载完成后可通过 `window.MotionForgeCanvas` 控制：

```js
window.addEventListener('motionforge-ready', () => {
  MotionForgeCanvas.setInteraction('drag');
  MotionForgeCanvas.setModelColor('#ff6644');
  MotionForgeCanvas.pause();
  MotionForgeCanvas.play();
});
```

通过 iframe 接入时，也可以发送消息：

```js
viewer.contentWindow.postMessage({
  source: 'motionforge',
  action: 'setInteraction',
  value: 'deform'
}, '*');
```

背景由独立场景节点管理，不会参与前景模型的旋转、拖拽或变形动画。
导入的背景模型会以自身包围盒中心对齐前景 3D 模型的世界中心，并可通过相对偏移独立调整位置、统一缩放和材质颜色。

## 运行

ES Modules 必须通过本地服务器访问。在本目录执行：

```powershell
python -m http.server 5173
```

然后打开 `http://localhost:5173`。

首次加载需要联网获取 Three.js 和 GIF 编码器。
