# live2d.user.js

## 功能

给网页添加一个 Live2D 看板娘。

基于 nodejs 的后端 api: [live2dNodeApi](https://github.com/HCLonely/live2dNodeApi)

[点此安装](https://raw.githubusercontent.com/HCLonely/live2d.user.js/master/live2d.user.js)

## 模型预览

[模型预览地址](https://live2d.hclonely.com/preview.html)

## 详细设置

### 设置参数

*Tips： 已自带默认参数，如无特殊要求可跳过*

- 后端接口

  - `modelAPI`：看板娘 API 地址，默认值 `'default'`, 可根据[live2d_api](https://github.com/fghrsh/live2d_api)或[live2dNodeApi](https://github.com/HCLonely/live2dNodeApi)自建api
  - `'staticAPI`：看板娘模型 API 地址，默认值 `''`。如果 modelAPI 为 `'default'`, 则此选项无效
  - `tipsMessage`：提示语读取路径，暂不可改
  - `hitokotoAPI`：一言 API 接口，可选 `'lwl12.com'`，`'hitokoto.cn'`，`'fghrsh.net'`，`'jinrishici.com'` (古诗词)，`'rand'` (随机)

- 默认模型

  - `modelId`：默认模型(分组) ID，可 `[F12]` 呼出 `控制台(Console)` 找到
  - `modelTexturesId`：默认材质(模型) ID，可 `[F12]` 呼出 `控制台(Console)` 找到

- 工具栏设置

  - `showToolMenu`：显示工具栏， `true` | `false`
  - `canCloseLive2d`：关闭看板娘 按钮，`true` | `false`
  - `canSwitchModel`：切换模型 按钮， `true` | `false`
  - `canSwitchTextures`：切换材质 按钮， `true` | `false`
  - `canSwitchHitokoto`：切换一言 按钮， `true` | `false`
  - `canTakeScreenshot`：看板娘截图 按钮，`true` | `false`
  - `canTurnToHomePage`：返回首页 按钮， `true` | `false`
  - `canTurnToAboutPage`：跳转关于页 按钮，`true` | `false`

- 模型切换模式

  - `modelStorage`：记录 ID ，`true` | `false`
  - `modelRandMode`：模型切换，可选 `'rand'` (随机) | `'switch'` (顺序)
  - `modelTexturesRandMode`：材质切换，可选 `'rand'` | `'switch'`

- 提示消息选项

  - `showHitokoto`：空闲时一言，`true` | `false`
  - `showF12Status`：控制台显示加载状态，`true` | `false`
  - `showF12Message`：提示消息输出到控制台，`true` | `false`
  - `showF12OpenMsg`：控制台被打开触发提醒，`true` | `false`
  - `showCopyMessage`：内容被复制触发提醒，`true` | `false`
  - `showWelcomeMessage`：进入面页时显示欢迎语，`true` | `false`

- 看板娘样式设置

  - `waifuSize`：看板娘大小，例如 `'280x250'`，`'600x535'`
  - `waifuTipsSize`：提示框大小，例如 `'250x70'`，`'570x150'`
  - `waifuFontSize`：提示框字体，例如 `'12px'`，`'30px'`
  - `waifuToolFont`：工具栏字体，例如 `'14px'`，`'36px'`
  - `waifuToolLine`：工具栏行高，例如 `'20px'`，`'36px'`
  - `waifuToolTop`：工具栏顶部边距，例如 `'0px'`，`'-60px'`
  - `waifuMinWidth`：面页小于 指定宽度 隐藏看板娘，例如 `'disable'` (停用)，`'768px'`
  - `waifuEdgeSide`：看板娘贴边方向，例如 `'left:0'` (靠左 0px)，`'right:30'` (靠右 30px)
  - `waifuDraggable`：拖拽样式，可选 `'disable'` (禁用)，`'axis-x'` (只能水平拖拽)，`'unlimited'` (自由拖拽)
  - `waifuDraggableRevert`：松开鼠标还原拖拽位置，`true` | `false`
  - `waifuDraggableSave`：是否保存拖拽后的位置，刷新后依然生效，需要将上面的选项和下面的选项都设置为`false`，`true` | `false`
  - `waifuDraggableClear`：清空上次保存的位置，`true` | `false`

- 其他杂项设置

  - `l2dVersion`：当前版本 (无需修改)
  - `l2dVerDate`：更新日期 (无需修改)
  - `homePageUrl`：首页地址，可选 `'auto'` (自动)，`'{URL 网址}'`
  - `aboutPageUrl`：关于页地址，`'{URL 网址}'`
  - `screenshotCaptureName`：看板娘截图文件名，例如 `'live2d.png'`

### 定制提示语

*Tips： `waifu-tips.json` 已自带默认提示语，如无特殊要求可跳过*

- `"waifu"` 系统提示
- `"console_open_msg"` 控制台被打开提醒（支持多句随机）
- `"copy_message"` 内容被复制触发提醒（支持多句随机）
- `"screenshot_message"` 看板娘截图提示语（支持多句随机）
- `"hidden_message"` 看板娘隐藏提示语（支持多句随机）
- `"load_rand_textures"` 随机材质提示语（暂不支持多句）
- `"hour_tips"` 时间段欢迎语（支持多句随机）
- `"referrer_message"` 请求来源欢迎语（不支持多句）
- `"referrer_hostname"` 请求来源自定义名称（根据 host，支持多句随机）
- `"model_message"` 模型切换欢迎语（根据模型 ID，支持多句随机）
- `"hitokoto_api_message"`，一言 API 输出模板（不支持多句随机）
- `"mouseover"` 鼠标触发提示（根据 CSS 选择器，支持多句随机）
- `"click"` 鼠标点击触发提示（根据 CSS 选择器，支持多句随机）
- `"seasons"` 节日提示（日期段，支持多句随机）

### 模式设置

`模式切换`：英文输入法下依次按下"↑↑↓↓←→←→BABA"(引号不用按，注意是方向键不是WASD)后可进入互动模式，互动模式下依次按下"ESC"(引号不用按，注意不是"Esc"键而是"E""S""C"这三个字母键)后可退出互动模式。
`状态切换`：英文输入法下依次按下"hide"后可隐藏看板娘，隐藏状态下依次按下"show"可再次显示看板娘。

*ps:模式切换后会保存（刷新网页后还是刷新前的状态），状态切换后不会保存（刷新网页后恢复默认状态：显示状态）。*

`普通模式`：默认为普通模式，此模式下为了浏览网页体验看板娘不可操作（看板娘显示在最前但鼠标可以操作后面的元素）。
`互动模式`：此模式下看板娘显示在最前并且鼠标优先操作看板娘。

## 版权声明

> 基于[live2d_demo源码](https://github.com/fghrsh/live2d_demo)
>
> 模型来源:[live2d-widget-models](https://github.com/xiazeyu/live2d-widget-models), [梦象](https://mx.paul.ren/page/1/), [Live2d-model](https://github.com/Eikanya/Live2d-model)
>
> [MIT License](https://github.com/HCLonely/live2d.user.js/blob/master/LICENSE)
