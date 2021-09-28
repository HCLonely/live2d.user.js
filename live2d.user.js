// ==UserScript==
// @name         live2D看板娘
// @namespace    live2d.js
// @version      1.2.3
// @description  给你的网页添加看板娘
// @author       HCLonely
// @include      *://*/*
// @require      https://cdn.jsdelivr.net/npm/promise-polyfill@8/dist/polyfill.min.js
// @require      https://cdn.jsdelivr.net/npm/howler@2.1.3/dist/howler.min.js
// @require      https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js
// @require      https://cdn.jsdelivr.net/npm/pixi.js@4.6.1/dist/pixi.min.js
// @require      https://cdn.jsdelivr.net/npm/live2dv3@1.2.2/live2dv3.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/jquery-ui-dist@1.12.1/jquery-ui.min.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert@2.1.2/dist/sweetalert.min.js
// @resource     modelList https://cdn.jsdelivr.net/gh/hclonely/live2d.user.js@1.2.3/models/modelList.json
// @supportURL   https://github.com/HCLonely/live2d.user.js/issues
// @homepage     https://github.com/HCLonely/live2d.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_info
// @grant        GM_getResourceText
// @require      https://cdn.jsdelivr.net/gh/hclonely/live2d.user.js@1.2.3/live2d.core.min.js
// @noframes
// @connect      cdn.jsdelivr.net
// @connect      cubism.live2d.com
// @connect      github.com
// @connect      *
// ==/UserScript==

