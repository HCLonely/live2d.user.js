// ==UserScript==
// @name         live2D看板娘
// @namespace    live2d.js
// @version      1.3.1
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
// @require      https://cdn.jsdelivr.net/gh/hclonely/live2d.user.js@1.3.0/live2d.core.min.js
// @resource     modelList https://cdn.jsdelivr.net/gh/hclonely/live2d.user.js@1.3.0/models/modelList.json
// @resource     style https://cdn.jsdelivr.net/gh/hclonely/live2d.user.js@1.3.0/style.min.css
// @resource     eot https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.eot
// @resource     ttf https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.ttf
// @resource     woff https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.woff
// @resource     woff2 https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.woff2
// @resource     svg https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.svg
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
// @connect      cdn.jsdelivr.net
// @connect      github.com
// @connect      *
// @noframes
// ==/UserScript==

/* eslint-disable camelcase,no-global-assign */
/* global $,jQuery,swal,GM_setValue,GM_getValue,GM_addStyle,GM_xmlhttpRequest,GM_registerMenuCommand,GM_info,GM_getResourceText */
/* global waifuResize,loadlive2d,showWelcomeMessage,getActed,hitokotoTimer,hitokotoInterval */

(function () {
  'use strict'

  if ($('.waifu').length > 0) return 0

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

  $('body').append('<div class="waifu" style="z-index:9999999999;pointer-events: none;"><div class="waifu-tips"></div><canvas id="live2d" class="live2d"></canvas><div class="waifu-tool"><span class="fui-home"></span> <span class="fui-chat"></span> <span class="fui-eye"></span> <span class="fui-user"></span> <span class="fui-photo"></span> <span class="fui-info-circle"></span> <span class="fui-cross"></span></div></div>')

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

  initModel(waifuJSON)

  switch (GM_getValue('mode')) {
    case 'interactive':
      $('div.waifu').css('pointer-events', 'all')
      break
    default:
      $('div.waifu').css('pointer-events', 'none')
      break
  }

  GM_addStyle(GM_getResourceText('style')
    .replace(/__EOT__/g, 'https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.eot')
    .replace(/__WOFF2__/g, 'https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.woff2')
    .replace(/__WOFF__/g, 'https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.woff')
    .replace(/__TTF__/g, 'https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.ttf')
    .replace(/__SVG__/g, 'https://cdn.jsdelivr.net/gh/HCLonely/live2d.user.js@1.3.0/source/flat-ui-icons-regular.svg'))
})()
