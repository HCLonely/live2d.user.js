// ==UserScript==
// @name         live2D看板娘
// @namespace    live2d.js
// @version      1.2.6
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
// @resource     modelList https://cdn.jsdelivr.net/gh/hclonely/live2d.user.js@1.2.6/models/modelList.json
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
// @resource     modelList https://cdn.jsdelivr.net/gh/hclonely/live2d.user.js@1.2.6/live2d.core.min.js
// @noframes
// @connect      cdn.jsdelivr.net
// @connect      cubism.live2d.com
// @connect      live2d-api.hclonely.com
// @connect      github.com
// @connect      *
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