/* eslint-disable camelcase,no-global-assign */
/* global $,jQuery,swal,GM_setValue,GM_getValue,GM_addStyle,GM_xmlhttpRequest,GM_registerMenuCommand,GM_info,GM_getResourceText */
/* global waifuResize,loadlive2d,showWelcomeMessage,getActed,hitokotoTimer,hitokotoInterval */
(function () {
  'use strict'
  const VERSION = GM_info.script.version
  const modelList = JSON.parse(GM_getResourceText('modelList'))
  if ($('.waifu').length > 0) return 0

  const live2d_conf = {
    modelAPI: 'default', // 可根据https://github.com/HCLonely/live2d_api自建api
    staticAPI: '',
    tipsMessage: 'waifu-tips.json',
    hitokotoAPI: 'rand',
    modelId: 2,
    modelTexturesId: 28,
    showToolMenu: true,
    canCloseLive2d: true,
    canSwitchModel: true,
    canSwitchTextures: true,
    canSwitchHitokoto: true,
    canTakeScreenshot: true,
    canTurnToHomePage: true,
    canTurnToAboutPage: true,
    modelStorage: true,
    modelRandMode: 'switch',
    modelTexturesRandMode: 'rand',
    showHitokoto: true,
    showF12Status: true,
    showF12Message: false,
    showF12OpenMsg: true,
    showCopyMessage: true,
    showWelcomeMessage: true,
    waifuSize: '280x250',
    waifuTipsSize: '250x70',
    waifuFontSize: '12px',
    waifuToolFont: '14px',
    waifuToolLine: '20px',
    waifuToolTop: '0px',
    waifuMinWidth: '768px',
    waifuEdgeSide: 'right:15',
    waifuDraggable: 'disable',
    waifuDraggableRevert: true,
    waifuDraggableSave: false,
    waifuDraggableClear: false,
    homePageUrl: 'auto',
    aboutPageUrl: 'https://blog.hclonely.com/posts/f09c9fef/',
    screenshotCaptureName: 'live2d.png'
  }

  const live2d_settings = GM_getValue('live2d_settings') || { ...live2d_conf }

  if (live2d_settings.staticAPI.includes('hclonely')) {
    live2d_settings.staticAPI = ''
    GM_setValue('live2d_settings', live2d_settings)
  }
  if (live2d_settings.modelAPI === 'http://49.234.125.110:2333/' || live2d_settings.modelAPI === 'http://39.96.35.158:2333/') {
    live2d_settings.modelAPI = 'default'
    GM_setValue('live2d_settings', live2d_settings)
  }

  const setting_des = {
    modelAPI: '自建 API 修改这里，默认为 \'default\'',
    staticAPI: '模型 API 修改这里（不要带最后的"/"）,如果 modelAPI 为\'default\', 则此选项无效',
    tipsMessage: '同目录下可省略路径',
    hitokotoAPI: '一言 API，可选 \'lwl12.com\', \'hitokoto.cn\', \'fghrsh.net\', \'jinrishici.com\'(古诗词), \'rand\'(随机)',
    modelId: '默认模型 ID，可在 F12 控制台找到',
    modelTexturesId: '默认材质 ID，可在 F12 控制台找到',
    showToolMenu: '显示 工具栏 ，可选 true(真), false(假)',
    canCloseLive2d: '显示 关闭看板娘 按钮，可选 true(真), false(假)',
    canSwitchModel: '显示 模型切换 按钮，可选 true(真), false(假)',
    canSwitchTextures: '显示 材质切换 按钮，可选 true(真), false(假)',
    canSwitchHitokoto: '显示 一言切换 按钮，可选 true(真), false(假)',
    canTakeScreenshot: '显示 看板娘截图 按钮，可选 true(真), false(假)',
    canTurnToHomePage: '显示 返回首页 按钮，可选 true(真), false(假)',
    canTurnToAboutPage: '显示 跳转关于页 按钮，可选 true(真), false(假)',
    modelStorage: '记录 ID (刷新后恢复)，可选 true(真), false(假)',
    modelRandMode: '模型切换，可选 \'rand\'(随机), \'switch\'(顺序)',
    modelTexturesRandMode: '材质切换，可选 \'rand\'(随机), \'switch\'(顺序)',
    showHitokoto: '显示一言',
    showF12Status: '显示加载状态',
    showF12Message: '显示看板娘消息',
    showF12OpenMsg: '显示控制台打开提示',
    showCopyMessage: '显示 复制内容 提示',
    showWelcomeMessage: '显示进入面页欢迎词',
    waifuSize: '看板娘大小，例如 \'280x250\', \'600x535\'',
    waifuTipsSize: '提示框大小，例如 \'250x70\', \'570x150\'',
    waifuFontSize: '提示框字体，例如 \'12px\', \'30px\'',
    waifuToolFont: '工具栏字体，例如 \'14px\', \'36px\'',
    waifuToolLine: '工具栏行高，例如 \'20px\', \'36px\'',
    waifuToolTop: '工具栏顶部边距，例如 \'0px\', \'-60px\'',
    waifuMinWidth: '面页小于 指定宽度 隐藏看板娘，例如 \'disable\'(禁用), \'768px\'',
    waifuEdgeSide: '看板娘贴边方向，例如 \'left:0\'(靠左 0px), \'right:30\'(靠右 30px)',
    waifuDraggable: '拖拽样式，例如 \'disable\'(禁用), \'axis-x\'(只能水平拖拽), \'unlimited\'(自由拖拽)',
    waifuDraggableRevert: '松开鼠标还原拖拽位置，可选 true(真), false(假)',
    waifuDraggableSave: '是否保存拖拽后的位置，刷新后依然生效，需要将上面的选项和下面的选项都设置为false，可选 true(真), false(假)',
    waifuDraggableClear: '清空上次保存的位置，可选 true(真), false(假)',
    homePageUrl: '主页地址，可选 \'auto\'(自动), \'{URL 网址}\'',
    aboutPageUrl: '关于页地址, \'{URL 网址}\'',
    screenshotCaptureName: '看板娘截图文件名，例如 \'live2d.png\''
  }

  function userConf() {
    const conf = GM_getValue('live2d_settings') || live2d_conf
    let html = '<form id="l2d-conf"><table class="hclonely"><thead><tr><td>名称</td><td>值</td><td>描述</td></tr></thead><tbody>'
    for (const e of Object.keys(setting_des)) {
      html += `<tr><th>${e}</th><th>${typeof conf[e] === 'boolean' || typeof conf[e] === 'undefined' ? `<input name="${e}" type="checkbox"${conf[e] ? ' checked="checked"' : ''} />` : `<input name="${e}" type="text" value="${conf[e]}" />`}</th><th>${setting_des[e]}</th></tr>`
    }
    html += '</tbody></table></form>'
    swal({
      closeOnClickOutside: false,
      title: 'live2d看板娘设置',
      content: $(html)[0],
      buttons: {
        confirm: '保存',
        cancel: '关闭'
      }
    }).then((value) => {
      if (value) {
        const l2d_conf = {}
        $('#l2d-conf').serializeArray().map((e, i) => {
          l2d_conf[e.name] = e.value === 'on' ? true : e.value
          return e
        })
        GM_setValue('modelId', l2d_conf.modelId)
        GM_setValue('modelTexturesId', l2d_conf.modelTexturesId)
        GM_setValue('live2d_settings', l2d_conf)
        swal('保存成功，刷新页面后生效！', '', 'success')
      }
    })
  }
  GM_registerMenuCommand('设置', userConf)

  const waifuJSON = {
    waifu: {
      console_open_msg: ['哈哈，你打开了控制台，是想要看看我的秘密吗？'],
      copy_message: ['你都复制了些什么呀，转载要记得加上出处哦'],
      screenshot_message: ['照好了嘛，是不是很可爱呢？'],
      hidden_message: ['我们还能再见面的吧…'],
      load_rand_textures: ['我还没有其他衣服呢', '我的新衣服好看嘛'],
      hour_tips: {
        't5-7': ['早上好！一日之计在于晨，美好的一天就要开始了'],
        't7-11': ['上午好！工作顺利嘛，不要久坐，多起来走动走动哦！'],
        't11-14': ['中午了，工作了一个上午，现在是午餐时间！'],
        't14-17': ['午后很容易犯困呢，今天的运动目标完成了吗？'],
        't17-19': ['傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红~'],
        't19-21': ['晚上好，今天过得怎么样？'],
        't21-23': ['已经这么晚了呀，早点休息吧，晚安~'],
        't23-5': ['你是夜猫子呀？这么晚还不睡觉，明天起的来嘛'],
        default: ['嗨~ 快来逗我玩吧！']
      },
      referrer_message: {
        localhost: ['欢迎阅读<span style="color:#0099cc;">『', '』</span>', ' - '],
        baidu: ['Hello! 来自 百度搜索 的朋友<br>你是搜索 <span style="color:#0099cc;">', '</span> 找到的我吗？'],
        so: ['Hello! 来自 360搜索 的朋友<br>你是搜索 <span style="color:#0099cc;">', '</span> 找到的我吗？'],
        google: ['Hello! 来自 谷歌搜索 的朋友<br>欢迎阅读<span style="color:#0099cc;">『', '』</span>', ' - '],
        default: ['Hello! 来自 <span style="color:#0099cc;">', '</span> 的朋友'],
        none: ['欢迎阅读<span style="color:#0099cc;">『', '』</span>', ' - ']
      },
      referrer_hostname: {
        'example.com': ['示例网站'],
        'www.fghrsh.net': ['FGHRSH 的博客']
      },
      model_message: {
        1: ['来自 Potion Maker 的 Pio 酱 ~'],
        2: ['来自 Potion Maker 的 Tia 酱 ~']
      },
      hitokoto_api_message: {
        'lwl12.com': ['这句一言来自 <span style="color:#0099cc;">『{source}』</span>', '，是 <span style="color:#0099cc;">{creator}</span> 投稿的', '。'],
        'fghrsh.net': ['这句一言出处是 <span style="color:#0099cc;">『{source}』</span>，是 <span style="color:#0099cc;">FGHRSH</span> 在 {date} 收藏的！'],
        'jinrishici.com': ['这句诗词出自 <span style="color:#0099cc;">《{title}》</span>，是 {dynasty}诗人 {author} 创作的！'],
        'hitokoto.cn': ['这句一言来自 <span style="color:#0099cc;">『{source}』</span>，是 <span style="color:#0099cc;">{creator}</span> 在 hitokoto.cn 投稿的。']
      }
    },
    mouseover: [
      { selector: "a[href]:not([href^='javascript']):not([href$='#'])", text: ['要看看 <span style="color:#0099cc;">{text}</span> 么？'] },
      { selector: '.fui-home', text: ['点击前往首页，想回到上一页可以使用浏览器的后退功能哦'] },
      { selector: '.fui-chat', text: ['一言一语，一颦一笑。一字一句，一颗赛艇。'] },
      { selector: '.fui-eye', text: ['嗯··· 要切换 看板娘 吗？'] },
      { selector: '.fui-user', text: ['喜欢换装 Play 吗？'] },
      { selector: '.fui-photo', text: ['要拍张纪念照片吗？'] },
      { selector: '.fui-info-circle', text: ['这里有关于我的信息呢'] },
      { selector: '.fui-cross', text: ['你不喜欢我了吗...'] },
      { selector: '#tor_show', text: ['翻页比较麻烦吗，点击可以显示这篇文章的目录呢'] },
      { selector: '#comment_go', text: ['想要去评论些什么吗？'] },
      { selector: '#night_mode', text: ['深夜时要爱护眼睛呀'] },
      { selector: '#qrcode', text: ['手机扫一下就能继续看，很方便呢'] },
      { selector: '.comment_reply', text: ['要吐槽些什么呢'] },
      { selector: '#back-to-top', text: ['回到开始的地方吧'] },
      { selector: '#author', text: ['该怎么称呼你呢'] },
      { selector: '#mail', text: ['留下你的邮箱，不然就是无头像人士了'] },
      { selector: '#url', text: ['你的家在哪里呢，好让我去参观参观'] },
      { selector: '#textarea', text: ['认真填写哦，垃圾评论是禁止事项'] },
      { selector: '.OwO-logo', text: ['要插入一个表情吗'] },
      { selector: '#csubmit', text: ['要[提交]^(Commit)了吗，首次评论需要审核，请耐心等待~'] },
      { selector: 'video', text: ['这是一个视频哦'] },
      { selector: 'input[name=s]', text: ['找不到想看的内容？搜索看看吧'] },
      { selector: '.previous', text: ['去上一页看看吧'] },
      { selector: '.next', text: ['去下一页看看吧'] },
      { selector: '.dropdown-toggle', text: ['这里是菜单'] },
      { selector: 'c-player a.play-icon', text: ['想要听点音乐吗'] },
      { selector: 'c-player div.time', text: ['在这里可以调整<span style="color:#0099cc;">播放进度</span>呢'] },
      { selector: 'c-player div.volume', text: ['在这里可以调整<span style="color:#0099cc;">音量</span>呢'] },
      { selector: 'c-player div.list-button', text: ['<span style="color:#0099cc;">播放列表</span>里都有什么呢'] },
      { selector: 'c-player div.lyric-button', text: ['有<span style="color:#0099cc;">歌词</span>的话就能跟着一起唱呢'] },
      { selector: '.waifu #live2d', text: ['干嘛呢你，快把手拿开', '鼠…鼠标放错地方了！'] }
    ],
    click: [
      {
        selector: '.waifu #live2d',
        text: [
          '是…是不小心碰到了吧',
          '萝莉控是什么呀',
          '你看到我的小熊了吗',
          '再摸的话我可要报警了！⌇●﹏●⌇',
          '110吗，这里有个变态一直在摸我(ó﹏ò｡)'
        ]
      }
    ],
    seasons: [
      { date: '01/01', text: ['<span style="color:#0099cc;">元旦</span>了呢，新的一年又开始了，今年是{year}年~'] },
      { date: '02/14', text: ['又是一年<span style="color:#0099cc;">情人节</span>，{year}年找到对象了嘛~'] },
      { date: '03/08', text: ['今天是<span style="color:#0099cc;">妇女节</span>！'] },
      { date: '03/12', text: ['今天是<span style="color:#0099cc;">植树节</span>，要保护环境呀'] },
      { date: '04/01', text: ['悄悄告诉你一个秘密~<span style="background-color:#34495e;">今天是愚人节，不要被骗了哦~</span>'] },
      { date: '05/01', text: ['今天是<span style="color:#0099cc;">五一劳动节</span>，计划好假期去哪里了吗~'] },
      { date: '06/01', text: ['<span style="color:#0099cc;">儿童节</span>了呢，快活的时光总是短暂，要是永远长不大该多好啊…'] },
      { date: '09/03', text: ['<span style="color:#0099cc;">中国人民抗日战争胜利纪念日</span>，铭记历史、缅怀先烈、珍爱和平、开创未来。'] },
      { date: '09/10', text: ['<span style="color:#0099cc;">教师节</span>，在学校要给老师问声好呀~'] },
      { date: '10/01', text: ['<span style="color:#0099cc;">国庆节</span>，新中国已经成立69年了呢'] },
      { date: '11/05-11/12', text: ['今年的<span style="color:#0099cc;">双十一</span>是和谁一起过的呢~'] },
      { date: '12/20-12/31', text: ['这几天是<span style="color:#0099cc;">圣诞节</span>，主人肯定又去剁手买买买了~'] }
    ]
  }

  /****************************************************************************************************/

  String.prototype.render = function (context) { // eslint-disable-line no-extend-native
    const tokenReg = /(\\)?\{([^{}\\]+)(\\)?\}/g

    return this.replace(tokenReg, function (word, slash1, token, slash2) {
      if (slash1 || slash2) { return word.replace('\\', '') }

      const variables = token.replace(/\s/g, '').split('.')
      let currentObject = context
      let i, length, variable

      for (i = 0, length = variables.length; i < length; ++i) {
        variable = variables[i]
        currentObject = currentObject[variable]
        if (currentObject === undefined || currentObject === null) return ''
      }
      return currentObject
    })
  }

  const re = /x/
  console.log(re)
  const x = document.createElement('div')
  console.debug(x)

  function empty(obj) { return !!(typeof obj === 'undefined' || obj == null || obj === '') }
  function getRandText(text) { return Array.isArray(text) ? text[Math.floor(Math.random() * text.length + 1) - 1] : text }

  function showMessage(text, timeout, flag) {
    if (flag || GM_getValue('waifu-text') === '' || GM_getValue('waifu-text') === null) {
      if (Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1) - 1]
      if (live2d_settings.showF12Message) console.log('[Message]', text.replace(/<[^<>]+>/g, ''))

      if (flag) GM_setValue('waifu-text', text)

      $('.waifu-tips').stop()
      $('.waifu-tips').html(text).fadeTo(200, 1)
      if (timeout === undefined) timeout = 5000
      hideMessage(timeout)
    }
  }

  function hideMessage(timeout) {
    $('.waifu-tips').stop().css('opacity', 1)
    if (timeout === undefined) timeout = 5000
    window.setTimeout(function () { GM_setValue('waifu-text', '') }, timeout)
    $('.waifu-tips').delay(timeout).fadeTo(200, 0)
  }

  function dateFormat(fmt, date) {
    let ret
    const opt = {
      'Y+': date.getFullYear().toString(), // 年
      'm+': (date.getMonth() + 1).toString(), // 月
      'd+': date.getDate().toString(), // 日
      'H+': date.getHours().toString(), // 时
      'M+': date.getMinutes().toString(), // 分
      'S+': date.getSeconds().toString() // 秒
      // 有其他格式化字符需求可以继续添加，必须转化成字符串
    }
    for (const k in opt) {
      ret = new RegExp('(' + k + ')').exec(fmt)
      if (ret) {
        fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
      };
    };
    return fmt
  }
  function initModel(waifuPath, type) {
    /* console welcome message */
    console.log('%c ' + { msg: "\n\nく__,.ヘヽ.　　　　/　,ー､ 〉\n　　　　　＼ ', !-─‐-i　/　/´\n　　　 　 ／｀ｰ'　　　 L/／｀ヽ､\n　　 　 /　 ／,　 /|　 ,　 ,　　　 ',\n　　　ｲ 　/ /-‐/　ｉ　L_ ﾊ ヽ!　 i\n　　　 ﾚ ﾍ 7ｲ｀ﾄ ﾚ'ｧ-ﾄ､!ハ|　 |\n　　　　 !,/7 '0'　　 ´0iソ| 　 |\n　　　　 |.从\"　　_　　 ,,,, / |./ 　 |\n　　　　 ﾚ'| i＞.､,,__　_,.イ / 　.i 　|\n　　　　　 ﾚ'| | / k_７_/ﾚ'ヽ,　ﾊ.　|\n　　　　　　 | |/i 〈|/　 i,.ﾍ |　i|\n　　　　　　.|/ /　ｉ： 　 ﾍ!　　＼|\n　　　 　 　 kヽ>､ﾊ 　 _,.ﾍ､ 　 /､!\n　　　　　　 !'〈//｀Ｔ´', ＼ ｀'7'ｰr'\n　　　　　　 ﾚ'ヽL__|___i,___,ンﾚ|ノ\n　　　　　 　　　ﾄ-,/　|___./\n　　　　　 　　　'ｰ'　　!_,.:\nLive2D 看板娘 v" + GM_info.script.version + ' / HCLonely ' + dateFormat('YYYY-mm-dd', new Date(GM_info.script.lastModified || GM_info.script.lastUpdated)) + '\n' }.msg, 'color:#ff3d3d')

    /* 判断 JQuery */
    if (typeof ($.ajax) !== 'function') typeof (jQuery.ajax) === 'function' ? window.$ = jQuery : console.log('[Error] JQuery is not defined.')

    /* 加载看板娘样式 */
    live2d_settings.waifuSize = live2d_settings.waifuSize.split('x')
    live2d_settings.waifuTipsSize = live2d_settings.waifuTipsSize.split('x')
    live2d_settings.waifuEdgeSide = live2d_settings.waifuEdgeSide.split(':')

    $('#live2d').attr('width', live2d_settings.waifuSize[0])
    $('#live2d').attr('height', live2d_settings.waifuSize[1])
    $('.waifu').css('width', live2d_settings.waifuSize[0])
    $('.waifu').css('height', live2d_settings.waifuSize[1])
    $('.waifu-tips').width(live2d_settings.waifuTipsSize[0])
    $('.waifu-tips').height(live2d_settings.waifuTipsSize[1])
    $('.waifu-tips').css('top', live2d_settings.waifuToolTop)
    $('.waifu-tips').css('font-size', live2d_settings.waifuFontSize)
    $('.waifu-tool').css('font-size', live2d_settings.waifuToolFont)
    $('.waifu-tool span').css('line-height', live2d_settings.waifuToolLine)

    if (live2d_settings.waifuEdgeSide[0] === 'left') $('.waifu').css('left', live2d_settings.waifuEdgeSide[1] + 'px')
    else if (live2d_settings.waifuEdgeSide[0] === 'right') $('.waifu').css('right', live2d_settings.waifuEdgeSide[1] + 'px')

    if (live2d_settings.waifuDraggableClear) GM_setValue('waifuPosition', false)

    if (live2d_settings.waifuDraggableSave && GM_getValue('waifuPosition')) {
      const position = GM_getValue('waifuPosition')
      Object.keys(position).forEach(function (key) {
        $('.waifu').css(key, position[key] + 'px')
      })
    }

    window.waifuResize = function () { $(window).width() <= Number(live2d_settings.waifuMinWidth.replace('px', '')) ? $('.waifu').hide() : $('.waifu').show() }
    if (live2d_settings.waifuMinWidth !== 'disable') { waifuResize(); $(window).resize(function () { waifuResize() }) }

    try {
      if (live2d_settings.waifuDraggable === 'axis-x') $('.waifu').draggable({ axis: 'x', revert: live2d_settings.waifuDraggableRevert, stop: function (event, ui) { if (!live2d_settings.waifuDraggableRevert && live2d_settings.waifuDraggableSave) GM_setValue('waifuPosition', ui.position) } })
      else if (live2d_settings.waifuDraggable === 'unlimited') $('.waifu').draggable({ revert: live2d_settings.waifuDraggableRevert, stop: function (event, ui) { if (!live2d_settings.waifuDraggableRevert && live2d_settings.waifuDraggableSave) { GM_setValue('waifuPosition', ui.position) } } })
      else $('.waifu').css('transition', 'all .3s ease-in-out')
    } catch (err) { console.log('[Error] JQuery UI is not defined.') }

    live2d_settings.homePageUrl = live2d_settings.homePageUrl === 'auto' ? window.location.protocol + '//' + window.location.hostname + '/' : live2d_settings.homePageUrl
    if (window.location.protocol === 'file:' && live2d_settings.modelAPI.substr(0, 2) === '//') live2d_settings.modelAPI = 'http:' + live2d_settings.modelAPI

    $('.waifu-tool .fui-home').click(function () {
      window.location = window.location.origin
    })

    $('.waifu-tool .fui-info-circle').click(function () {
      window.open(live2d_settings.aboutPageUrl)
    })

    if (typeof (waifuPath) === 'object') loadTipsMessage(waifuPath); else {
      GM_xmlhttpRequest({
        method: 'GET',
        url: waifuPath === '' ? live2d_settings.tipsMessage : (waifuPath.substr(waifuPath.length - 15) === 'waifu-tips.json' ? waifuPath : waifuPath + 'waifu-tips.json'),
        responseType: 'json',
        anonymous: true,
        onload: function (result) { loadTipsMessage(result.response) }
      })
    }

    if (!live2d_settings.showToolMenu) $('.waifu-tool').hide()
    if (!live2d_settings.canCloseLive2d) $('.waifu-tool .fui-cross').hide()
    if (!live2d_settings.canSwitchModel) $('.waifu-tool .fui-eye').hide()
    if (!live2d_settings.canSwitchTextures) $('.waifu-tool .fui-user').hide()
    if (!live2d_settings.canSwitchHitokoto) $('.waifu-tool .fui-chat').hide()
    if (!live2d_settings.canTakeScreenshot) $('.waifu-tool .fui-photo').hide()
    if (!live2d_settings.canTurnToHomePage) $('.waifu-tool .fui-home').hide()
    if (!live2d_settings.canTurnToAboutPage) $('.waifu-tool .fui-info-circle').hide()

    if (waifuPath === undefined) waifuPath = ''
    let modelId = GM_getValue('modelId') || live2d_settings.modelId
    let modelTexturesId = GM_getValue('modelTexturesId') || live2d_settings.modelId

    if (!live2d_settings.modelStorage || modelId == null) {
      modelId = live2d_settings.modelId
      modelTexturesId = live2d_settings.modelTexturesId
    }
    loadModel(modelId, modelTexturesId)
  }

  function loadModel(modelId, modelTexturesId = 0) {
    if (live2d_settings.modelStorage) {
      GM_setValue('modelId', modelId)
      GM_setValue('modelTexturesId', modelTexturesId)
      const setting = GM_getValue('live2d_settings') || live2d_settings
      setting.modelId = modelId
      setting.modelTexturesId = modelTexturesId
      GM_setValue('live2d_settings', setting)
    } else {
      GM_setValue('modelId', null)
      GM_setValue('modelTexturesId', null)
    }
    loadlive2d('live2d', live2d_settings.modelAPI + 'get/?id=' + modelId + '-' + modelTexturesId, (live2d_settings.showF12Status ? console.log('[Status]', 'live2d', '模型', modelId + '-' + modelTexturesId, '加载完成') : null))
    /*
    new l2dViewer({
      el: document.getElementById('live2dv3'),
      basePath: 'https://cdn.jsdelivr.net/npm/live2dv3@latest/assets',
      width: live2d_settings.waifuSize[0],
      heoght: live2d_settings.waifuSize[1],
      modelName: 'biaoqiang_3',
      sounds: [
          'https://cdn.jsdelivr.net/npm/live2dv3@latest/assets/biaoqiang_3/sounds/demo.mp3' // 也可以是网址
      ]
    })
    */
  }

  function loadTipsMessage(result) {
    window.waifu_tips = result

    $.each(result.mouseover, function (index, tips) {
      $(document).on('mouseover', tips.selector, function () {
        if (!($(this)[0].tagName === 'A' && ($(this).text().trim() === ''))) {
          let text = getRandText(tips.text)
          text = text.render({ text: $(this).text() })
          showMessage(text, 3000, true)
        }
      })
    })
    $.each(result.click, function (index, tips) {
      $(document).on('click', tips.selector, function () {
        let text = getRandText(tips.text)
        text = text.render({ text: $(this).text() })
        showMessage(text, 3000, true)
      })
    })
    $.each(result.seasons, function (index, tips) {
      const now = new Date()
      const after = tips.date.split('-')[0]
      const before = tips.date.split('-')[1] || after

      if ((after.split('/')[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split('/')[0]) &&
        (after.split('/')[1] <= now.getDate() && now.getDate() <= before.split('/')[1])) {
        let text = getRandText(tips.text)
        text = text.render({ year: now.getFullYear() })
        showMessage(text, 6000, true)
      }
    })

    if (live2d_settings.showF12OpenMsg) {
      Object.defineProperty(x, 'id', {
        get: function () {
          showMessage(getRandText(result.waifu.console_open_msg), 5000, true)
        }
      })
      re.toString = function () {
        showMessage(getRandText(result.waifu.console_open_msg), 5000, true)
        return ''
      }
    }

    if (live2d_settings.showCopyMessage) {
      $(document).on('copy', function () {
        showMessage(getRandText(result.waifu.copy_message), 5000, true)
      })
    }

    $('.waifu-tool .fui-photo').click(function () {
      showMessage(getRandText(result.waifu.screenshot_message), 5000, true)
      window.Live2D.captureName = live2d_settings.screenshotCaptureName
      window.Live2D.captureFrame = true
    })

    $('.waifu-tool .fui-cross').click(function () {
      GM_setValue('waifu-dsiplay', 'none')
      showMessage(getRandText(result.waifu.hidden_message), 1300, true)
      window.setTimeout(function () { $('.waifu').hide() }, 1300)
    })

    window.showWelcomeMessage = function (result) {
      let text
      if (window.location.href === live2d_settings.homePageUrl) {
        const now = (new Date()).getHours()
        if (now > 23 || now <= 5) text = getRandText(result.waifu.hour_tips['t23-5'])
        else if (now > 5 && now <= 7) text = getRandText(result.waifu.hour_tips['t5-7'])
        else if (now > 7 && now <= 11) text = getRandText(result.waifu.hour_tips['t7-11'])
        else if (now > 11 && now <= 14) text = getRandText(result.waifu.hour_tips['t11-14'])
        else if (now > 14 && now <= 17) text = getRandText(result.waifu.hour_tips['t14-17'])
        else if (now > 17 && now <= 19) text = getRandText(result.waifu.hour_tips['t17-19'])
        else if (now > 19 && now <= 21) text = getRandText(result.waifu.hour_tips['t19-21'])
        else if (now > 21 && now <= 23) text = getRandText(result.waifu.hour_tips['t21-23'])
        else text = getRandText(result.waifu.hour_tips.default)
      } else {
        const referrer_message = result.waifu.referrer_message
        if (document.referrer !== '') {
          const referrer = document.createElement('a')
          referrer.href = document.referrer
          const domain = referrer.hostname.split('.')[1]
          if (window.location.hostname === referrer.hostname) { text = referrer_message.localhost[0] + document.title.split(referrer_message.localhost[2])[0] + referrer_message.localhost[1] } else if (domain === 'baidu') { text = referrer_message.baidu[0] + referrer.search.split('&wd=')[1].split('&')[0] + referrer_message.baidu[1] } else if (domain === 'so') { text = referrer_message.so[0] + referrer.search.split('&q=')[1].split('&')[0] + referrer_message.so[1] } else if (domain === 'google') { text = referrer_message.google[0] + document.title.split(referrer_message.google[2])[0] + referrer_message.google[1] } else {
            $.each(result.waifu.referrer_hostname, function (i, val) { if (i === referrer.hostname) referrer.hostname = getRandText(val) })
            text = referrer_message.default[0] + referrer.hostname + referrer_message.default[1]
          }
        } else text = referrer_message.none[0] + document.title.split(referrer_message.none[2])[0] + referrer_message.none[1]
      }
      showMessage(text, 6000, true)
    }; if (live2d_settings.showWelcomeMessage) showWelcomeMessage(result)

    const waifu_tips = result.waifu

    function randId(id, length) {
      const newId = parseInt(Math.random() * length + 1, 10)
      return newId === id ? randId(id, length) : newId
    }
    function loadOtherModel() {
      const modelId = parseInt(modelStorageGetItem('modelId'))
      const modelRandMode = live2d_settings.modelRandMode

      if (live2d_settings.modelAPI === 'default') {
        if (modelRandMode === 'switch') {
          const newId = modelId >= modelList.length ? 1 : (modelId + 1)
          loadModel(newId)
          let message = ''
          $.each(waifu_tips.model_message, function (i, val) { if (i === newId) message = getRandText(val) })
          showMessage(message, 3000, true)
        } else {
          const newId = randId(modelId, modelList.length)
          loadModel(newId)
          let message = ''
          $.each(waifu_tips.model_message, function (i, val) { if (i === newId) message = getRandText(val) })
          showMessage(message, 3000, true)
        }
      } else {
        GM_xmlhttpRequest({
          method: 'GET',
          url: live2d_settings.modelAPI + modelRandMode + '/?id=' + modelId,
          responseType: 'json',
          anonymous: true,
          onload: function (data) {
            const result = data.response
            loadModel(result.model.id)
            let message = result.model.message
            $.each(waifu_tips.model_message, function (i, val) { if (i === result.model.id) message = getRandText(val) })
            showMessage(message, 3000, true)
          }
        })
      }
    }

    function loadRandTextures() {
      const modelId = parseInt(modelStorageGetItem('modelId'))
      const modelTexturesId = parseInt(modelStorageGetItem('modelTexturesId'))
      const modelTexturesRandMode = live2d_settings.modelTexturesRandMode
      if (live2d_settings.modelAPI === 'default') {
        const modelInfo = modelList[parseInt(modelId) - 1]
        if (Array.isArray(modelInfo)) {
          if (modelTexturesRandMode === 'switch') {
            const newId = modelTexturesId >= modelInfo.length ? 1 : (modelTexturesId + 1)
            showMessage(waifu_tips.load_rand_textures[1], 3000, true)
            loadModel(modelId, newId)
          } else {
            const newId = randId(modelTexturesId, modelInfo.length)
            showMessage(waifu_tips.load_rand_textures[1], 3000, true)
            loadModel(modelId, newId)
          }
        } else {
          showMessage(waifu_tips.load_rand_textures[0], 3000, true)
          loadModel(modelId, 1)
        }
      } else {
        GM_xmlhttpRequest({
          method: 'GET',
          url: live2d_settings.modelAPI + modelTexturesRandMode + '_textures/?id=' + modelId + '-' + modelTexturesId,
          responseType: 'json',
          anonymous: true,
          onload: function (data) {
            const result = data.response
            if (result.textures.id === 1 && (modelTexturesId === 1 || modelTexturesId === 0)) {
              showMessage(waifu_tips.load_rand_textures[0], 3000, true)
            } else {
              showMessage(waifu_tips.load_rand_textures[1], 3000, true)
            }
            loadModel(modelId, result.textures.id)
          }
        })
      }
    }

    function modelStorageGetItem(key) { return live2d_settings.modelStorage ? GM_getValue(key) : GM_getValue(key) }

    /* 检测用户活动状态，并在空闲时显示一言 */
    if (live2d_settings.showHitokoto) {
      window.getActed = true; window.hitokotoTimer = 30000; window.hitokotoInterval = true
      $(document).mousemove(function (e) { getActed = true }).keydown(function () { getActed = true })
      setInterval(function () { if (!getActed) ifActed(); else elseActed() }, 1000)
    }

    function ifActed() {
      if (!hitokotoInterval) {
        hitokotoInterval = true
        hitokotoTimer = window.setInterval(showHitokotoActed, 30000)
      }
    }

    function elseActed() {
      getActed = hitokotoInterval = false
      window.clearInterval(hitokotoTimer)
    }

    function showHitokotoActed() {
      if ($(document)[0].visibilityState === 'visible') showHitokoto()
    }

    function showHitokoto(e = false) {
      const api = e || live2d_settings.hitokotoAPI
      switch (api) {
        case 'lwl12.com':
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.lwl12.com/hitokoto/v1?encode=realjson',
            responseType: 'json',
            anonymous: true,
            onload: function (data) {
              const result = data.response
              if (!empty(result.source)) {
                let text = waifu_tips.hitokoto_api_message['lwl12.com'][0]
                if (!empty(result.author)) text += waifu_tips.hitokoto_api_message['lwl12.com'][1]
                text = text.render({ source: result.source, creator: result.author })
                window.setTimeout(function () { showMessage(text + waifu_tips.hitokoto_api_message['lwl12.com'][2], 3000, true) }, 5000)
              }
              showMessage(result.text, 5000, true)
            }
          })
          break
        case 'fghrsh.net':
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://api.fghrsh.net/hitokoto/rand/?encode=jsc&uid=3335',
            anonymous: true,
            responseType: 'json',
            onload: function (data) {
              const result = data.response
              if (!empty(result.source)) {
                let text = waifu_tips.hitokoto_api_message['fghrsh.net'][0]
                text = text.render({ source: result.source, date: result.date })
                window.setTimeout(function () { showMessage(text, 3000, true) }, 5000)
                showMessage(result.hitokoto, 5000, true)
              }
            }
          })
          break
        case 'jinrishici.com':
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://v2.jinrishici.com/one.json',
            responseType: 'json',
            anonymous: true,
            onload: function (data) {
              const result = data.response
              if (!empty(result.data.origin.title)) {
                let text = waifu_tips.hitokoto_api_message['jinrishici.com'][0]
                text = text.render({ title: result.data.origin.title, dynasty: result.data.origin.dynasty, author: result.data.origin.author })
                window.setTimeout(function () { showMessage(text, 3000, true) }, 5000)
              }
              showMessage(result.data.content, 5000, true)
            }
          })
          break
        case 'hitokoto.cn':
          GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://v1.hitokoto.cn',
            responseType: 'json',
            anonymous: true,
            onload: function (data) {
              const result = data.response
              if (!empty(result.from)) {
                let text = waifu_tips.hitokoto_api_message['hitokoto.cn'][0]
                text = text.render({ source: result.from, creator: result.creator })
                window.setTimeout(function () { showMessage(text, 3000, true) }, 5000)
              }
              showMessage(result.hitokoto, 5000, true)
            }
          })
          break
        default:
          showHitokoto(['lwl12.com', 'fghrsh.net', 'jinrishici.com', 'hitokoto.cn'][Math.floor((Math.random() * 4))])
      }
    }

    let hidden, visibilityChange
    if (typeof document.hidden !== 'undefined') {
      hidden = 'hidden'
      visibilityChange = 'visibilitychange'
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden'
      visibilityChange = 'msvisibilitychange'
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden'
      visibilityChange = 'webkitvisibilitychange'
    }
    function handleVisibilityChange() {
      if (!document[hidden]) showMessage('主人，欢迎回来！', 4000, true)
    }
    if (!(typeof document.addEventListener === 'undefined' || typeof document[hidden] === 'undefined')) {
      document.addEventListener(visibilityChange, handleVisibilityChange, false)
    }

    let videoStatus = false
    $('video').on('timeupdate', function (e) {
      if (this.paused) {
        showMessage('你怎么暂停了呀', 4000, true)
      } else if (videoStatus === false) {
        showMessage('你在看什么啊，让我康康', 4000, true)
      }
      videoStatus = !this.paused
      if (Math.abs(this.currentTime - this.duration / 2) < 1) {
        showMessage('进度条已过半，且看且珍惜', 4000, true)
      }
    })

    let audioStatus = false
    $('audio').on('timeupdate', function (e) {
      if (this.paused) {
        showMessage('怎么不听了呀', 4000, true)
      } else if (audioStatus === false) {
        showMessage('你在听什么呀，这么好听', 4000, true)
      }
      audioStatus = !this.paused
    })

    $('.waifu-tool .fui-eye').click(function () { loadOtherModel() })
    $('.waifu-tool .fui-user').click(function () { loadRandTextures() })
    $('.waifu-tool .fui-chat').click(function () { showHitokoto() })
  }

  $('body').append('<div class="waifu" style="z-index:9999999999;pointer-events: none;"><div class="waifu-tips"></div><canvas id="live2d" class="live2d" style="display:none"></canvas><div id="live2dv3" class="live2d"></div><div class="waifu-tool"><span class="fui-home"></span> <span class="fui-chat"></span> <span class="fui-eye"></span> <span class="fui-user"></span> <span class="fui-photo"></span> <span class="fui-info-circle"></span> <span class="fui-cross"></span></div></div>')

  const code = '38|38|40|40|37|39|37|39|66|65|66|65'
  const unCode = '69|83|67'
  const hideCode = '72|73|68|69'
  const showCode = '83|72|79|87'
  let time = new Date().getTime()
  let keyArr = []
  $(document).keydown(function (e) {
    if (e.altKey && e.keyCode === 72) {
      showMessage('我还会再回来的~~', 3000, true)
      setTimeout(() => { $('div.waifu').hide() }, 3000)
    } else if (e.altKey && e.keyCode === 83) {
      $('div.waifu').show()
      showMessage('他大姨妈~~', 3000, true)
    } else {
      if (new Date().getTime() - time > 2000) {
        keyArr = []
        keyArr.push(e.keyCode)
      } else {
        keyArr.push(e.keyCode)
        if (keyArr.length === 12) {
          if (keyArr.join('|') === code) {
            $('div.waifu').css('pointer-events', 'all')
            GM_setValue('mode', 'interactive')
            showMessage('主人，你终于来陪我玩了', 3000, true)
          }
          keyArr = []
        }
        if (keyArr.length === 3) {
          if (keyArr.join('|') === unCode) {
            $('div.waifu').css('pointer-events', 'none')
            GM_setValue('mode', 'normal')
            keyArr = []
            showMessage('哼！不跟你玩了', 3000, true)
          }
        }
        if (keyArr.length === 4) {
          if (keyArr.join('|') === hideCode) {
            showMessage('我还会再回来的~~', 3000, true)
            setTimeout(() => { $('div.waifu').hide() }, 3000)
            keyArr = []
          } else if (keyArr.join('|') === showCode) {
            $('div.waifu').show()
            showMessage('他大姨妈~~', 3000, true)
            keyArr = []
          }
        }
      }
      time = new Date().getTime()
    }
  })

  initModel(waifuJSON)

  switch (GM_getValue('mode')) {
    case 'interactive':
      $('div.waifu').css('pointer-events', 'all')
      break
    default:
      $('div.waifu').css('pointer-events', 'none')
      break
  }

  GM_addStyle(`
.waifu {
    position: fixed !important;
    bottom: 0;
    z-index: 1;
    font-size: 0;
    -webkit-transform: translateY(3px);
    transform: translateY(3px);
}

.waifu:hover {
    -webkit-transform: translateY(0);
    transform: translateY(0);
}

.waifu-tips {
    opacity: 0;
    margin: -20px 20px;
    padding: 5px 10px;
    border: 1px solid rgba(224, 186, 140, 0.62);
    border-radius: 12px;
    background-color: rgba(236, 217, 188, 0.5);
    box-shadow: 0 3px 15px 2px rgba(191, 158, 118, 0.2);
    font-size: 12px;
    text-overflow: ellipsis;
    overflow: hidden;
    position: absolute;
    animation-delay: 5s;
    animation-duration: 50s;
    animation-iteration-count: infinite;
    animation-name: shake;
    animation-timing-function: ease-in-out;
}

.waifu-tool {
    display: none;
    color: #aaa;
    top: 50px;
    right: 10px;
    position: absolute;
}

.waifu:hover .waifu-tool {
    display: block;
}

.waifu-tool span {
    display: block;
    cursor: pointer;
    color: rgb(57, 57, 57);
    background-color: rgba(236, 217, 188, 0.5);
    border: 1px solid rgba(224, 186, 140, 0.62);
    padding: 0 4px;
    line-height: 20px;
    transition: 0.2s;
    animation-duration: 30s;
    animation-iteration-count: infinite;
    animation-name: shake;
    animation-timing-function: ease-in-out;
}

.waifu-tool span:hover {
    z-index: 1;
    transform: scale(1.5);
    animation: none;
}

.waifu #live2d {
    position: relative;
    cursor: grab;
}

@keyframes shake {
    2% {
        transform: translate(0.5px, -1.5px) rotate(-0.5deg);
    }

    4% {
        transform: translate(0.5px, 1.5px) rotate(1.5deg);
    }

    6% {
        transform: translate(1.5px, 1.5px) rotate(1.5deg);
    }

    8% {
        transform: translate(2.5px, 1.5px) rotate(0.5deg);
    }

    10% {
        transform: translate(0.5px, 2.5px) rotate(0.5deg);
    }

    12% {
        transform: translate(1.5px, 1.5px) rotate(0.5deg);
    }

    14% {
        transform: translate(0.5px, 0.5px) rotate(0.5deg);
    }

    16% {
        transform: translate(-1.5px, -0.5px) rotate(1.5deg);
    }

    18% {
        transform: translate(0.5px, 0.5px) rotate(1.5deg);
    }

    20% {
        transform: translate(2.5px, 2.5px) rotate(1.5deg);
    }

    22% {
        transform: translate(0.5px, -1.5px) rotate(1.5deg);
    }

    24% {
        transform: translate(-1.5px, 1.5px) rotate(-0.5deg);
    }

    26% {
        transform: translate(1.5px, 0.5px) rotate(1.5deg);
    }

    28% {
        transform: translate(-0.5px, -0.5px) rotate(-0.5deg);
    }

    30% {
        transform: translate(1.5px, -0.5px) rotate(-0.5deg);
    }

    32% {
        transform: translate(2.5px, -1.5px) rotate(1.5deg);
    }

    34% {
        transform: translate(2.5px, 2.5px) rotate(-0.5deg);
    }

    36% {
        transform: translate(0.5px, -1.5px) rotate(0.5deg);
    }

    38% {
        transform: translate(2.5px, -0.5px) rotate(-0.5deg);
    }

    40% {
        transform: translate(-0.5px, 2.5px) rotate(0.5deg);
    }

    42% {
        transform: translate(-1.5px, 2.5px) rotate(0.5deg);
    }

    44% {
        transform: translate(-1.5px, 1.5px) rotate(0.5deg);
    }

    46% {
        transform: translate(1.5px, -0.5px) rotate(-0.5deg);
    }

    48% {
        transform: translate(2.5px, -0.5px) rotate(0.5deg);
    }

    50% {
        transform: translate(-1.5px, 1.5px) rotate(0.5deg);
    }

    52% {
        transform: translate(-0.5px, 1.5px) rotate(0.5deg);
    }

    54% {
        transform: translate(-1.5px, 1.5px) rotate(0.5deg);
    }

    56% {
        transform: translate(0.5px, 2.5px) rotate(1.5deg);
    }

    58% {
        transform: translate(2.5px, 2.5px) rotate(0.5deg);
    }

    60% {
        transform: translate(2.5px, -1.5px) rotate(1.5deg);
    }

    62% {
        transform: translate(-1.5px, 0.5px) rotate(1.5deg);
    }

    64% {
        transform: translate(-1.5px, 1.5px) rotate(1.5deg);
    }

    66% {
        transform: translate(0.5px, 2.5px) rotate(1.5deg);
    }

    68% {
        transform: translate(2.5px, -1.5px) rotate(1.5deg);
    }

    70% {
        transform: translate(2.5px, 2.5px) rotate(0.5deg);
    }

    72% {
        transform: translate(-0.5px, -1.5px) rotate(1.5deg);
    }

    74% {
        transform: translate(-1.5px, 2.5px) rotate(1.5deg);
    }

    76% {
        transform: translate(-1.5px, 2.5px) rotate(1.5deg);
    }

    78% {
        transform: translate(-1.5px, 2.5px) rotate(0.5deg);
    }

    80% {
        transform: translate(-1.5px, 0.5px) rotate(-0.5deg);
    }

    82% {
        transform: translate(-1.5px, 0.5px) rotate(-0.5deg);
    }

    84% {
        transform: translate(-0.5px, 0.5px) rotate(1.5deg);
    }

    86% {
        transform: translate(2.5px, 1.5px) rotate(0.5deg);
    }

    88% {
        transform: translate(-1.5px, 0.5px) rotate(1.5deg);
    }

    90% {
        transform: translate(-1.5px, -0.5px) rotate(-0.5deg);
    }

    92% {
        transform: translate(-1.5px, -1.5px) rotate(1.5deg);
    }

    94% {
        transform: translate(0.5px, 0.5px) rotate(-0.5deg);
    }

    96% {
        transform: translate(2.5px, -0.5px) rotate(-0.5deg);
    }

    98% {
        transform: translate(-1.5px, -1.5px) rotate(-0.5deg);
    }

    0%, 100% {
        transform: translate(0, 0) rotate(0);
    }
}

@font-face {
    font-family: 'Flat-UI-Icons';
  src: url('https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@master/source/flat-ui-icons-regular.eot');
  src: url('https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@master/source/flat-ui-icons-regular.eot?#iefix') format('embedded-opentype'), url('https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@master/source/flat-ui-icons-regular.woff') format('woff'), url('https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@master/source/flat-ui-icons-regular.ttf') format('truetype'), url('flat-ui-icons-regular.svg#flat-ui-icons-regular') format('svg');
}

[class^="fui-"],
[class*="fui-"] {
    font-family: 'Flat-UI-Icons';
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.fui-cross:before {
    content: "\\e609";
}

.fui-info-circle:before {
    content: "\\e60f";
}

.fui-photo:before {
    content: "\\e62a";
}

.fui-eye:before {
    content: "\\e62c";
}

.fui-chat:before {
    content: "\\e62d";
}

.fui-home:before {
    content: "\\e62e";
}

.fui-user:before {
    content: "\\e631";
}

#l2d-conf{
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
}
table.hclonely {
    font-family: verdana,arial,sans-serif !important;
    font-size: 11px !important;
    color: #333333 !important;
    border-width: 1px !important;
    border-color: #999999 !important;
    border-collapse: collapse !important;
}

table.hclonely th {
    background-color: #c3dde0 !important;
    border-width: 1px !important;
    padding: 8px !important;
    border-style: solid !important;
    border-color: #a9c6c9 !important;
}

table.hclonely tr {
    background-color: #d4e3e5 !important;
}

table.hclonely td {
    border-width: 1px !important;
    padding: 8px !important;
    border-style: solid !important;
    border-color: #a9c6c9 !important;
}

table.hclonely a {
    color: #2196F3 !important;
}

table.hclonely input {
    -webkit-writing-mode: horizontal-tb !important;
    text-rendering: auto !important;
    color: initial !important;
    letter-spacing: normal !important;
    word-spacing: normal !important;
    text-transform: none !important;
    text-indent: 0px !important;
    text-shadow: none !important;
    display: inline-block !important;
    text-align: start !important;
    -webkit-appearance: textfield !important;
    background-color: white !important;
    -webkit-rtl-ordering: logical !important;
    cursor: text !important;
    margin: 0em !important;
    font: 400 13.3333px Arial !important;
    padding: 1px 0px !important;
    border-width: 2px !important;
    border-style: inset !important;
    border-color: initial !important;
    border-image: initial !important;
}

table.hclonely input[type=text] {
    width: 160px !important;
    background: #fff !important;
    margin: 0 !important;
    font-size: 13px !important;
    border: 1px solid transparent !important;
    border-top-color: rgba(0,0,0,.07) !important;
}

table.hclonely input[type="checkbox"] {
    background-color: initial !important;
    cursor: default !important;
    -webkit-appearance: checkbox !important;
    box-sizing: border-box !important;
    margin: 3px 3px 3px 4px !important;
    padding: initial !important;
    border: initial !important;
}

.swal-modal{
    width: 70%;
}
`)
})()
